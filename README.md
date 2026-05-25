# **VedaAI - AI Assessment Creator**

A premium, full-stack AI-powered question paper and marking scheme creator built for teachers. It matches the Figma design screenshots with high visual fidelity, supports background queuing for generation, communicates state transitions in real time using WebSockets, and offers premium A4 PDF downloads.

## Live Demo

Frontend: `https://your-frontend.vercel.app`  
Backend API: `https://vedaai-assignment-jq9i.onrender.com`

---

## **Full Stack Architecture**

The system follows a highly resilient, asynchronous, event-driven architecture designed to provide a seamless, non-blocking user experience:

```mermaid
sequenceDiagram
    participant FE as Next.js Frontend
    participant BE as Express Backend Server
    participant DB as MongoDB / In-Memory DB
    participant RD as Redis / In-Memory Queue
    participant WK as Worker Thread
    participant AI as ChatGPT (OpenAI)

    FE->>BE: 1. POST /api/assignments (Form metadata + optional file)
    BE->>DB: 2. Save Draft Assignment (status: "pending")
    BE->>RD: 3. Add Paper Generation Job to Queue
    BE-->>FE: 4. Returns Assignment ID (Instant Response)
    FE->>FE: 5. Redirects to /assignments/[id] & opens WebSocket connection
    
    Note over WK, RD: Worker picks up job from Queue in background
    WK->>AI: 6. Formulate structured JSON prompt & query ChatGPT
    AI-->>WK: 7. Return structured JSON assessment data
    WK->>DB: 8. Save Sections, Questions, Difficulty badges, & Answer Key
    WK->>BE: 9. Signal completion to Express Server
    BE->>FE: 10. Push "assignment:completed" event via WebSocket Room
    FE->>FE: 11. Instantly swap loader for beautiful side-by-side paper!
```

### **1. Frontend (`vedaai-frontend`)**
* **Framework:** Next.js + TypeScript (App Router with Turbopack).
* **State Management:** Zustand (for clean, reactive store operations, CRUD actions, and step wizard states).
* **Styling:** Vanilla CSS + CSS Modules + modern Inter typography (premium dark modes, micro-animations, glowing blur rings, and beautiful badges).
* **WebSockets:** `socket.io-client` for active, real-time subscription to assignment updates.

### **2. Backend (`vedaai-backend`)**
* **Runtime:** Node.js + Express (TypeScript, `ts-node-dev` for live reloading).
* **Database:** MongoDB (via Mongoose schemas) storing assignments, question lists, difficulty levels, and solution keys.
* **Queues:** BullMQ + Redis for backgrounding the generative AI workloads, separating HTTP request lifecycles from long-running LLM APIs.
* **WebSockets:** `socket.io` broadcasting completions or failures selectively to clients using isolated rooms (`assignment:<id>`).
* **PDF Exporter:** Native high-performance PDF generation using `pdfkit` styled as a professional exam template (custom headers, student info grids, margins, and marking appendixes).
* **AI Engine:** OpenAI ChatGPT API (`openai` SDK) executing structured JSON queries.

---

## **Data & Queue (required locally)**

- **MongoDB** — all assignments persist via **Mongoose** (`vedaai` database).
- **Redis (cloud)** — background jobs and queue state via **BullMQ** (use [Upstash](https://upstash.com) or Redis Cloud; set `REDIS_URL` in `.env`).
- If `OPENAI_API_KEY` is missing, a built-in question generator is used as fallback for AI content only.

---

## **API Design & Routes**

All REST endpoints operate on 

Production API Base URL:
`https://vedaai-assignment-jq9i.onrender.com`

Local Development API:
`http://localhost:5000/api/assignments` :

| Endpoint | Method | Payload | Purpose |
|----------|--------|---------|---------|
| `/api/assignments` | `POST` | `Multipart/Form-Data` | Create a draft assignment and queue generation. Supports PDF/image uploads. |
| `/api/assignments` | `GET` | *None* | Retrieve all assignments from the database. |
| `/api/assignments/:id` | `GET` | *None* | Retrieve detailed questions, difficulty levels, and answer key. |
| `/api/assignments/:id/regenerate` | `POST` | *None* | Re-queue AI paper generation for a specific assignment. |
| `/api/assignments/:id/pdf` | `GET` | *None* | Generate and stream a beautifully styled printable A4 PDF. |
| `/api/assignments/:id` | `DELETE` | *None* | Delete an assignment from the database. |

### **WebSocket Event Flow**
* **Client Emit:** `join-assignment` with `{ id }` room.
* **Server Broadcasts (to room):**
  * `assignment:completed` -> Sends fully generated assessment document.
  * `assignment:failed` -> Sends error message to trigger user-friendly retry banners.

---

## **Setup & Execution Instructions**

Ensure you have **Node.js (v18+)** installed.

### **1. Prerequisites**
1. **MongoDB** — local or Atlas (`MONGO_URI` in `.env`)
2. **Redis (hosted)** — e.g. free [Upstash](https://upstash.com) database → paste URL as `REDIS_URL` (use `rediss://` for TLS)
3. **Node.js v18+**

**Step A: Configure `vedaai-backend/.env`**
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/vedaai
REDIS_URL=rediss://default:YOUR_PASSWORD@YOUR_HOST.upstash.io:6379
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
OPENAI_MODEL=gpt-4o-mini
```

**Step B: Start the app**

**Option A — One command (Windows PowerShell, from project root):**
```powershell
.\start.ps1
```

**Option B — Two terminals:**

**Terminal 1 — Backend**
```bash
cd vedaai-backend
npm install
npm run dev
```

**Terminal 2 — Frontend**
```bash
cd vedaai-frontend
npm install
npm run dev
```

Open **http://localhost:3000**. Backend API: **http://localhost:5000/health**

### **2. Production build**
```bash
cd vedaai-backend
npm run build
npm start
```

---

## **High-Signal UX Polish**

1. **Student Info Block:** Features Name, Roll Number, and Section inputs aligned exactly like standardized papers.
2. **Dynamic Difficulty Badges:** Automatically marks questions visually (Easy: Green, Moderate: Amber, Hard: Rose).
3. **Structured Marking Scheme:** The full NCERT marking guideline is rendered at the bottom for quick teacher review.
4. **WebSocket Sync Loader:** The loading page displays real-time phase tickers (e.g. "Generating high-fidelity questions with ChatGPT...") which sync automatically with WebSocket messages.
5. **Print Layout:** A4 ready printable layouts in backend PDF exports.
