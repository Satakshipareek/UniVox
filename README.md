# CampusVoice AI — Voice-first campus assistant

A solo-hackathon-sized MEAN stack application. Speak or type a natural-language command; Gemini identifies a supported intent; the Express API validates it and invokes an allow-listed service; Mongoose writes/reads MongoDB; Angular shows the result and (when enabled) speaks the confirmation.

## Hackathon brief alignment

The supplied Voice AI Hackathon brief requires the complete chain **Voice in → AI understands → Real action → Voice out**, with voice input mandatory, a visible action, a working demo under three minutes, and honest disclosure of mocked features. CampusVoice implements that chain with browser Web Speech API, Gemini, MongoDB-backed expenses/tasks/reminders, and browser SpeechSynthesis.

## What is real vs. sample

| Capability | Status | Notes |
|---|---|---|
| Speech-to-text | REAL (browser-dependent) | Web Speech API; Chrome/Edge recommended. A typed command fallback is included. |
| Intent recognition | REAL when configured | Gemini API via official `@google/genai` SDK. Missing key produces a visible API setup error. |
| Expenses | REAL | Create/list and current-week aggregate in MongoDB. |
| Tasks | REAL | Create/list and mark complete in MongoDB. |
| Reminders | REAL storage | Create/list in MongoDB. No background scheduler or guaranteed notification when app is closed. |
| Speech output | REAL (browser-dependent) | SpeechSynthesis API; can be disabled in Settings. |
| Campus events, library hours, academic info | MOCK / SAMPLE | Served from `backend/src/services/campusData.js`; not live or verified college data. |
| Authentication / multi-user isolation | NOT IMPLEMENTED | Hackathon demo assumes a single local student workspace. Do not expose publicly as-is. |
| Browser push notifications | NOT IMPLEMENTED | Reminders are visible in the app only. |

## Prerequisites

- Node.js 20 LTS (18.19+ should work with Angular 18; Node 20 is recommended)
- npm 10+
- MongoDB Community Server running locally, or a MongoDB Atlas connection string
- Gemini API key from Google AI Studio
- Chrome or Edge with microphone permission for the best voice demo

## Setup (from the project root)

### 1. Install dependencies

```bash
npm install
npm run install:all
```

### 2. Configure the backend

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/campusvoice
GEMINI_API_KEY=your_google_ai_studio_key
PORT=5000
CLIENT_URL=http://localhost:4200
GEMINI_MODEL=gemini-2.5-flash
```

Never put the Gemini key in Angular environment files. `.env` is ignored by Git.

### 3. Start MongoDB

Start your local MongoDB service, or set `MONGODB_URI` to your Atlas URI. The API intentionally waits for a successful database connection before it starts listening.

### 4. Start both applications

```bash
npm run dev
```

Open **http://localhost:4200**. API health endpoint: **http://localhost:5000/api/health**.

You can also run each side separately:

```bash
npm run dev:backend
npm run dev:frontend
```

### Production build

```bash
npm --prefix frontend run build
npm --prefix backend start
```

Serve the Angular production output from a static host or web server and set `CLIENT_URL` to the deployed frontend origin. Use HTTPS for microphone access outside localhost.

## Three-minute live demo script

1. **0:00–0:20 — Show the assistant.** Open Dashboard, tap the mic, grant permission. Mention the transcript is visible and browser speech is used.
2. **0:20–0:55 — Real database write.** Say: “I spent 250 rupees on lunch. Save this expense.” Show the transcript, Gemini intent/action response and success confirmation. Open Expenses and show the persisted transaction.
3. **0:55–1:30 — Create a reminder.** Say: “Remind me to submit my assignment tomorrow at 10 AM.” Show the reminder in Tasks & Reminders. Explain it is persisted, but there is no background notification when the app is closed.
4. **1:30–2:00 — Task action.** Say: “Create a task to prepare for my DBMS exam.” Show the pending task; mark it complete from the UI to demonstrate the PATCH endpoint.
5. **2:00–2:30 — Retrieval.** Say: “How much did I spend this week?” Show the live aggregate. Optionally ask “What events are happening on campus?” and point out the sample-data label.
6. **2:30–3:00 — Close.** Open Settings to show MongoDB/Gemini service status and clarify which campus details are sample data.

## Example commands

- “I spent 250 rupees on lunch. Save this expense.”
- “Remind me to submit my assignment tomorrow at 10 AM.”
- “Create a task to prepare for my DBMS exam.”
- “Show me my pending tasks.”
- “Show my completed tasks.”
- “List my recent expenses.”
- “How much did I spend this week?”
- “What events are happening on campus?”
- “What are the library hours?”

For best extraction, include a clear amount and description for expenses, a task title for tasks, and both a reminder title and date/time for reminders. If required details are absent, the API asks a clarification instead of creating an incomplete record.

## REST API

All endpoints are prefixed with `/api`. JSON response envelope uses `success`, with `data`, `message`, or `error` as applicable.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/voice/command` | `{ "transcript": "..." }` → Gemini intent parsing, validation, allow-listed service action |
| POST | `/api/expenses` | Create expense: `{ "amount": 250, "category": "Food", "description": "Lunch", "date": "2026-11-03" }` |
| GET | `/api/expenses` | List recent expenses; optional `?limit=20` |
| GET | `/api/expenses/summary` | Current Monday–now week aggregate and category totals |
| POST | `/api/tasks` | Create task: `{ "title": "Prepare DBMS", "priority": "high" }` |
| GET | `/api/tasks` | List tasks; optional `?status=pending` or `?status=completed` |
| PATCH | `/api/tasks/:id/complete` | Mark task completed |
| POST | `/api/reminders` | Create reminder: `{ "title": "Submit assignment", "reminderDate": "2026-11-04T10:00:00+05:30" }` |
| GET | `/api/reminders` | List upcoming, incomplete reminders |
| GET | `/api/campus` | Sample campus dataset, explicitly labeled |
| GET | `/api/health` | API, MongoDB and Gemini configuration status |

Typical status codes: `200` success, `201` created, `400` validation failure, `404` unknown route/task, `409` duplicate conflict, `429` rate limited, `500` unexpected server failure, `503` missing Gemini configuration. Voice processing may return `502` for malformed AI output.

## Architecture and safety

- Angular standalone components, Angular Router, Reactive-free template forms where appropriate, `HttpClient`, RxJS subscriptions, and Tailwind CSS configuration are included. UI styling uses authored CSS on top of the Tailwind setup.
- Browser speech recognition is progressive enhancement; typed input remains available when unsupported.
- Gemini returns schema-constrained JSON. Backend code validates inputs with Zod and uses an explicit `switch` intent-to-service allow-list. AI output is never interpreted as code or as a MongoDB query.
- Database models use Mongoose validation, timestamps, and indexes.
- Helmet, CORS allow-list, JSON body size limit, and API rate limiting are enabled.
- No destructive intent is exposed through Gemini. Mark-complete is a direct UI/API action.

## Troubleshooting

**Microphone button says unsupported** — Use a current Chrome or Edge browser. SpeechRecognition support differs by browser and OS. Typed command fallback remains available.

**Microphone permission denied** — Click the site controls beside the address bar, allow Microphone, reload the page, and try again. Outside localhost, use HTTPS.

**No transcript / no speech result** — Check OS microphone input, browser permission, selected input device and internet connection (some browser speech engines use online services). Try a shorter command or use the text fallback.

**MongoDB connection failed** — Confirm MongoDB is running and reachable. Check `MONGODB_URI`, credentials, Atlas network access list and outbound connectivity. The API will not start until the database connects.

**Gemini missing key / 503** — Set `GEMINI_API_KEY` in `backend/.env`, verify it is valid and has API access, then restart the backend. Do not add it to Angular code. A 429/403 from Google may indicate quota, billing, region or key restrictions.

**CORS / API unavailable** — Confirm backend is on port 5000 and `CLIENT_URL=http://localhost:4200`. Confirm `frontend/src/environments/environment.ts` points to `http://localhost:5000/api`.

**No spoken response** — Check Settings → Spoken responses, browser audio output and device volume. SpeechSynthesis voices vary by platform.

## Project structure

```text
campusvoice-ai/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB connection
│   │   ├── controllers/     # Voice command controller
│   │   ├── middleware/      # Central error handler
│   │   ├── models/          # Expense, Task, Reminder
│   │   ├── routes/          # REST endpoints
│   │   ├── services/        # Gemini, action services, sample campus data
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/app/
│   │   ├── core/            # API service
│   │   ├── features/        # Dashboard, expenses, tasks, campus, settings
│   │   ├── app.component.ts
│   │   └── app.routes.ts
│   ├── src/environments/
│   ├── angular.json
│   └── package.json
├── README.md
└── package.json
```

## Test / verification notes

The source is structured for the commands above and includes all required route handlers, models and UI flows. Dependency installation, Angular production compilation, Gemini API calls, and a live MongoDB/microphone run depend on the target machine's network, credentials, browser and local services; they must be verified on the demo laptop. No real API key or college dataset is bundled. Run `npm run install:all`, `npm --prefix frontend run build`, and then complete the live demo checklist before presenting.
