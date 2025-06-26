# Arc‑PDF

A single‑page app for uploading PDFs and chatting with their content.  
The repository now ships with **Storybook**, **Chromatic visual tests**, and **Playwright E2E smoke tests** configured for CI on GitHub Actions. (video walkthrough)

---

## ➤ Run locally with Docker‑Compose

```bash
# 1. clone + cd
$ git clone https://github.com/punlx/arc-pdf.git

# 2. start everything
$ docker compose up --build
```

| Works                              | Scripts                                            |
| ---------------------------------- | -------------------------------------------------- |
| **Dev server (Vite + HMR)**        | `yarn dev`                                         |
| **Build โปรดักชัน**                | `yarn build`                                       |
| **Preview ไฟล์ build**             | `yarn preview`                                     |
| **Storybook (โหมด dev)**           | `yarn storybook`                                   |
| **Build Storybook static**         | `yarn build-storybook`                             |
| **Unit tests (Vitest)**            | `yarn test`                                        |
| **Watch tests**                    | `yarn test:watch`                                  |
| **Report coverage**                | `yarn coverage`                                    |
| **Storybook tests (Vitest-addon)** | `yarn test:storybook`                              |
| **UI test runner (Vitest UI)**     | `yarn test:ui`                                     |
| **E2E – ชุดเต็ม (Playwright)**     | `yarn e2e`                                         |
| **E2E – smoke subset**             | `yarn e2e:smoke`                                   |
| **E2E – debug/headed mode**        | `yarn e2e:debug`                                   |
| **แสดงรายงาน E2E ล่าสุด**          | `yarn e2e:report`                                  |
| **Chromatic visual tests**         | `npx chromatic` (ต้องมี `CHROMATIC_PROJECT_TOKEN`) |

## 1. Project Structure & Component Breakdown

```txt
src/
├── api/                # Axios clients + type‑safe service functions
│   ├── chat.ts         # Q&A (REST) + Zod schemas
│   ├── wsChat.ts       # Q&A (WebSocket streaming)
│   ├── upload.ts       # PDF upload
│   ├── files.ts        # List / delete files
│   └── reset.ts        # Reset session or entire store
│
├── components/
│   ├── chat/           # Chat‑focused UI (ChatWindow, MessageBubble, InputBar)
│   ├── layout/         # Shell, Header, Sidebar, settings sheets, toggles
│   ├── upload/         # DropZone + responsive UploadPanel
│   ├── theme/          # ThemeProvider / Select / Toggle
│   ├── memory/         # MemoryBadge (LLM memory indicator)
│   └── ui/             # Primitive, design‑system‑like components (button, select, …)
│
├── hooks/              # Side‑effect logic isolated in React hooks
│   ├── useChatSubmit.ts   # REST/WS send logic + optimistic UI
│   ├── useChatHistory.ts  # Load history on `/chatId`
│   ├── useFilesSync.ts    # Keep file list in sync
│   ├── useSessionsSync.ts # Pre‑fetch all sessions (sidebar)
│   ├── usePdfUploader.ts  # Shared PDF uploader logic
│   └── useTypingEffect.ts # Home page typing animation
│
├── stores/             # Global state via Zustand
│   ├── chatStore.ts       # Current chat / messages
│   ├── filesStore.ts      # Uploaded files
│   ├── sessionsStore.ts   # All sessions meta
│   └── configStore.ts     # App‑level config (streaming mode flag)
│
├── routes/             # React‑Router pages (`/` & `/:chatId`)
│   ├── HomePage.tsx
│   └── ChatPage.tsx
│
├── lib/                # Pure‑JS helpers (fullReset, utils)
└── main.tsx / App.tsx  # Entrypoint + Router + Theme provider
```

### Key Interaction Flow

1. **Upload PDF** – `usePdfUploader` สร้าง session (ถ้ายังไม่มี) แล้ว POST `/api/upload`
2. **Ask & Answer** – `useChatSubmit` ส่ง REST **หรือ** WS ตาม toggle, แสดง “Thinking…” ก่อน
3. **History Sync** – `useChatHistory` + `useFilesSync` โหลดย้อนหลังเมื่อเข้าหน้า `/chatId`
4. **Sidebar Sessions** – ซิงก์ด้วย `useSessionsSync` + Zustand

---

## 2. Trade‑offs & Assumptions

| ประเด็น          | สิ่งที่เลือกทำ           | ผลดี                             | ข้อแลกเปลี่ยน / สมมติฐาน         |
| ---------------- | ------------------------ | -------------------------------- | -------------------------------- |
| State Management | Zustand (ไม่ใช้ Redux)   | Boilerplate ต่ำ, straightforward | ไม่มี time‑travel devtools ในตัว |
| Streaming Mode   | REST / WS toggle ใน UI   | ยืดหยุ่นต่อ backend              | ผู้ใช้ต้องเข้าใจ mode เอง        |
| File Upload      | จำกัด 10 MB/ไฟล์         | ป้องกัน OOM บน demo server       | ไม่รองรับ resumable upload       |
| Storage          | Mock in‑memory (backend) | Dev เร็ว, setup ง่าย             | ข้อมูลหายเมื่อ restart           |
| Styling          | Tailwind + shadcn/ui     | สปีด dev เร็ว, dark‑mode ง่าย    | อาจเกิด class‑bloat ถ้า scale    |
| DX               | Vite + Hot Reload        | Feedback loop เร็ว               | ยังไม่มี CI enforce lint/test    |
| App DX           | คล้ายๆ Chat AI ทั่วไป    | เข้าใจง่ายในการใช้งาน            | อาจจะรู้สึกจำเจ แต่ก็เข้าถึงง่าย |

---

## 3. Real‑World Improvement Roadmap

| หมวด              | สิ่งที่จะทำ                                                                 | เหตุผล                                |
| ----------------- | --------------------------------------------------------------------------- | ------------------------------------- |
| **Observability** | + **Sentry** (frontend & backend) <br> + Datadog APM                        | จับ error + trace latency ทุก request |
| **CI / CD**       | GitHub Actions: `lint → test → build` <br> Docker multi‑stage → GHCR → Prod | Automation, reproducible builds       |
| **Security**      | JWT auth, rate‑limit, virus‑scan PDF                                        | Hardening สำหรับ production           |
| **Performance**   | Virtualize long chat (react‑window) <br> Reconnect & back‑pressure WS       | UX ลื่นไหล, รองรับโหลดสูง             |
| **UX**            | Resumable uploads (Tus) <br> Keyboard shortcuts, i18n                       | Delight ผู้ใช้ & รองรับตลาดกว้าง      |

---

## 4. Loom Walk‑through

> Youtube Link (IN Process)
>
> 1. Upload → Chat demo (REST & WS)
> 2. VS Code code‑tour (components/hooks/stores)
> 3. CI pipeline

---
