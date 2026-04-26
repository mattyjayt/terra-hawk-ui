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
| [FR-011](#fr-011) | Distributed System Registry & Multi-System Architecture (Phase 1) | ✅ Shipped |
| [FR-012](#fr-012) | Configurable CV Overlay Display Modes | ✅ Shipped |
| [FR-013](#fr-013) | Settings Page — CV & Agentic AI Configuration | 🚧 In Progress |
| | | |
| | **— Agentic AI: Core Infrastructure —** | |
| [FR-014](#fr-014) | Agent Backend Service | 🔲 Planned |
| [FR-015](#fr-015) | Agent Chat Interface | 🔲 Planned |
| [FR-016](#fr-016) | Agent Context Window Management | 🔲 Planned |
| [FR-017](#fr-017) | Agent Provider Abstraction | 🔲 Planned |
| | | |
| | **— Agentic AI: Autonomous Decision Making —** | |
| [FR-018](#fr-018) | Sensor-Triggered Agent Reasoning | 🔲 Planned |
| [FR-019](#fr-019) | Agent Action Execution (Actuator Control) | 🔲 Planned |
| [FR-020](#fr-020) | Scheduled Agent Routines | 🔲 Planned |
| [FR-021](#fr-021) | Anomaly Detection & Alerting | 🔲 Planned |
| | | |
| | **— Agentic AI: Knowledge & Memory —** | |
| [FR-022](#fr-022) | Farm Knowledge Base (RAG) | 🔲 Planned |
| [FR-023](#fr-023) | Agent Memory & Learning | 🔲 Planned |
| [FR-024](#fr-024) | Crop Profile Management | 🔲 Planned |
| | | |
| | **— Agentic AI: CV Integration —** | |
| [FR-025](#fr-025) | CV Event Summarisation | 🔲 Planned |
| [FR-026](#fr-026) | Visual Question Answering | 🔲 Planned |
| [FR-027](#fr-027) | Disease & Pest Detection via CV | 🔲 Planned |
| | | |
| | **— Agentic AI: Reporting & Communication —** | |
| [FR-028](#fr-028) | Daily Farm Report Generation | 🔲 Planned |
| [FR-029](#fr-029) | Multi-Channel Notifications | 🔲 Planned |
| [FR-030](#fr-030) | Natural Language Farm Dashboard | 🔲 Planned |
| | | |
| | **— Agentic AI: Safety & Control —** | |
| [FR-031](#fr-031) | Agent Action Approval Mode | 🔲 Planned |
| [FR-032](#fr-032) | Agent Audit Log | 🔲 Planned |
| [FR-033](#fr-033) | Agent Kill Switch | 🔲 Planned |

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

### Distributed System Registry & Multi-System Architecture

| Stage | Detail |
|---|---|
| **Functional Requirement** | Support a registry of distributed systems (Pi, ESP32, Arduino — each with optional camera, sensors, and actuators) that connect to a central TerraHawk backend, with per-system CV pipelines, sensor streams, and namespaced MQTT topics |
| **Use Case** | A farm has three deployments: System 01 (Pi 5 + camera + ESP32 sensors in the nursery), System 02 (ESP32-CAM at the gate), System 03 (Pi Zero + USB cam in the greenhouse). Each appears in the app with its name, location, and components. The user switches between systems to view their live feed, detections, and sensor data. Adding a new system means editing one config file |
| **Technical Design** | **Phase 1 (current — same WiFi, manual config):** `systems.json` registry file defines all known systems. Each system has: `id`, `name`, `location`, `controller` (type + IP), and `components` (camera, sensors, actuators — each optional with their own config). New `systems.py` module loads the registry, validates entries, provides `get_systems()`, `get_system(id)`. **`video.py` refactored:** `start_thread()` replaced by `start_pipelines()` — iterates all systems with cameras, spawns a reader + inference thread pair per system. Each system gets its own `cv_state[system_id]` and `sensor_state[system_id]`. For cameras: Pi cameras use RTSP via MediaMTX, ESP32-CAMs use MJPEG over HTTP — both consumed via `cv2.VideoCapture(url)`. Inference location controlled by `runs_on` field: `"self"` = system runs its own inference and pushes results, `"central"` = central backend pulls stream and runs inference. **MQTT namespacing:** topics change from `pi/inbox` to `terrahawk/{system_id}/sensors` and `terrahawk/{system_id}/commands`. MQTT client subscribes to `terrahawk/+/sensors` wildcard, routes by system ID. **API:** `GET /systems` returns all systems with status. `GET /systems/{id}` returns single system. WebSocket endpoints become `/ws/cv/{system_id}` and `/ws/sensors/{system_id}`. Legacy `/ws/cv` and `/ws/sensors` route to default system. **Health monitoring:** background ping loop checks each system's controller IP every 30s, updates `status` field (online/offline/degraded). **Phase 2 (planned — CLI registration):** `add_system.sh` script that validates connectivity, probes stream URLs, generates registry entry, hot-reloads backend. **Phase 3 (planned — hosting):** `POST /systems/register` REST endpoint for remote self-registration with approval flow. Authentication via API keys per system. **Phase 4 (planned — auto-discovery):** mDNS broadcast from systems, central auto-detects and proposes registration |
| **Acceptance Criteria** | ① `systems.json` defines all systems and their components ② `GET /systems` returns the full registry with live status ③ Each system with a camera gets its own reader + inference thread pair ④ `cv_state` and `sensor_state` are keyed by system ID ⑤ MQTT topics namespaced by system ID ⑥ Adding a new system requires only a `systems.json` edit + restart ⑦ Existing single-system setup (System 01) works identically after refactor ⑧ Systems without cameras still appear in registry (sensors-only systems) ⑨ Health status updates within 30s of a system going online/offline |
| **Edge Cases** | System offline → status shows "offline", camera falls back to simulated, sensor data shows null. Duplicate system IDs in config → rejected at startup with clear error. System has camera but `runs_on: central` and central is overloaded → inference FPS degrades gracefully. MQTT broker restart → clients reconnect automatically. `systems.json` missing → fallback to single-system mode using `.env` config (backwards compatible). ESP32-CAM MJPEG stream slower than RTSP → reader thread handles variable frame rates naturally |
| **Dependencies** | FR-001 (RTSP streaming for Pi cameras), FR-003 (inference pipeline to replicate per system), FR-006 (MQTT client refactored for namespacing) |

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

## FR-013

### Settings Page — CV & Agentic AI Configuration

| Stage | Detail |
|---|---|
| **Functional Requirement** | Provide a settings page with two categories (Computer Vision and Agentic AI) that allows users to view system status and dynamically configure runtime parameters — including hot-swapping the active detection model |
| **Use Case** | User navigates to `/settings`, sees the current model (yolo26n) running at 12 FPS with 83ms latency. They select `yolo26n_ncnn_model` from a dropdown populated by the backend, adjust confidence to 0.6, and hit Apply. The inference pipeline hot-swaps the model without restarting the server. On the Agentic AI tab, placeholder settings are visible but disabled with a "coming soon" indicator |
| **Technical Design** | **Backend — New endpoints in `main.py`:** ① `GET /settings` — returns full current config (model, confidence, IOU, imgsz, stream resolution, stream FPS) plus system status (inference FPS, latency, active tracker count). ② `GET /settings/models` — scans the working directory for `*.pt` files and `*_ncnn_model/` directories, returns list with name, format, and file size. ③ `PUT /settings` — accepts partial config update, validates values, applies changes at runtime. For model swap: acquires inference lock, replaces the `model` object in `video.py`, resets the tracker. For confidence/IOU/imgsz: updates the variables read by the inference loop (immediate effect, no restart). For stream resolution/FPS: writes new `mediamtx.yml` paths section and flags "restart required". **Backend — Shared config module (`config.py`):** Centralises all runtime settings currently scattered across `.env` reads in `video.py`. Provides `get_config()` and `update_config()` with thread-safe access. The inference thread reads from this config each iteration instead of module-level constants. **Frontend — New route `/settings` + page `Settings.tsx`:** Two-tab layout (Computer Vision / Agentic AI). CV tab contains: read-only status card (model name, FPS, latency), model dropdown (populated from `/settings/models`), confidence slider, IOU slider, inference resolution dropdown, stream resolution dropdown, stream FPS dropdown, overlay toggles (syncs with FR-012 localStorage). Apply button POSTs to `PUT /settings`. Reset button restores `.env` defaults. Agentic AI tab: placeholder cards for agent provider, model, mode, thresholds, memory — all disabled with "coming soon" badges. **Styling:** Follows HUD design language — dark glass cards, mono labels, accent sliders, consistent with existing pages. Nav updated to include settings link |
| **Acceptance Criteria** | ① `GET /settings/models` returns all locally available models with name, format (pytorch/ncnn), and size ② Model hot-swap completes within 5s, inference resumes automatically on new model ③ Confidence/IOU/imgsz changes take effect on the next inference frame (no restart) ④ Stream config changes flag "restart required" in the UI ⑤ Settings page loads current values from the backend, not hardcoded defaults ⑥ Apply sends only changed values (partial update) ⑦ Reset restores original `.env` defaults ⑧ Agentic AI tab is visible but all controls are disabled with "coming soon" ⑨ Settings page is accessible from the main navigation ⑩ Invalid values (e.g. confidence > 1.0) are rejected by the backend with a 422 response |
| **Edge Cases** | Model file deleted while selected → backend returns 404 on swap attempt, current model continues running. Model swap during active detections → inference lock prevents partial state. Large model loading time → frontend shows loading spinner, timeout at 30s. Backend offline → settings page shows connection error, retry button. Concurrent settings updates → last write wins (acceptable for single-user system). `.env` file missing → config module uses hardcoded defaults |
| **Dependencies** | FR-003 (inference pipeline to reconfigure), FR-009 (NCNN models as swap targets), FR-012 (overlay toggles surfaced in settings) |

---

---

# Agentic AI — Functional Requirements

---

## FR-014

### Agent Backend Service

| Stage | Detail |
|---|---|
| **Functional Requirement** | LLM-powered agent service that receives farm context (sensors, CV detections, alerts) and produces decisions, recommendations, or natural language reports |
| **Use Case** | The agent runs as a backend service alongside FastAPI. When invoked — by user chat, sensor trigger, or schedule — it receives a structured context payload, reasons about the farm state, and returns an action or response |
| **Technical Design** | New `agent/` package in the backend. Core class `FarmAgent` with `invoke(context, prompt) -> AgentResponse`. Uses LangChain or direct API calls. Context builder assembles latest sensor state, recent CV summary (last N detections aggregated), active alerts, and crop profiles into a structured prompt. Agent response schema: `{"reasoning": str, "action": str|null, "message": str, "confidence": float}`. FastAPI endpoint `POST /agent/invoke` for direct calls. Agent runs in an async thread pool to avoid blocking the event loop. Config: model provider, model name, temperature, max tokens — all from `config.py` |
| **Acceptance Criteria** | ① Agent returns a structured response within 10s for standard queries ② Context payload includes latest sensor + CV + alert data ③ Agent errors (API timeout, rate limit) return graceful error responses, not server crashes ④ Agent is stateless per invocation (memory handled by FR-023) ⑤ Agent service can be disabled entirely via config flag |
| **Edge Cases** | LLM API unreachable → return error response with `"action": null`, log the failure. Context too large for model window → truncate oldest CV events first, then sensor history. Concurrent invocations → each gets its own context snapshot, no shared mutable state. API key missing → agent service starts in disabled mode, returns 503 |
| **Dependencies** | LLM API key configured in `.env`, Python LLM client library (anthropic/openai/google-genai) |

---

## FR-015

### Agent Chat Interface

| Stage | Detail |
|---|---|
| **Functional Requirement** | Frontend page where the user can have a conversation with the farm agent — ask questions, get recommendations, and review the agent's reasoning |
| **Use Case** | User navigates to `/agent` and types "Why is the temperature rising in chamber 01?". The agent receives the question plus full farm context, reasons about it, and responds: "Temperature has risen 4°C in the last hour. Humidity is stable, which rules out irrigation. The west-facing camera shows direct sunlight hitting the dome. Recommend activating the shade motor." |
| **Technical Design** | **Frontend:** New page `Agent.tsx` at route `/agent`. Chat UI with message history (user messages left-aligned, agent right-aligned). Input bar at bottom with send button. Messages stored in React state. Each user message triggers `POST /agent/chat` with `{message, history[]}`. Agent response rendered with markdown support. Typing indicator while waiting. **Backend:** `POST /agent/chat` endpoint. Accepts message + conversation history. Builds context (FR-016), appends to conversation, invokes agent (FR-014), returns response. History managed client-side (sent with each request) — no server-side session state for v1. **Styling:** HUD design language — dark transparent chat bubbles, mono timestamps, accent for agent responses, scanline subtle background |
| **Acceptance Criteria** | ① User can send messages and receive agent responses ② Conversation history maintained within session ③ Agent responses render markdown (bold, lists, code) ④ Typing indicator shown during agent processing ⑤ Chat accessible from main navigation ⑥ Error responses shown inline as system messages ⑦ Chat works on mobile (responsive layout) |
| **Edge Cases** | Agent takes >10s → show extended typing indicator, don't timeout the UI (let backend timeout handle it). Empty message → disabled send button. Rapid messages → queue sequentially, don't fire concurrent agent calls. Page refresh → history lost (acceptable for v1, FR-023 adds persistence). Backend offline → show connection error in chat |
| **Dependencies** | FR-014 (agent backend service), FR-016 (context assembly) |

---

## FR-016

### Agent Context Window Management

| Stage | Detail |
|---|---|
| **Functional Requirement** | Assemble a structured context payload for every agent invocation containing the relevant farm state — sensors, CV detections, alerts, crop profiles, and history |
| **Use Case** | Every time the agent is invoked, it receives a snapshot of the farm: "Temperature: 28.3°C (rising), Humidity: 54% (stable), Soil: 32% (falling). CV: 2 people detected in last 5 min, 1 animal intrusion at 03:22. Active alerts: soil moisture below threshold since 14:00. Chamber 01: tomatoes, week 6 of growth." The agent never operates blind |
| **Technical Design** | New `agent/context.py` module. `build_context() -> FarmContext` dataclass. Sources: ① `sensor_state` — current values + rolling averages (last 1h) from a new `sensor_history` ring buffer ② `cv_state` — current detections + aggregated event log (last N minutes): object counts by class, notable events (new object types, intrusions) ③ `alert_state` — active alerts from FR-010 threshold engine ④ `crop_profiles` — from FR-024 config ⑤ `agent_memory` — relevant past decisions from FR-023. Output formatted as structured text for the LLM system prompt. Token budget: configurable max (default 2000 tokens for context), with priority-based truncation (alerts > sensors > CV > history) |
| **Acceptance Criteria** | ① Context includes all five data sources when available ② Context stays within token budget ③ Missing sources (e.g. no crop profiles configured) are omitted gracefully, not errored ④ Sensor trends (rising/falling/stable) are computed from history ⑤ CV events are deduplicated and aggregated (not raw per-frame detections) |
| **Edge Cases** | All sensors null (ESP32 offline) → context notes "sensor data unavailable". No CV detections in window → context notes "no objects detected". Token budget exceeded → truncate lowest-priority sections with "[truncated]" marker. First boot (no history) → context contains only current state |
| **Dependencies** | FR-006 (sensor data), FR-003/FR-004 (CV detections), FR-010 (alerts, when implemented), FR-024 (crop profiles, when implemented) |

---

## FR-017

### Agent Provider Abstraction

| Stage | Detail |
|---|---|
| **Functional Requirement** | Pluggable LLM backend allowing the agent to use Claude, GPT, Gemini, or a local model (Ollama) — swappable via settings without code changes |
| **Use Case** | User selects "Claude" in settings with model "sonnet-4". Later switches to "Ollama" with a local Llama model for offline operation. The agent behaviour is identical — only the underlying LLM changes |
| **Technical Design** | `agent/providers/` package with a base `LLMProvider` abstract class: `invoke(system_prompt, messages) -> str`. Concrete implementations: `ClaudeProvider`, `OpenAIProvider`, `GeminiProvider`, `OllamaProvider`. Each reads its API key from `.env` (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, etc.). Factory function `get_provider(name) -> LLMProvider` instantiates the correct one. Provider name and model stored in `config.py`, configurable via `PUT /settings`. Ollama provider connects to `localhost:11434` for fully offline operation |
| **Acceptance Criteria** | ① All four providers implement the same interface ② Switching providers via settings takes effect on next agent invocation (no restart) ③ Missing API key for selected provider → clear error message ④ Provider timeout configurable (default 30s) ⑤ Response format is identical regardless of provider |
| **Edge Cases** | Provider API down → error propagated to agent service, handled per FR-014. Rate limited → retry once with backoff, then error. Ollama not running → connection refused, fallback to error response. Model name invalid for provider → provider returns descriptive error |
| **Dependencies** | FR-014 (agent service consumes providers), FR-013 (settings page for provider/model selection) |

---

## FR-018

### Sensor-Triggered Agent Reasoning

| Stage | Detail |
|---|---|
| **Functional Requirement** | When sensor thresholds are breached, invoke the agent with full context to reason about the appropriate response — replacing hardcoded actuator rules with intelligent decision-making |
| **Use Case** | Temperature spikes to 38°C. Instead of blindly activating the fan, the agent evaluates: temperature is high + humidity is also high + CV shows the door is open (person detected at entrance 2 min ago) → "Door likely left open. Recommend closing door before activating cooling. Sending notification." Different context, different action |
| **Technical Design** | Extends FR-010's threshold engine. When a threshold is breached, instead of (or in addition to) firing a direct MQTT command, the engine invokes `FarmAgent.invoke()` with a trigger-specific prompt: "Sensor alert: {sensor} has reached {value}, threshold is {threshold}. Evaluate and recommend action." Agent response includes an `action` field that maps to MQTT commands. If agent mode is "autonomous" (FR-031), the action executes immediately. If "advisory", a notification is sent to the user with the agent's reasoning and a confirm/reject option |
| **Acceptance Criteria** | ① Threshold breach triggers agent invocation within 3s ② Agent receives full context including the triggering sensor, its history, and all other current readings ③ Agent can recommend different actions for the same threshold based on context ④ Agent response is logged (FR-032) ⑤ If agent is unavailable (API down), fall back to hardcoded threshold action from FR-010 |
| **Edge Cases** | Multiple thresholds breach simultaneously → agent invoked once with all breaches in context (batched, not per-sensor). Agent takes too long to respond → hardcoded fallback fires after timeout (configurable, default 10s). Agent recommends an action the system can't execute → log as "unsupported action", notify user. Agent says "do nothing" → respect it, log reasoning |
| **Dependencies** | FR-010 (threshold engine), FR-014 (agent service), FR-016 (context), FR-019 (action execution) |

---

## FR-019

### Agent Action Execution (Actuator Control)

| Stage | Detail |
|---|---|
| **Functional Requirement** | The agent can execute physical actions on the farm by publishing MQTT commands to the ESP32 — fans, pumps, shade motors, lights — as structured tool calls with full audit logging |
| **Use Case** | Agent decides soil moisture is critically low and the crop profile indicates tomatoes in fruiting stage need immediate water. Agent executes `{"action": "pump_on", "duration_sec": 120, "zone": "chamber_01"}` via MQTT. Action is logged with the agent's reasoning chain |
| **Technical Design** | `agent/actions.py` defines available actions as a registry: `{"pump_on": {"topic": "esp32/inbox", "schema": {...}}, "fan_on": {...}, "shade_on": {...}}`. Each action has a JSON schema for parameters. The agent's response `action` field is validated against the registry, parameters are validated against the schema, then published as JSON to the appropriate MQTT topic via the existing `MQTT_Client`. Every execution creates an audit entry (FR-032): timestamp, action, parameters, agent reasoning, context snapshot hash. New `GET /agent/actions` endpoint returns available actions for the frontend settings display |
| **Acceptance Criteria** | ① Agent can trigger any registered action via structured output ② Invalid actions are rejected and logged ③ Every action execution is audit-logged with reasoning ④ Actions include configurable safety limits (max pump duration, max fan runtime) ⑤ Action registry is config-driven, not hardcoded ⑥ Duplicate action suppression (same action within cooldown window) |
| **Edge Cases** | MQTT broker down → action queued in memory (max 10), retried on reconnect. ESP32 doesn't acknowledge → fire-and-forget for v1, log as "unconfirmed". Agent requests unknown action → reject, log, notify user. Safety limit exceeded → cap to max, log the cap. Two actions conflict (fan_on + shade_on simultaneously) → allow for v1, conflict resolution in future |
| **Dependencies** | FR-006 (MQTT client), FR-014 (agent service), FR-032 (audit log) |

---

## FR-020

### Scheduled Agent Routines

| Stage | Detail |
|---|---|
| **Functional Requirement** | Run the agent on configurable schedules to generate reports, perform health checks, and proactively manage the farm without user prompting |
| **Use Case** | Every morning at 07:00, the agent generates a briefing: "Overnight: temp stable 18–20°C, humidity dropped to 45% at 03:00 (recovered by 05:00), no intrusions detected. Today: forecast 32°C, recommend pre-watering at 10:00 and activating shade by 12:00." Sent to the user via their preferred channel |
| **Technical Design** | `agent/scheduler.py` using APScheduler or a simple asyncio cron loop. Configurable routines stored in `routines.json`: `[{"name": "morning_briefing", "cron": "0 7 * * *", "prompt": "Generate morning farm briefing...", "channel": "chat"}, {"name": "health_check", "cron": "0 */6 * * *", "prompt": "Perform farm health check...", "channel": "alert"}]`. Each routine invokes `FarmAgent.invoke()` with the routine's prompt + full farm context. Output routed to the specified channel (frontend chat, notification, stored report). Routine history tracked: last run, last result, next run. New endpoints: `GET /agent/routines` (list), `PUT /agent/routines/{id}` (enable/disable/edit schedule) |
| **Acceptance Criteria** | ① Routines execute at the configured cron time (±30s) ② Each routine receives full farm context at execution time ③ Routine results are stored and retrievable via API ④ Routines can be enabled/disabled without restart ⑤ Missed routines (server was down) are logged as missed, not retroactively executed ⑥ At least 3 default routines: morning briefing, health check (6h), daily summary |
| **Edge Cases** | Server restarts mid-routine → routine marked as interrupted, re-runs at next schedule. Agent API down during routine → logged as failed, retried once after 5 min. Multiple routines scheduled at the same time → executed sequentially. Routine takes >60s → logged as slow, not killed |
| **Dependencies** | FR-014 (agent service), FR-016 (context), FR-029 (notifications for delivery) |

---

## FR-021

### Anomaly Detection & Alerting

| Stage | Detail |
|---|---|
| **Functional Requirement** | Agent monitors sensor and CV data streams for anomalies that simple thresholds cannot catch — gradual drifts, pattern deviations, cross-sensor contradictions, and unusual CV events |
| **Use Case** | Temperature has been rising 0.5°C/hour for 6 hours — no single reading breaches the threshold, but the trend is abnormal. Agent detects this and alerts: "Steady temperature rise detected. At current rate, threshold will be breached in ~4 hours. Recommend investigating ventilation." |
| **Technical Design** | `agent/anomaly.py` runs as a background async task on a configurable interval (default 15 min). Anomaly types: ① **Trend anomaly** — linear regression on sensor history (1h, 6h, 24h windows), alert if slope exceeds configurable threshold. ② **Cross-sensor contradiction** — rules like "humidity high but soil dry" or "temperature high but no sunlight detected". ③ **CV pattern anomaly** — unusual detection patterns: new object class appearing, object count outside normal range for time of day, detections in unusual zones. ④ **Flatline detection** — sensor value unchanged for >30 min (possibly sensor failure). Each anomaly produces a structured alert with severity (info/warning/critical), description, and suggested action. Alerts pushed to the frontend via a new `/ws/alerts` WebSocket |
| **Acceptance Criteria** | ① Trend anomalies detected within one analysis cycle (15 min) ② Cross-sensor contradictions flagged with both readings shown ③ CV pattern anomalies based on rolling 24h baseline ④ Flatline detection distinguishes "truly flat" from "very stable" (configurable tolerance) ⑤ Anomaly alerts include severity, explanation, and suggested action ⑥ False positive rate manageable via sensitivity config |
| **Edge Cases** | Insufficient history (first boot) → skip trend analysis until baseline established (min 2h). Sensor offline → skip that sensor's analysis, don't raise false anomaly. All sensors flat → could be legitimate (stable environment) or total sensor failure — flag as info, not critical. High anomaly volume → deduplicate similar anomalies, aggregate into single alert |
| **Dependencies** | FR-006 (sensor history), FR-003/FR-004 (CV data), FR-016 (context builder for history) |

---

## FR-022

### Farm Knowledge Base (RAG)

| Stage | Detail |
|---|---|
| **Functional Requirement** | Vector store containing agricultural knowledge that the agent queries when making recommendations — crop guides, disease references, pest management, optimal growing conditions |
| **Use Case** | Agent detects early blight symptoms on tomato plants via CV. It queries the knowledge base: retrieves the disease profile, recommended treatment (copper fungicide), prevention steps, and risk to neighbouring crops. Includes this in its response to the user |
| **Technical Design** | ChromaDB vector store running locally on the Pi (or on a companion machine if Pi resources are constrained). `agent/rag.py` handles document ingestion and retrieval. **Ingestion:** markdown/PDF documents in a `knowledge/` directory, chunked (500 tokens, 50 token overlap), embedded via a lightweight model (all-MiniLM-L6-v2 or similar). **Retrieval:** `query(text, k=5) -> list[Document]` returns top-k relevant chunks. **Integration:** Context builder (FR-016) includes RAG results when the agent's prompt relates to crop care, disease, or treatment. Agent can also explicitly request RAG lookup as a tool call. **Seeding:** Ship with a starter knowledge base: common crop care guides for tomatoes, lettuce, herbs, peppers + common diseases + pest identification |
| **Acceptance Criteria** | ① Knowledge base loads and indexes documents on startup ② Query returns relevant results within 2s ③ Agent responses reference knowledge base content when applicable ④ New documents added to `knowledge/` are indexed on next restart (or via API trigger) ⑤ Starter knowledge base included with at least 10 crop/disease documents ⑥ Works offline (local embeddings, local vector store) |
| **Edge Cases** | Knowledge base empty → agent operates without RAG, relies on LLM's built-in knowledge. Query returns no relevant results → agent notes "no specific guidance found in knowledge base". Corrupt document → skip with warning, don't crash ingestion. Large knowledge base (>1000 docs) → may need pagination or better chunking strategy |
| **Dependencies** | FR-014 (agent service), ChromaDB + embedding model installed |

---

## FR-023

### Agent Memory & Learning

| Stage | Detail |
|---|---|
| **Functional Requirement** | Persistent memory of past agent decisions, outcomes, and user corrections — enabling the agent to learn from the farm's specific history |
| **Use Case** | Agent watered chamber 01 three days ago when soil hit 20%. Soil recovered to 45% within 3 hours. Today soil hits 22% in the same chamber — agent recalls: "Last watering at 20% in this chamber recovered well. Soil is close to threshold. Recommend watering now rather than waiting for breach." |
| **Technical Design** | `agent/memory.py` with two stores: ① **Decision log** — append-only JSON lines file (`agent_memory/decisions.jsonl`): `{timestamp, trigger, context_hash, reasoning, action, outcome}`. Outcome field updated retroactively when sensor data confirms recovery or failure. ② **Learned preferences** — key-value store (`agent_memory/preferences.json`): user corrections ("don't water at night", "prefer lower confidence threshold for alerts"), extracted from chat interactions. **Retrieval:** When building context (FR-016), query decision log for similar past situations (same sensor, same threshold range) and include top 3 relevant decisions. Preferences always included in system prompt. **Retention:** Rolling 90-day window for decision log, preferences are permanent until manually removed |
| **Acceptance Criteria** | ① Decisions are logged immediately after execution ② Outcomes are updated when follow-up data is available (e.g. sensor recovers within window) ③ Past decisions are retrievable by similarity (sensor type + value range) ④ User corrections from chat are extracted and stored as preferences ⑤ Memory files are human-readable (JSON) for inspection ⑥ Memory can be cleared via API endpoint |
| **Edge Cases** | Decision log grows large (>10K entries) → old entries beyond 90 days are archived. Conflicting preferences → latest takes priority, log the conflict. Outcome never confirmed (sensor data gaps) → mark as "unknown". Memory files corrupted → rebuild from empty with warning, don't crash |
| **Dependencies** | FR-014 (agent service), FR-016 (context builder includes memory) |

---

## FR-024

### Crop Profile Management

| Stage | Detail |
|---|---|
| **Functional Requirement** | User defines what is growing in each zone/chamber — crop type, growth stage, planting date, expected harvest — so the agent can contextualise all recommendations |
| **Use Case** | User configures chamber 01: "Roma tomatoes, planted 2026-03-15, currently in fruiting stage." The agent now knows optimal temperature is 21–27°C (not generic), water needs are higher during fruiting, and harvest is expected in ~3 weeks. All alerts and recommendations are crop-specific |
| **Technical Design** | `crop_profiles.json` config file: `[{"zone": "chamber_01", "crop": "roma_tomato", "planted": "2026-03-15", "stage": "fruiting", "notes": "organic, no pesticides"}]`. Stages: seedling → vegetative → flowering → fruiting → harvest. **Backend:** `GET /crops` returns profiles. `PUT /crops/{zone}` creates/updates. `DELETE /crops/{zone}` removes. Growth stage can be auto-advanced based on planting date + crop's typical stage durations (from knowledge base, FR-022). **Frontend:** Crop management section in settings or a dedicated page. Per-zone cards showing crop, stage (with progress bar), planting date, days to harvest. **Agent integration:** Crop profiles are always included in the context window (FR-016). Agent uses them to adjust threshold recommendations, watering schedules, and alert severity |
| **Acceptance Criteria** | ① CRUD operations for crop profiles via API ② Crop profiles included in agent context ③ Growth stage auto-advances based on planting date (overridable manually) ④ Agent references crop-specific requirements in recommendations ⑤ Multiple zones supported with different crops ⑥ Unknown crop type → agent uses generic parameters, notes the limitation |
| **Edge Cases** | No profiles configured → agent operates with generic parameters. Crop past expected harvest date → agent flags "harvest overdue" in daily reports. Invalid crop name → accepted (agent handles via LLM knowledge), logged as unrecognised. Zone conflict (two crops in one zone) → last write wins |
| **Dependencies** | FR-014 (agent consumes profiles), FR-022 (crop knowledge for stage durations) |

---

## FR-025

### CV Event Summarisation

| Stage | Detail |
|---|---|
| **Functional Requirement** | Agent periodically summarises raw CV detection data into human-readable event logs — transforming per-frame detections into meaningful events |
| **Use Case** | Instead of "person detected" 10,000 times, the user sees: "3 people active in sector A between 14:00–16:00 (workers). 1 animal intrusion at gate at 03:22 (duration: 45s, class: cat). No activity from 22:00–06:00." |
| **Technical Design** | `agent/cv_events.py` processes the CV detection stream into events. **Event aggregation logic:** ① Group consecutive detections of same tracker ID into "visits" (start_time, end_time, class, zone). ② Merge visits with gaps <30s into single events. ③ Count unique objects per class per time window. ④ Detect notable events: new class appearing, object in unusual zone, high-count anomalies. **Storage:** Event log in `cv_events.jsonl` — rolling 7-day window. **API:** `GET /cv/events?from=&to=&class=` returns filtered events. **Agent integration:** Context builder includes event summary for the relevant time window. Scheduled routines (FR-020) use event summaries in reports |
| **Acceptance Criteria** | ① Raw detections aggregated into visit events (start, end, class, duration) ② Events queryable by time range and class ③ Summary text generated for any time window ④ Notable events flagged (intrusion, new class, high count) ⑤ Event log does not grow unbounded (7-day rolling window) ⑥ Works with any YOLO model class set (not hardcoded to COCO) |
| **Edge Cases** | Tracker ID reassigned (ByteTrack limitation) → may create two events for one visit (acceptable). No detections for extended period → summary notes "no activity". Thousands of detections per minute → aggregation handles volume without lag. Camera offline → gap noted in event log |
| **Dependencies** | FR-003/FR-004 (CV detection + tracking), FR-016 (context builder consumes events) |

---

## FR-026

### Visual Question Answering

| Stage | Detail |
|---|---|
| **Functional Requirement** | User asks a question about what's happening visually on the farm — the agent captures the latest frame, sends it to a vision-language model, and returns a natural language description |
| **Use Case** | User asks "What does the nursery look like right now?". Agent grabs the latest frame from camera, sends it to a VLM with the question, and responds: "The nursery shows 12 seedling trays on the bench, all appear healthy with green growth. The humidity dome is in place. No visible pests. Lighting appears to be in the afternoon spectrum." |
| **Technical Design** | `agent/vlm.py` — captures the latest frame from `_latest_frame` in `video.py` (or requests a fresh frame via internal API). Encodes as base64 JPEG. Sends to VLM endpoint (Claude vision, GPT-4o, Gemini Pro Vision — reuses provider abstraction from FR-017 where supported). Prompt template: "You are observing a smart farm camera feed. {user_question}. Describe what you see in the context of precision farming." Response returned to chat (FR-015) or included in reports (FR-028). **Rate limiting:** Max 1 VLM call per 30s (frames are expensive). Cache last VLM response for 30s |
| **Acceptance Criteria** | ① Frame capture + VLM response within 15s ② Response is contextualised to farming (not generic image description) ③ Works with at least 2 providers (Claude, GPT-4o) ④ Rate limited to prevent API cost runaway ⑤ Graceful fallback if VLM unavailable ("Visual analysis unavailable, here's the latest detection data instead: ...") ⑥ Frame quality sufficient for meaningful analysis (min 640px) |
| **Edge Cases** | Camera offline → return "Camera unavailable, cannot perform visual analysis". Frame is dark (nighttime) → VLM should note this. Provider doesn't support vision → fall back to text-only response using CV detection data. Large frame (1080p) → resize to 720p before sending to manage token cost |
| **Dependencies** | FR-014 (agent service), FR-017 (provider with vision support), FR-003 (frame access from video pipeline) |

---

## FR-027

### Disease & Pest Detection via CV

| Stage | Detail |
|---|---|
| **Functional Requirement** | Fine-tuned CV model detects plant diseases and pests, with the agent interpreting results and recommending treatment |
| **Use Case** | The CV model detects "early_blight" on 3 tomato plants with 78% confidence. Agent cross-references the knowledge base: "Early blight detected on 3 plants in row 2. This fungal disease spreads in warm, humid conditions (current: 26°C, 72% humidity — high risk). Recommend: 1) Remove affected leaves immediately, 2) Apply copper-based fungicide within 48 hours, 3) Increase ventilation to reduce humidity. Risk to adjacent plants: moderate." |
| **Technical Design** | **Model:** Fine-tuned YOLO model trained on plant disease dataset (PlantVillage or custom Roboflow dataset). Classes: healthy, early_blight, late_blight, powdery_mildew, leaf_miner, aphid, etc. Exported to NCNN for edge inference. Deployed as a second model alongside the general detection model, or as a swappable model via FR-013 settings. **Integration:** Detection results flow through the same `cv_state` pipeline. Agent (FR-014) recognises disease/pest class names and triggers knowledge base lookup (FR-022) for treatment recommendations. Severity assessed by: confidence, count of affected plants, spread rate over time (FR-025 event history). **Frontend:** Disease detections rendered with distinct styling on Live Feed — red/orange bounding boxes instead of green, with disease name label |
| **Acceptance Criteria** | ① Disease model detects at least 5 common diseases/pests ② Detection confidence >70% for known classes ③ Agent provides treatment recommendations referencing the knowledge base ④ Disease detections visually distinct from normal detections on frontend ⑤ Spread tracking: agent compares current detection count vs previous day ⑥ Model runs at acceptable FPS on Pi (>3 FPS) |
| **Edge Cases** | Low confidence detection → agent flags as "possible" not "confirmed". Healthy plants misclassified → confidence threshold reduces false positives. Model not loaded (user selected general model) → disease detection inactive, noted in agent context. Unknown disease class → agent flags as "unidentified anomaly, recommend manual inspection" |
| **Dependencies** | FR-003 (CV pipeline), FR-009 (NCNN export), FR-022 (knowledge base for treatment), FR-014 (agent interpretation), fine-tuned model trained and exported |

---

## FR-028

### Daily Farm Report Generation

| Stage | Detail |
|---|---|
| **Functional Requirement** | Agent generates a structured daily report covering sensor trends, CV events, alerts, actions taken, and recommendations — stored and viewable on the frontend |
| **Use Case** | Every evening at 20:00, the agent produces: "**Daily Report — 2026-04-26**. Temperature: 18–31°C (avg 24.2°C), peaked at 13:00. Humidity: 45–72%. Soil moisture: stable at 35%. CV: 5 people, 2 animal intrusions, 0 disease detections. Alerts: 1 temperature threshold at 13:12 (shade activated). Actions: auto-watered at 10:00 (120s), shade activated at 13:12. Recommendations: soil moisture trending down, schedule watering for tomorrow AM." |
| **Technical Design** | Triggered by scheduled routine (FR-020) with a report-specific prompt. Context builder (FR-016) provides full 24h data. Agent produces structured markdown report. **Storage:** `reports/YYYY-MM-DD.md` files in the backend. **API:** `GET /reports` (list), `GET /reports/{date}` (single report). **Frontend:** Reports page or section showing report history with expandable daily entries. Rendered as markdown. **Report template:** Agent follows a structured prompt: sections for Environment (sensor summary), Activity (CV events), Alerts & Actions, Crop Status, Recommendations. Each section has data + interpretation |
| **Acceptance Criteria** | ① Report generated daily at configured time ② Report covers full 24h period ③ All sections populated with actual data ④ Reports stored and retrievable via API ⑤ Reports viewable on frontend with markdown rendering ⑥ Historical reports accessible (last 30 days minimum) ⑦ Report includes both data and agent interpretation |
| **Edge Cases** | Incomplete data (sensor gaps) → report notes the gap period. No CV events → section states "no activity detected". Agent API fails → report generation retried once, then logged as failed. Server was down part of the day → report covers available data, notes downtime |
| **Dependencies** | FR-014 (agent service), FR-016 (24h context), FR-020 (scheduler), FR-025 (CV event summaries) |

---

## FR-029

### Multi-Channel Notifications

| Stage | Detail |
|---|---|
| **Functional Requirement** | Agent sends alerts, reports, and messages to the user via their preferred channel — frontend, email, WhatsApp, or Telegram — with priority-based routing |
| **Use Case** | Critical alert (temperature >40°C) → immediate push to WhatsApp + frontend toast. Daily report → Telegram at 20:00. Advisory recommendation → frontend chat only. User configures preferences in settings |
| **Technical Design** | `agent/notifications.py` with channel abstraction. **Channels:** ① Frontend — push via `/ws/alerts` WebSocket (toast/banner). ② Email — SMTP via `smtplib` or SendGrid API. ③ WhatsApp — via Twilio API or WhatsApp Business API. ④ Telegram — via Bot API (existing TerraHawk bot). **Routing:** `notification_config.json` maps priority levels to channels: `{"critical": ["whatsapp", "frontend"], "warning": ["telegram", "frontend"], "info": ["frontend"]}`. **API:** `POST /notifications/send` (internal, used by agent). `GET /notifications` (history). `PUT /notifications/config` (user preferences). **Rate limiting:** Max 10 notifications/hour per channel to prevent spam |
| **Acceptance Criteria** | ① Notifications delivered to configured channels within 30s ② Priority-based routing respects user configuration ③ At least 2 channels functional at launch (frontend + one external) ④ Notification history stored and queryable ⑤ Rate limiting prevents notification spam ⑥ Channel failure doesn't block other channels (send to all, log failures) |
| **Edge Cases** | All external channels fail → frontend always works as fallback. User has no external channels configured → frontend only. Duplicate notifications (same alert, same minute) → deduplicated. Notification during quiet hours (configurable, e.g. 23:00–07:00) → critical only, others queued for morning |
| **Dependencies** | FR-014 (agent produces notifications), external channel API keys configured |

---

## FR-030

### Natural Language Farm Dashboard

| Stage | Detail |
|---|---|
| **Functional Requirement** | Agent generates a plain-English status line that updates periodically, providing an at-a-glance summary of the farm state on the home page or live feed |
| **Use Case** | Instead of just numbers, the home page shows: "Everything looks healthy. Temperature stable at 23°C, last watered 2 hours ago, soil moisture is good. Next scheduled check at 18:00. No alerts." This updates every 15 minutes |
| **Technical Design** | `agent/dashboard.py` runs on a 15-minute interval. Invokes the agent with a concise prompt: "Generate a one-paragraph farm status summary in plain English. Be concise and friendly. Mention anything that needs attention." Response stored in a shared `dashboard_state` dict: `{"summary": str, "updated_at": float, "status": "healthy|attention|critical"}`. **API:** `GET /dashboard/summary` returns latest summary. **Frontend:** `useDashboardSummary` hook polls every 60s. Rendered on the Index page below the hero section and on the Live Feed as a collapsible HUD element. Status drives a colour indicator: green (healthy), amber (attention), red (critical) |
| **Acceptance Criteria** | ① Summary updates every 15 minutes ② Summary is ≤3 sentences, plain English ③ Status level (healthy/attention/critical) derived from summary content ④ Summary available via API and rendered on frontend ⑤ Stale summary (>30 min old) flagged with "last updated X min ago" ⑥ Summary reflects actual farm state (not generic) |
| **Edge Cases** | Agent unavailable → last summary retained with "stale" indicator. Farm has no data yet (first boot) → "Farm is starting up. Sensors and cameras are initialising." All systems critical → summary focuses on the most urgent issue first. Summary generation fails → retain previous summary, log error |
| **Dependencies** | FR-014 (agent service), FR-016 (context), FR-020 (scheduler for periodic updates) |

---

## FR-031

### Agent Action Approval Mode

| Stage | Detail |
|---|---|
| **Functional Requirement** | Configurable per-action-type: autonomous (agent acts immediately) or advisory (agent proposes, user confirms). Critical actions always require approval |
| **Use Case** | Agent wants to activate the pump. Mode is "advisory". User receives: "💧 Soil moisture at 18% in chamber 01. I recommend watering for 120 seconds. [Approve] [Reject] [Modify]". User taps Approve. Pump activates. If mode were "autonomous", the pump would have activated immediately with a notification sent after |
| **Technical Design** | `agent/approval.py` manages action approval flow. **Config:** `approval_config.json` maps actions to modes: `{"pump_on": "advisory", "fan_on": "autonomous", "shade_on": "autonomous", "emergency_stop": "always_approve"}`. Three modes: `autonomous` (execute + notify), `advisory` (propose + wait for approval), `always_approve` (never auto-execute, even in autonomous global mode). **Pending actions queue:** When advisory, action stored in `pending_actions` list with TTL (default 30 min). **API:** `GET /agent/pending` (list pending actions). `POST /agent/pending/{id}/approve` (execute). `POST /agent/pending/{id}/reject` (discard with reason). **Frontend:** Pending action cards appear on the Live Feed or Agent chat with approve/reject buttons. **Notification:** Pending actions trigger notification (FR-029) on configured channels |
| **Acceptance Criteria** | ① Autonomous actions execute immediately and log ② Advisory actions create pending items and notify ③ Pending actions expire after TTL (configurable) ④ Approve executes the action, reject discards with logged reason ⑤ `always_approve` actions are never auto-executed regardless of global mode ⑥ Global override: settings can switch all actions to advisory mode (safety mode) |
| **Edge Cases** | Pending action expires → logged as "expired, not executed", agent notified for follow-up. User offline (no approval within TTL) → action expires, agent may re-evaluate on next cycle. Conflicting approvals (approve + reject race) → first response wins. Agent proposes action while previous pending for same actuator → replaces previous pending |
| **Dependencies** | FR-019 (action execution), FR-029 (notifications for approval requests), FR-013 (settings for mode config) |

---

## FR-032

### Agent Audit Log

| Stage | Detail |
|---|---|
| **Functional Requirement** | Every agent decision is logged with full context — timestamp, input, reasoning, action taken, and outcome — viewable on the frontend for transparency and debugging |
| **Use Case** | User wonders "Why did the pump activate at 3 AM?". Opens the audit log, finds the entry: "03:12 — Trigger: soil moisture 16% (threshold 20%). Context: chamber 01, tomatoes fruiting stage, last watered 18h ago. Reasoning: soil critically low, crop in high-water-demand stage, night watering acceptable for this crop. Action: pump_on, 90s. Outcome: soil recovered to 38% by 05:00." |
| **Technical Design** | `agent/audit.py` — append-only structured log. **Storage:** `audit/YYYY-MM-DD.jsonl` files. Each entry: `{"timestamp", "trigger" (chat/sensor/schedule/anomaly), "context_summary", "prompt", "reasoning", "action", "action_params", "approval_mode", "approved_by" (user/auto/expired), "outcome", "model_used", "latency_ms", "tokens_used"}`. **API:** `GET /agent/audit?from=&to=&trigger=&action=` with filtering and pagination. **Frontend:** Audit log page or panel. Each entry expandable to show full reasoning chain. Filter by trigger type, action type, date range. Timeline view with icons per trigger type. **Retention:** 90-day rolling window, older entries archived to compressed files |
| **Acceptance Criteria** | ① Every agent invocation creates an audit entry (no exceptions) ② Entries include full reasoning chain, not just the action ③ Audit log queryable by date, trigger type, and action type ④ Frontend renders audit entries with expandable detail ⑤ Audit log is append-only (no edits or deletions via API) ⑥ Outcome field updated when follow-up data is available ⑦ Log files are human-readable JSON |
| **Edge Cases** | Disk full → log to stderr as fallback, alert user. Corrupt log file → start new file, log the corruption. High-frequency triggers (many sensor alerts) → log all, but UI paginates. Agent invocation with no action (informational response) → still logged with `"action": null` |
| **Dependencies** | FR-014 (agent service produces entries), FR-019 (action execution populates action fields) |

---

## FR-033

### Agent Kill Switch

| Stage | Detail |
|---|---|
| **Functional Requirement** | One-click disable all autonomous agent actions from the frontend. Agent continues observing, analysing, and reporting — but cannot execute any actuator commands |
| **Use Case** | User notices something unexpected — the agent keeps activating the pump. One click on the kill switch: all autonomous actions stop immediately. Agent still responds in chat, still generates reports, still detects anomalies — but hands are tied. Visual indicator on every page: "🔴 AGENT ACTIONS PAUSED". User re-enables when confident |
| **Technical Design** | **Backend:** Boolean flag in `config.py`: `agent_actions_enabled` (default `true`). `PUT /settings` accepts `{"agent_actions_enabled": false}`. When false, `agent/actions.py` rejects all action executions with reason "kill switch active". Agent invocations still run — responses include actions in advisory mode regardless of per-action config. All rejected actions logged in audit (FR-032) with `"blocked_by": "kill_switch"`. **Frontend:** Prominent toggle on the Live Feed HUD (top bar) and Settings page. When active: red pulsing indicator visible on all pages. Confirmation dialog on disable: "This will pause all autonomous agent actions. The agent will continue monitoring and reporting. Are you sure?" **API:** `GET /agent/status` returns `{"actions_enabled": bool, "disabled_since": timestamp|null}` |
| **Acceptance Criteria** | ① Kill switch disables all actuator commands within 1s ② Agent continues all non-action functions (chat, reports, anomaly detection) ③ Visual indicator visible on Live Feed and Settings when active ④ All blocked actions logged with kill switch reason ⑤ Re-enabling requires explicit user action (no auto-re-enable) ⑥ Kill switch state persists across server restarts ⑦ Confirmation dialog prevents accidental toggle |
| **Edge Cases** | Kill switch activated during pending advisory action → pending action stays pending but cannot be approved while switch is active. Server restarts while kill switch active → remains active (persisted to config). Agent recommends action while switch is on → logged as "recommended but blocked", user notified. Both kill switch and approval mode active → kill switch takes priority |
| **Dependencies** | FR-019 (action execution respects the flag), FR-013 (settings UI for the toggle), FR-032 (audit logging of blocked actions) |

---

## How to Use This Document

1. **New feature?** Copy the FR-010 template, assign the next ID, fill in all 6 stages
2. **Implementation** — reference the FR ID in commits and PRs (e.g. `implements FR-011`)
3. **Review** — acceptance criteria are your definition of done
4. **Status** — update the table of contents as features move from 🔲 Planned → 🚧 In Progress → ✅ Shipped
