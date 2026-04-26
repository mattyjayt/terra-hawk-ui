# 🌿 Verdant Precision — TerraHawk Frontend

The cinematic frontend for the **TerraHawk** smart farm platform. A dark glassmorphism HUD interface built with React, TypeScript, and Tailwind CSS — displaying real-time computer vision detections, live camera feeds via WebRTC, and IoT sensor telemetry from the [TerraHawk backend](https://github.com/your-org/terra-hawk-backend) running on a Raspberry Pi 5.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Verdant Precision (Browser)                     │
│                                                                     │
│  ┌──────────┐   ┌────────────┐   ┌──────────────┐   ┌──────────┐  │
│  │  Index    │   │  LiveFeed  │   │    About     │   │ NotFound │  │
│  │  (Home)   │   │  (HUD)     │   │  (System)    │   │  (404)   │  │
│  └──────────┘   └─────┬──────┘   └──────────────┘   └──────────┘  │
│                       │                                             │
│          ┌────────────┼────────────┐                                │
│          ▼            ▼            ▼                                │
│   ┌────────────┐ ┌─────────┐ ┌──────────┐                         │
│   │ LiveStream │ │  Sensor  │ │    CV    │                         │
│   │  (WebRTC)  │ │WebSocket │ │WebSocket │                         │
│   └─────┬──────┘ └────┬────┘ └────┬─────┘                         │
└─────────┼──────────────┼───────────┼───────────────────────────────┘
          │              │           │
          │ WHEP/SDP     │ ws://     │ ws://
          ▼              ▼           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   Raspberry Pi 5 (Backend)                          │
│                                                                     │
│   MediaMTX (:8889)     FastAPI (:8000)                              │
│   RTSP → WebRTC        /ws/sensors (5 Hz)                           │
│                         /ws/cv (50 Hz)                               │
│                         /ping                                        │
│                                                                     │
│   Camera Module ←── YOLO26n + ByteTrack ──→ CV detections           │
│   ESP32 (MQTT) ────────────────────────→ Sensor telemetry           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Pages

### `/` — Home (The Dome)

Cinematic landing page with HUD-style hero. Displays a static telemetry preview (chamber 04, yield metrics, mini bar chart) over a full-bleed terrarium hero image. Entry points to the live feed and system info.

### `/live` — Live Feed

The core experience. Full-screen immersive view featuring:

- **WebRTC live stream** from the Pi camera via MediaMTX WHEP endpoint, with automatic fallback to a simulated terrarium video if the stream is unreachable
- **Computer vision overlays** — bounding boxes with labels and confidence scores rendered directly over the video feed, driven by the `/ws/cv` WebSocket at ~50 FPS
- **Sensor telemetry** — temperature, humidity, soil moisture displayed as HUD readouts in the bottom-right corner, updated at 5 Hz via `/ws/sensors`
- **Stream status indicator** — live (red pulse + FPS/latency stats), connecting (pulse), or simulated (green pulse)
- **HUD elements** — corner brackets, center crosshair with animated reticle, scanline effect, local clock with timezone

### `/about` — System

Four-pillar overview of the TerraHawk philosophy: Sense → Hydrate → Illuminate → Grow. Contact section with support CTA.

### `/settings` — Configuration

Two-tab settings interface:

- **Computer Vision** — live system status (model, FPS, latency, active tracks), model hot-swap dropdown (populated dynamically from backend), confidence/IOU sliders, inference resolution selector. Apply sends partial updates; Reset restores defaults.
- **Agentic AI** — placeholder tab for upcoming agent configuration (provider, model, mode, alert thresholds). All controls disabled with "coming soon" indicators.

### `/agent` — Agent Chat *(planned)*

Conversational interface with the farm's AI agent. Ask questions about farm state, get recommendations, review reasoning. See [Agentic AI Roadmap](#agentic-ai-roadmap) below.

---

## Real-Time Data Connections

### WebRTC — Live Camera Feed (`LiveStream.tsx`)

Connects to MediaMTX via the **WHEP** (WebRTC-HTTP Egress Protocol):

| Setting | Value |
|---|---|
| Endpoint | `VITE_LIVESTREAM_URL` (e.g. `http://192.168.178.147:8889/stream/whep`) |
| Protocol | WHEP (POST SDP offer → receive SDP answer) |
| ICE | STUN via `stun.l.google.com:19302` |
| Timeout | 6 seconds before falling back to simulated feed |
| Stats | FPS and round-trip latency polled every 1s from `RTCPeerConnection.getStats()` |

**Fallback:** If the WHEP handshake fails or `VITE_LIVESTREAM_URL` is not set, the component seamlessly switches to a looping simulated terrarium video.

### WebSocket — Sensor Data (`useSensorData.ts`)

| Connection | URL | Rate | Data |
|---|---|---|---|
| Sensors | `ws://localhost:8000/ws/sensors` | 5 Hz (200ms) | `{ status, temperature, humidity, soil }` |
| CV | `ws://localhost:8000/ws/cv` | 50 Hz (20ms) | `{ timestamp, resolution, objects[] }` |

**Sensor state** is merged into a flat key-value map. The LiveFeed page dynamically renders metrics from whatever fields the backend provides, using a configurable label/unit mapping.

**CV data** provides normalized bounding boxes (0–1) which are rendered as percentage-positioned overlays directly on the video feed. Each detection shows:
- Label (e.g. `PERSON`)
- Confidence percentage (e.g. `[87%]`)
- Animated accent pulse dot
- Persistent tracker ID from ByteTrack

Auto-reconnect on disconnect (3s delay for sensors).

### REST — Settings API

The Settings page communicates with the backend via REST endpoints:

| Endpoint | Method | Description |
|---|---|---|
| `/settings` | GET | Current config + defaults + live inference stats |
| `/settings` | PUT | Partial config update (model, confidence, IOU, imgsz) |
| `/settings/models` | GET | Available models with name, format, and size |
| `/ping` | GET | Health check |

Model hot-swap: selecting a new model via PUT triggers a live swap in the inference thread — no server restart required. Confidence, IOU, and resolution changes take effect on the next inference frame.

---

## Project Structure

```
verdant-precision/
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── assets/
│   │   ├── hero-dome.jpg              # About page background
│   │   ├── hero-terrarium.jpg         # Home page background
│   │   └── sim-terrarium.mp4.asset.json  # Simulated feed fallback (hosted URL)
│   ├── components/
│   │   ├── AmbientBackground.tsx      # Global cinematic backdrop (parallax, bokeh, scanlines)
│   │   ├── LiveStream.tsx             # WebRTC WHEP player with simulated fallback
│   │   ├── NavLink.tsx                # Route-aware nav link wrapper
│   │   ├── SiteNav.tsx                # Top navigation bar
│   │   └── ui/                        # shadcn/ui component library (~40 components)
│   ├── hooks/
│   │   ├── useSensorData.ts           # Dual WebSocket hook (sensors + CV)
│   │   ├── use-mobile.tsx             # Responsive breakpoint hook
│   │   └── use-toast.ts              # Toast notification hook
│   ├── lib/
│   │   └── utils.ts                   # cn() utility (clsx + tailwind-merge)
│   ├── pages/
│   │   ├── Index.tsx                  # Home — cinematic HUD landing
│   │   ├── LiveFeed.tsx               # Live — full-screen camera + CV + sensors
│   │   ├── About.tsx                  # System — four pillars + contact
│   │   ├── Settings.tsx               # Configuration — CV settings + Agentic AI (planned)
│   │   └── NotFound.tsx               # 404
│   ├── test/
│   │   ├── setup.ts                   # Vitest + jsdom setup
│   │   └── example.test.ts
│   ├── App.tsx                        # Router + providers
│   ├── main.tsx                       # Entry point
│   ├── index.css                      # Design system (CSS variables, animations, HUD styles)
│   └── vite-env.d.ts
├── .env                               # Environment variables
├── components.json                    # shadcn/ui config
├── tailwind.config.ts                 # Tailwind theme (fonts, colors, animations)
├── vite.config.ts                     # Vite config (SWC, aliases, dev server)
├── vitest.config.ts                   # Test config (jsdom)
├── tsconfig.json                      # TypeScript config
└── package.json
```

---

## Design System

### Philosophy

**Cinematic dark glassmorphism** — the UI feels like a HUD floating over a living environment. No cards, no boxes. Just hairlines, reticles, and typography breathing over the image.

### Tokens (CSS Variables)

| Token | Value | Purpose |
|---|---|---|
| `--background` | `hsl(160 14% 6%)` | Deep forest dark |
| `--foreground` | `hsl(60 12% 92%)` | Warm bone white |
| `--accent` | `hsl(88 35% 55%)` | Living moss green |
| `--destructive` | `hsl(12 70% 55%)` | Alert / REC indicator |
| `--glass-bg` | `hsl(60 12% 92% / 0.018)` | Near-invisible glass |
| `--glow-warm` | `hsl(38 95% 60%)` | Warm amber glow |
| `--glow-leaf` | `hsl(88 60% 55%)` | Green accent glow |

### Typography

| Role | Font | Usage |
|---|---|---|
| Display | **Fraunces** (serif) | Headlines, large numbers |
| Mono | **JetBrains Mono** | Labels, tags, telemetry |
| Sans | **Inter** | Body text |

### HUD CSS Classes

| Class | Effect |
|---|---|
| `hud-text` | Subtle text shadow for depth |
| `hud-text-strong` | Stronger shadow for emphasis |
| `hud-frame` | Hairline border container with corner brackets |
| `hud-c1` / `hud-c2` | Corner accent marks |
| `hairline` | 1px separator line |

### Key Animations

| Animation | Description |
|---|---|
| `animate-slow-zoom` | 30s infinite scale 1→1.06 on hero images |
| `animate-scan` | Drifting horizontal scanline across viewport |
| `animate-pulse-glow` | Pulsing green accent dot |
| `animate-fade-up` | Entry animation (opacity + translateY) |
| `animate-float` | Slow drift for bokeh overlays |
| `animate-bar-rise` | Staggered bar chart reveal |

---

## Environment Variables

| Variable | Example | Description |
|---|---|---|
| `VITE_LIVESTREAM_URL` | `http://192.168.178.147:8889/stream/whep` | MediaMTX WHEP endpoint for the Pi camera stream |

Create a `.env` file in the project root:

```env
VITE_LIVESTREAM_URL=http://192.168.178.147:8889/stream/whep
```

> If unset, the live feed page falls back to a simulated terrarium video automatically.

---

## Prerequisites

- **Node.js** ≥ 18 (or **Bun**)
- **TerraHawk backend** running on the Pi (for live data)
  - FastAPI at `:8000` (sensor + CV WebSockets)
  - MediaMTX at `:8889` (WebRTC stream)

---

## Getting Started

### Install dependencies

```bash
npm install
# or
bun install
```

### Run development server

```bash
npm run dev
# or
bun dev
```

The app starts at `http://localhost:8080`.

### Build for production

```bash
npm run build
npm run preview    # preview the build locally
```

### Run tests

```bash
npm test           # single run
npm run test:watch # watch mode
```

---

## Connecting to the Backend

For the full experience with live camera, CV overlays, and sensor data:

1. **Start the Pi backend** — `./start.sh` in the `terra_hawk/` project on the Pi
2. **Ensure network access** — your dev machine must reach the Pi on ports `8000` (API) and `8889` (WebRTC)
3. **Set `VITE_LIVESTREAM_URL`** — point to the Pi's MediaMTX WHEP endpoint
4. **Start the frontend** — `npm run dev`

The live feed page will:
- Connect to MediaMTX via WebRTC WHEP for the camera stream
- Open WebSocket connections to `/ws/sensors` and `/ws/cv` for real-time data
- Render CV bounding boxes as HUD overlays directly on the video
- Display sensor readings (temp, humidity, soil) as telemetry readouts

If the Pi is offline, everything degrades gracefully — simulated video plays, sensors show `N/A`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 (SWC) |
| Styling | Tailwind CSS 3 + CSS variables |
| Components | shadcn/ui (Radix primitives) |
| Routing | React Router v6 |
| State | React Query + WebSocket hooks |
| Charts | Recharts |
| Icons | Lucide React |
| Testing | Vitest + Testing Library + jsdom |
| Streaming | WebRTC (WHEP protocol) |
| Real-time | Native WebSocket API |

---

## Agentic AI Roadmap

TerraHawk is evolving from a monitoring platform into an **autonomous farm management system** powered by agentic AI. The agent layer sits on top of the existing CV + IoT infrastructure, adding intelligence, memory, and autonomous decision-making.

### Architecture (Planned)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Agent Layer                               │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐   │
│  │ Chat UI  │  │ Scheduler│  │ Anomaly  │  │  Kill Switch  │   │
│  │ (FR-015) │  │ (FR-020) │  │ (FR-021) │  │   (FR-033)    │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───────┬───────┘   │
│       │              │             │                │            │
│       ▼              ▼             ▼                ▼            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Farm Agent (FR-014)                          │   │
│  │   Context (FR-016) · Providers (FR-017) · Memory (FR-023)│   │
│  └─────────┬────────────────┬───────────────────┬───────────┘   │
│            │                │                   │               │
│     ┌──────▼──────┐  ┌─────▼──────┐  ┌────────▼────────┐      │
│     │ RAG / KB    │  │  Actions   │  │  Notifications  │      │
│     │ (FR-022)    │  │  (FR-019)  │  │    (FR-029)     │      │
│     └─────────────┘  └─────┬──────┘  └─────────────────┘      │
│                            │                                    │
│                    ┌───────▼────────┐                           │
│                    │ Approval Mode  │                           │
│                    │   (FR-031)     │                           │
│                    └───────┬────────┘                           │
└────────────────────────────┼────────────────────────────────────┘
                             │ MQTT
                             ▼
                    ┌─────────────────┐
                    │  ESP32 Actuators│
                    │  (fan/pump/shade)│
                    └─────────────────┘
```

### Capability Groups

**Core Infrastructure** — The foundation: agent backend service, chat interface, context management, and pluggable LLM providers (Claude, GPT, Gemini, Ollama for offline).

**Autonomous Decision Making** — Sensor-triggered reasoning (replacing hardcoded rules with contextual intelligence), actuator control as tool calls, scheduled routines (morning briefings, health checks), and anomaly detection that catches what simple thresholds miss.

**Knowledge & Memory** — ChromaDB-powered RAG with agricultural knowledge (crop care, disease identification, pest management). Persistent agent memory that learns from past decisions and outcomes. Crop profile management for zone-specific recommendations.

**CV Integration** — Event summarisation (raw detections → human-readable activity logs), visual question answering via VLM ("what does the nursery look like?"), and disease/pest detection with fine-tuned models + agent-powered treatment recommendations.

**Reporting & Communication** — Daily structured reports, multi-channel notifications (frontend, WhatsApp, Telegram, email) with priority routing, and a natural language dashboard that translates numbers into plain English.

**Safety & Control** — Action approval mode (autonomous vs advisory per action type), complete audit logging of every agent decision with reasoning chains, and a kill switch that instantly pauses all autonomous actions while keeping observation active.

> Full specifications for all 20 agentic AI features are documented in [ENGINEERING.md](./ENGINEERING.md) (FR-014 through FR-033).

---

## License

MIT

---

## References

- [TerraHawk Backend](https://github.com/your-org/terra-hawk-backend) — Pi edge CV + IoT backend
- [MediaMTX WHEP](https://mediamtx.org/docs/usage/read/whep/) — WebRTC-HTTP Egress Protocol
- [shadcn/ui](https://ui.shadcn.com/) — Component library
- [Ultralytics YOLO](https://docs.ultralytics.com/) — Detection model (backend)
- [Supervision](https://supervision.roboflow.com/) — ByteTrack tracking (backend)
