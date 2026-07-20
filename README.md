# 🇮🇳 LocGovt — Citizen Services Portal

A production-grade **MERN stack** web application that unifies access to Indian government services with a gamified civic engagement system, intelligent district-based recommendations, community posting, and privacy-first document processing.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏛️ **Services Directory** | Browse 20+ real government portals across 12 categories |
| 📍 **Smart Recommendations** | MongoDB aggregation pipeline ranks services by your district's click history |
| ⚡ **CitizenXP System** | Earn XP for feedback (+50) and community posts (+25); level up automatically |
| 🏅 **Badge Unlocks** | 5 progressive badges from Civic Explorer → National Hero |
| 💬 **Community Hub** | Post tips, upvote experiences, filter by district |
| 📄 **Document Processor** | Compress images below 100KB & compile PDFs — **zero uploads, 100% browser-side** |
| 🔔 **Focus-Triggered Feedback** | Modal auto-activates when you return from an external service tab |

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally (`mongod`)

### 1 — Clone / Open Project
```bash
cd C:\Users\hp\Desktop\govt
```

### 2 — Install Dependencies
```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 3 — Seed the Database (20 real services)
```bash
cd ..\server
npm run seed
```

### 4 — Start Everything
```bash
# Terminal 1 — API (http://localhost:5000)
cd server
npm run dev

# Terminal 2 — React UI (http://localhost:5173)
cd client
npm run dev
```

Open **http://localhost:5173**, go to **Profile**, register an account, then explore!

---

## 📁 Project Structure

```
govt/
├── server/
│   ├── server.js              # Express entry point
│   ├── seed.js                # 20 real Indian govt services seed
│   ├── config/db.js           # Mongoose connection
│   ├── models/                # User, GovtService, Feedback, CommunityPost
│   ├── controllers/           # Business logic with async/await
│   └── routes/                # Express routers
│
└── client/
    ├── src/
    │   ├── App.jsx            # Root router + providers
    │   ├── context/           # UserContext, ToastContext
    │   ├── components/        # Navbar, ServiceCard, FeedbackModal, DocumentProcessor, ...
    │   └── pages/             # Dashboard, Services, Community, Profile
    └── tailwind.config.js     # Brand palette + custom animations
```

---

## 🗄️ API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/users` | Register citizen |
| `GET` | `/api/users/username/:name` | Login by username |
| `GET` | `/api/users/leaderboard` | Top 10 by XP |
| `GET` | `/api/services` | Paginated services list |
| `GET` | `/api/services/recommendations?district=X` | District-aware top 4 |
| `POST` | `/api/services/:id/click` | Track visit + district count |
| `POST` | `/api/services/:id/feedback` | Submit feedback + earn XP |
| `GET` | `/api/community` | Community posts (sort/filter) |
| `POST` | `/api/community/:id/upvote` | Upvote (duplicate-safe) |

---

## 🧠 Key Technical Highlights

**MongoDB Aggregation Pipeline** — Recommendations use `$objectToArray → $filter → $arrayElemAt` to extract district-specific click counts from the `districtWiseClicks` Map field and sort by local popularity.

**Atomic Click Tracking** — Uses MongoDB `$inc` with dynamic nested key (`districtWiseClicks.${district}`) in a single atomic operation.

**Concurrent XP Award** — `Promise.all([feedback.save(), User.findByIdAndUpdate(...$inc...)])` runs both operations simultaneously.

**Level Formula** — `currentLevel = Math.floor(citizenXP / 500) + 1`

**FeedbackModal** — Listens to `window.blur` (user leaves tab) + `window.focus` (user returns) to auto-trigger, with an 8-second fallback.

**DocumentProcessor** — Canvas iteratively reduces JPEG quality until output < 100KB. jsPDF is dynamically imported for PDF compilation. No data ever leaves the browser.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js, Mongoose, MongoDB
- **Frontend**: React 18, Vite, Tailwind CSS, Axios, React Router v6
- **PDF/Image**: jsPDF, HTML5 Canvas API
- **Design**: Dark mode (`#0A0E17`), glassmorphism (`bg-white/5 backdrop-blur-md`), Inter + Outfit fonts

---

## 📜 License

MIT — Built as a demonstration MERN project. Not affiliated with any Indian government entity.
