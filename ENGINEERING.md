# ENGINEERING.md — TerraHawk Specification Registry

> Every feature follows the same 6-stage pipeline: FR → UC → Technical Design → Acceptance Criteria → Edge Cases → Dependencies.

---

## Table of Contents

| ID | Feature | Status |
|---|---|---|
| [FR-001](#fr-001) | RTSP Camera Streaming via MediaMTX | ✅ Shipped |
| [FR-002](#fr-002) | WebRTC Live Stream with Automatic Fallback | ✅ Shipped |
| [FR-003](#fr-003) | Real-Time Object Detection (YOLO) | ✅ Shipped |
| [FR-004](#fr-004) | Persistent Object Tracking (ByteTrack) | ✅ Shipped |
| [FR-005](#fr-005) | CV Bounding Box Overlay on Live Feed | ✅ Shipped |
| [FR-006](#fr-006) | ESP32 Sensor Ingestion via MQTT | ✅ Shipped |
| [FR-007](#fr-007) | Real-Time Sensor Telemetry on Frontend | ✅ Shipped |
| [FR-008](#fr-008) | Stream Health Metrics (FPS / Latency) | ✅ Shipped |
| [FR-009](#fr-009) | NCNN Model Export with FP16 Quantization | ✅ Shipped |
| | | |
| | **— Planned —** | |
| [FR-010](#fr-010) | Sensor Threshold Alerting & Actuator Commands via MQTT | 🔲 Planned |
| [FR-011](#fr-011) | Multi-Camera Support & Camera Switching | 🔲 Planned |
| [FR-012](#fr-012) | Configurable CV Overlay Display Modes | ✅ Shipped |

---

## FR-001

### RTSP Camera Streaming via MediaMTX

| Stage | Detail |
|---|---|
| **Functional Requirement** | Capture video from the Raspberry Pi Camera Module and serve it as a network stream accessible by other services on the local network |
| **Use Case** | The CV pipeline and any external client can consume a live camera feed via standard streaming protocols (RTSP, WebRTC, HLS) without coupling directly to libcamera |
| **Technical Design** | MediaMTX binary runs on the Pi, configured with `source: rpiCamera` in `mediamtx.yml`. Captures via libcamera at 640×640 @ 15 FPS. Serves RTSP on `:8554/stream`, WebRTC on `:8889/stream`, HLS on `:8888/stream`. `install.sh` fetches the latest release and patches the config. `start.sh` launches it as a background process with log output to `mediamtx/mediamtx.log` |
| **Acceptance Criteria** | ① `rpicam-hello` succeeds on the Pi ② RTSP stream is consumable at `rtsp://localhost:8554/stream` ③ WebRTC endpoint responds at `http://<pi-ip>:8889/stream` ④ Stream maintains 15 FPS at 640×640 ⑤ `start.sh` launches MediaMTX and cleans up on `Ctrl+C` |
| **Edge Cases** | Camera cable loose → MediaMTX logs `ERR [RPI Camera source] process exited unexpectedly`, stream unavailable. Unsupported resolution/FPS → stream connects then drops, check `mediamtx.log`. Binary not found → `start.sh` exits with error before launching uvicorn |
| **Dependencies** | Pi OS Bookworm 64-bit, libcamera installed, camera module physically connected and enabled |

---

## FR-002

### WebRTC Live Stream with Automatic Fallback

| Stage | Detail |
|---|---|
| **Functional Requirement** | Display the Pi camera stream in the browser via WebRTC, with seamless fallback to a simulated video when the stream is unreachable |
| **Use Case** | User opens the Live Feed page — if the Pi is online they see the live camera; if it's offline, a simulated terrarium feed plays with a "simulated" status indicator. No error screens, no broken UI |
| **Technical Design** | `LiveStream.tsx` initiates a WHEP handshake: creates an `RTCPeerConnection`, generates an SDP offer, POSTs it to `VITE_LIVESTREAM_URL`, sets the SDP answer as remote description. `ontrack` event captures the `MediaStream` and attaches it to a `<video>` element. 6-second timeout — if connection state doesn't reach `"connected"`, falls back to a looping `sim-terrarium.mp4`. Status exposed via `onStatusChange` callback: `idle → connecting → live | simulated` |
| **Acceptance Criteria** | ① Live stream renders within 6s when Pi is reachable ② Fallback video plays within 6s when Pi is offline ③ Status indicator shows correct state (live/connecting/simulated) ④ No console errors or broken UI in either path ⑤ Transition between live and simulated is visually seamless |
| **Edge Cases** | `VITE_LIVESTREAM_URL` not set → immediate fallback to simulated. WHEP POST returns non-200 → fallback. ICE negotiation fails → `connectionState` becomes `"failed"`, triggers fallback. Stream drops mid-session → `connectionState` becomes `"disconnected"`, triggers fallback |
| **Dependencies** | FR-001 (MediaMTX running on Pi), `VITE_LIVESTREAM_URL` env var configured, STUN server reachable (`stun.l.google.com:19302`) |

---

## FR-003

### Real-Time Object Detection (YOLO)

| Stage | Detail |
|---|---|
| **Functional Requirement** | Run object detection inference on every captured camera frame and produce structured detection results |
| **Use Case** | The system identifies and classifies objects (people, animals, vehicles, etc.) visible in the camera feed in real time |
| **Technical Design** | `video.py` runs two daemon threads launched at FastAPI startup. **Reader thread:** connects to RTSP stream via OpenCV `VideoCapture`, reads frames as fast as possible, stores only the latest frame (drop-oldest to avoid lag). **Inference thread:** grabs latest frame, runs `model(source=frame, imgsz=IMGSZ, conf=CONFIDENCE, iou=IOU)` via Ultralytics YOLO26n, converts results to Supervision `Detections`, writes to shared `cv_state` dict. All bbox coordinates normalized to 0–1 range |
| **Acceptance Criteria** | ① Detections produced for each frame with label, confidence, and normalized bbox ② No frame queue buildup (drop-oldest strategy) ③ Configurable via `.env`: model, image size, confidence threshold, IOU threshold ④ Inference runs continuously without memory leaks ⑤ `cv_state` always reflects the latest frame's results |
| **Edge Cases** | RTSP stream unavailable → reader thread reconnects after `RECONNECT_DELAY` seconds. Consecutive frame read failures exceed `MAX_CONSECUTIVE_FAILURES` → stream reconnect triggered. No objects in frame → `cv_state.objects` is empty list. Model file missing → Ultralytics auto-downloads on first run (requires internet) |
| **Dependencies** | FR-001 (RTSP stream), YOLO model file (auto-downloaded or pre-placed), `.env` configured |

---

## FR-004

### Persistent Object Tracking (ByteTrack)

| Stage | Detail |
|---|---|
| **Functional Requirement** | Assign persistent tracker IDs to detected objects across consecutive frames |
| **Use Case** | A person walks across the camera view and maintains the same ID label (e.g. `PERSON [#3]`) throughout their trajectory, rather than getting a new detection ID every frame |
| **Technical Design** | Supervision's `ByteTrack` tracker is initialized once at module level in `video.py`. After each YOLO inference, raw detections are passed through `tracker.update_with_detections(detections)`, which assigns and maintains `tracker_id` values across frames. The tracker ID is included in each object dict pushed to `cv_state` |
| **Acceptance Criteria** | ① Objects maintain the same `id` across consecutive frames while visible ② New objects get new IDs ③ Objects that leave and re-enter the frame may get new IDs (expected ByteTrack behaviour) ④ Tracker adds negligible latency to the inference pipeline |
| **Edge Cases** | Object occluded briefly → ByteTrack may maintain or reassign ID depending on occlusion duration. Many objects (>50) → tracker performance may degrade, monitor FPS. No detections → tracker returns empty, no crash |
| **Dependencies** | FR-003 (YOLO detections as input to tracker) |

---

## FR-005

### CV Bounding Box Overlay on Live Feed

| Stage | Detail |
|---|---|
| **Functional Requirement** | Link bounding box coordinates from detection inference between frontend and backend |
| **Use Case** | User sees overlaid bounding boxes on detected objects in the Live Feed, updating in real time |
| **Technical Design** | Backend: YOLO → normalized bbox (0–1) → `cv_state` dict → pushed via `/ws/cv` WebSocket at ~50 Hz. Frontend: `useSensorData` hook receives `CVData` via WebSocket, `LiveFeed.tsx` renders absolutely-positioned `<div>` overlays using percentage values (`left`, `top`, `width`, `height` as `bbox.x * 100%` etc.) over the WebRTC video. Each overlay shows a label + confidence percentage + animated accent pulse dot. Styled as HUD elements (mono font, uppercase, accent colour) |
| **Acceptance Criteria** | ① Boxes track objects smoothly with no visible frame lag ② Coordinates are resolution-independent (normalized 0–1) ③ Label + confidence displayed per box ④ At least 15 overlay updates/sec rendered on the frontend ⑤ Overlays align correctly with objects in the video regardless of viewport size |
| **Edge Cases** | No detections → no overlays rendered (clean feed). WebSocket drops → overlays freeze on last state, hook reconnects after 3s. Backend offline → `cvData` is null, overlay section renders nothing. High object count → DOM may lag with >100 overlay divs, acceptable for typical use (<20 objects) |
| **Dependencies** | FR-002 (WebRTC stream as visual layer), FR-003 (detection data), FR-004 (tracker IDs for stable labels) |

---

## FR-006

### ESP32 Sensor Ingestion via MQTT

| Stage | Detail |
|---|---|
| **Functional Requirement** | Receive environmental sensor readings from an ESP32 microcontroller over MQTT and store them in application state |
| **Use Case** | The ESP32 publishes temperature and humidity readings from its DHT sensor; the Pi backend receives and stores them for downstream consumers (WebSocket, logging, future alerting) |
| **Technical Design** | `mqtt_client.py` creates a `paho.mqtt.Client`, connects to the local Mosquitto broker at `localhost:1883`, subscribes to `pi/inbox`. `on_message` callback parses JSON payloads and updates the shared `sensor_state` dict with `status`, `temperature`, `humidity`, and `soil` (placeholder). The MQTT client is instantiated at FastAPI module import and runs `loop_start()` in a background thread. Outbound topic `esp32/inbox` is defined for future Pi → ESP32 commands |
| **Acceptance Criteria** | ① Sensor data received and parsed within 1s of ESP32 publish ② `sensor_state` reflects latest values ③ Invalid JSON payloads are caught and logged, not crash the server ④ MQTT client reconnects automatically if broker restarts ⑤ `soil` field present as placeholder (value `0`) |
| **Edge Cases** | Mosquitto not running → MQTT client fails to connect at startup (FastAPI still starts, sensors show null). ESP32 offline → `sensor_state` retains last known values. Malformed JSON → `JSONDecodeError` caught, raises error string (should be logged, not re-raised — known minor issue). Broker restart → paho `loop_start()` handles reconnection automatically |
| **Dependencies** | Mosquitto broker installed and running on Pi, ESP32 flashed with MQTT publish firmware, DHT sensor wired to ESP32 |

---

## FR-007

### Real-Time Sensor Telemetry on Frontend

| Stage | Detail |
|---|---|
| **Functional Requirement** | Display live sensor data on the frontend HUD, updating in real time |
| **Use Case** | User sees temperature (°C), humidity (%), and soil moisture (%) as large telemetry readouts on the Live Feed page, updating every 200ms |
| **Technical Design** | `useSensorData.ts` hook opens a WebSocket to `ws://localhost:8000/ws/sensors`. Incoming JSON is merged into a flat `Record<string, unknown>` state via `setData(prev => ({...prev, ...parsed}))`. `LiveFeed.tsx` maps sensor keys through `LIVE_METRIC_CONFIG` (label + unit lookup) and renders each as a HUD telemetry block: label with accent dot, large display number (Fraunces font), unit suffix. Dynamic — any new key the backend adds will render automatically with a fallback label |
| **Acceptance Criteria** | ① Sensor values update visually at 5 Hz ② Null values display as "N/A" with no unit ③ Temperature shows 1 decimal place, others show integers ④ New sensor keys from the backend render without frontend code changes ⑤ Disconnection shows "disconnected" status, reconnects after 3s |
| **Edge Cases** | Backend offline → initial state shows null values, status "connecting", then "disconnected" after WebSocket fails. Reconnect loop runs every 3s. Unexpected data types → `String(value)` fallback prevents crash. Unmount during reconnect → cleanup clears timeout and closes socket cleanly |
| **Dependencies** | FR-006 (sensor data available in backend state), FastAPI `/ws/sensors` endpoint running |

---

## FR-008

### Stream Health Metrics (FPS / Latency)

| Stage | Detail |
|---|---|
| **Functional Requirement** | Expose WebRTC stream performance metrics to the user |
| **Use Case** | The Live Feed HUD displays `[15FPS · 42MS]` next to the REC indicator, giving real-time visibility into stream health |
| **Technical Design** | `LiveStream.tsx` polls `RTCPeerConnection.getStats()` every 1 second when status is `"live"`. Extracts `framesPerSecond` from `inbound-rtp` (video) reports and `currentRoundTripTime` from `candidate-pair` (succeeded) reports. Converts RTT to milliseconds. Stats are exposed via `onStats` callback to the parent `LiveFeed.tsx`, which renders them in the top HUD bar |
| **Acceptance Criteria** | ① FPS and latency values displayed when stream is live ② Values update every 1s ③ Metrics hidden when stream is not live (connecting or simulated) ④ `getStats` errors are caught and logged, not crash the component ⑤ Values are rounded to integers for clean display |
| **Edge Cases** | `getStats()` returns no matching reports → FPS/latency show as 0. PeerConnection closed between polls → error caught by try/catch, interval continues. Browser doesn't support `getStats()` → graceful no-op, no metrics shown |
| **Dependencies** | FR-002 (active WebRTC connection) |

---

## FR-009

### NCNN Model Export with FP16 Quantization

| Stage | Detail |
|---|---|
| **Functional Requirement** | Export the YOLO detection model to NCNN format with FP16 quantization for optimized edge inference on the Pi's ARM CPU |
| **Use Case** | Inference runs at higher FPS on the Pi compared to the full PyTorch model, enabling smoother real-time detection |
| **Technical Design** | `export.py` loads the YOLO26n model via Ultralytics and calls `model.export(format="ncnn", half=True)`. This produces an NCNN model directory (e.g. `yolo26n_ncnn_model/`) containing `.param` and `.bin` files. The exported model can be referenced in `.env` as `MODEL=yolo26n_ncnn_model` to use it for inference instead of the `.pt` file. NCNN inference backend is installed via the `ncnn` and `pnnx` Python packages |
| **Acceptance Criteria** | ① Export script runs without errors ② Output directory contains valid `.param` + `.bin` files ③ Exported model loads and produces detections via Ultralytics API ④ FP16 model is smaller than FP32 equivalent ⑤ Inference FPS improves compared to PyTorch `.pt` on the Pi |
| **Edge Cases** | Export on Mac (x86/ARM) → produces NCNN files but they should be re-exported on the Pi for optimal ARM compatibility. Insufficient disk space → export fails, check available storage. Model not found → Ultralytics attempts download (requires internet) |
| **Dependencies** | YOLO model available (`.pt`), `ncnn` and `pnnx` packages installed, sufficient disk space for exported model |

---

## FR-010

### Sensor Threshold Alerting & Actuator Commands via MQTT

| Stage | Detail |
|---|---|
| **Functional Requirement** | Define configurable thresholds for sensor values and publish actuator commands back to the ESP32 when thresholds are breached |
| **Use Case** | Temperature exceeds 35°C → Pi publishes a command to `esp32/inbox` to activate a fan relay. Soil moisture drops below 20% → pump relay activates. The system reacts autonomously without human intervention |
| **Technical Design** | New `alerts.py` module with a threshold engine. Configurable rules via `.env` or a `thresholds.json` file (e.g. `{"temperature": {"max": 35, "action": "fan_on"}, "soil": {"min": 20, "action": "pump_on"}}`). A background async task polls `sensor_state` at 1 Hz, evaluates rules, and publishes JSON commands to `esp32/inbox` via the existing MQTT client. Cooldown period per rule to prevent rapid toggling. Frontend: alert banner on Live Feed when a threshold is active, showing which rule fired and the current value |
| **Acceptance Criteria** | ① Threshold breach triggers MQTT publish to `esp32/inbox` within 2s ② Cooldown prevents re-triggering for configurable duration (default 60s) ③ Threshold rules are configurable without code changes ④ Frontend displays active alerts on the Live Feed HUD ⑤ Manual override: API endpoint to force-publish actuator commands ⑥ Alert history logged with timestamp, rule, value, and action taken |
| **Edge Cases** | Sensor value oscillates around threshold → cooldown prevents rapid toggling. MQTT broker down → commands queued or logged, not lost silently. ESP32 offline → command published but unacknowledged (fire-and-forget, QoS 0). Multiple thresholds breached simultaneously → all fire independently. Sensor value is `null` → rule skipped, not evaluated |
| **Dependencies** | FR-006 (MQTT client with publish capability), ESP32 firmware updated to subscribe to `esp32/inbox` and act on commands, relay hardware wired to ESP32 GPIO |

---

## FR-011

### Multi-Camera Support & Camera Switching

| Stage | Detail |
|---|---|
| **Functional Requirement** | Support multiple camera streams from MediaMTX and allow the user to switch between them on the frontend |
| **Use Case** | A farm deployment has cameras on the nursery, main field, and entry gate. The user opens the Live Feed and selects which camera to view from a dropdown or tab bar — each stream has its own YOLO inference and detection overlays |
| **Technical Design** | **Backend:** `video.py` refactored to support multiple pipelines. A config file (`cameras.json`) defines available streams: `[{"id": "cam-01", "name": "Nursery", "rtsp": "rtsp://localhost:8554/nursery"}, ...]`. Each camera gets its own reader + inference thread pair and its own `cv_state` keyed by camera ID. New WebSocket endpoint `/ws/cv/{camera_id}` or a single `/ws/cv` that accepts a camera ID filter. New REST endpoint `GET /cameras` returns the list of available cameras. **MediaMTX:** additional paths in `mediamtx.yml` for each camera source (USB cameras, additional Pi cameras via multiplexer, or network cameras via RTSP pull). **Frontend:** `LiveStream.tsx` accepts a `streamUrl` prop. `LiveFeed.tsx` adds a camera selector (HUD-styled tabs or dropdown). `useSensorData` hook updated to connect to the selected camera's CV WebSocket. Camera switch triggers new WebRTC WHEP handshake + CV WebSocket reconnect |
| **Acceptance Criteria** | ① `GET /cameras` returns list of configured cameras with ID, name, and status ② Switching cameras loads the new stream within 6s (same timeout as FR-002) ③ CV overlays correspond to the selected camera's detections ④ Each camera runs independent inference — switching doesn't interrupt other pipelines ⑤ Fallback to simulated feed works per-camera independently ⑥ Adding a new camera requires only config change, no code modification |
| **Edge Cases** | Camera offline → that specific stream falls back to simulated, others unaffected. All cameras offline → all show simulated. Camera added to config while server running → requires restart (acceptable for v1). USB camera disconnects → reader thread reconnects per existing logic. Resource exhaustion (too many cameras) → document recommended max based on Pi 5 capability (likely 2–3 concurrent YOLO pipelines) |
| **Dependencies** | FR-001 (MediaMTX multi-path support), FR-002 (WebRTC per stream), FR-003 (independent inference per camera), additional camera hardware |

---

## FR-012

### Configurable CV Overlay Display Modes

| Stage | Detail |
|---|---|
| **Functional Requirement** | Allow the user to toggle individual CV overlay elements on the Live Feed — labels, confidence scores, bounding boxes — independently or in combination |
| **Use Case** | User is reviewing the live feed and wants to see only bounding boxes without label clutter. Or they want labels + confidence but no boxes. Or they want the clean feed with nothing. They toggle each element on/off from a HUD control panel and the display updates instantly |
| **Technical Design** | **State:** New React state object in `LiveFeed.tsx`: `overlayConfig: { boxes: boolean, labels: boolean, confidence: boolean }` — all default to `true`. Persisted to `localStorage` so preferences survive page reloads. **UI control:** Minimal HUD-styled toggle panel (bottom-left or top-right), using three small toggle switches or icon buttons: `▢ Boxes`, `Aᴀ Labels`, `% Conf`. Panel is collapsible to a single icon to keep the feed clean. **Rendering:** The CV overlay `map()` in `LiveFeed.tsx` conditionally renders each element based on `overlayConfig`: bounding box border (`border` class toggled), label text span, confidence text span. When all three are off, the overlay div is still positioned (for future interaction like click-to-inspect) but renders nothing visible. **Keyboard shortcuts (stretch):** `B` toggles boxes, `L` toggles labels, `C` toggles confidence, `H` hides all |
| **Acceptance Criteria** | ① Each element (boxes, labels, confidence) can be toggled independently ② All 8 combinations work correctly (3 toggles = 8 states including all-off) ③ Toggle state persists across page reloads via `localStorage` ④ Toggling is instant — no WebSocket reconnect or data refetch ⑤ Toggle panel is visually consistent with the HUD design language ⑥ Toggle panel can be collapsed to minimise visual noise ⑦ Clean feed (all off) shows no residual overlay artifacts |
| **Edge Cases** | `localStorage` unavailable (private browsing) → defaults to all-on, no error. No detections → toggle panel still visible and functional, just nothing to show. High object count with all elements on → same DOM concern as FR-005 (acceptable for <20 objects). Page loads with stale `localStorage` config (e.g. after adding a new toggle option in future) → merge with defaults, don't break |
| **Dependencies** | FR-005 (existing CV overlay rendering as baseline to extend) |

---

## How to Use This Document

1. **New feature?** Copy the FR-010 template, assign the next ID, fill in all 6 stages
2. **Implementation** — reference the FR ID in commits and PRs (e.g. `implements FR-011`)
3. **Review** — acceptance criteria are your definition of done
4. **Status** — update the table of contents as features move from 🔲 Planned → 🚧 In Progress → ✅ Shipped
