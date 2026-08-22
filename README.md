# 🌟 Enstine AI - Multi-Model AI Companion & Comparison Platform

Enstine is a full-stack AI platform built with **React (Vite)**, **Node.js (Express)**, and **MongoDB**, powered by top-tier AI models including **Google Gemini**, **OpenAI ChatGPT**, **DeepSeek AI**, and **Groq AI**.

---

## 🏗️ Project Architecture (MVC Pattern)

```
enstine/
├── backend/                  # Node.js + Express MVC Backend
│   ├── config/               # Database & service configurations (db.js)
│   ├── controllers/          # Business logic (chatController.js, settingsController.js)
│   ├── models/               # Mongoose DB models (Thread.js)
│   ├── routes/               # Modular Express API routes (chatRoutes.js, settingsRoutes.js)
│   ├── utils/                # AI model services & routers (ai.js)
│   ├── .env                  # Local secret keys (ignored by Git)
│   ├── .env.example          # Environment variables template
│   ├── package.json
│   └── server.js             # Main server entry point
│
├── frontend/                 # React 19 + Vite Frontend
│   ├── src/
│   │   ├── components/       # UI Components (ModelSelector, ComparisonGrid, PersonaModal, etc.)
│   │   ├── App.jsx           # Main Application Layout
│   │   └── index.css         # Styling design tokens & custom theme
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore                # Root Git ignore rules (protecting .env and node_modules)
└── README.md
```

---

## 🔑 Environment Variables Setup

Copy `backend/.env.example` to `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

Fill in your provider API keys in `backend/.env`:

```env
PORT=5000
MongoDB=mongodb+srv://<username>:<password>@cluster0.mongodb.net/?appName=Cluster0

# AI Provider Keys
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
DEEPSEEK_API_KEY=your_deepseek_key
GROQ_API_KEY=your_groq_key
```

> ⚠️ **Security Note**: Never commit your `.env` file! It is already added to `.gitignore`.

---

## 🚀 How & Where to Deploy Enstine

### Option 1: Render (Recommended for Full-Stack)

**Backend Deployment on Render:**
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your GitHub repository.
3. Set **Root Directory** to `backend`.
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `npm start`
6. Add Environment Variables (`GEMINI_API_KEY`, `OPENAI_API_KEY`, `DEEPSEEK_API_KEY`, `GROQ_API_KEY`, `MongoDB`).

**Frontend Deployment on Render or Vercel:**
1. Create a new **Static Site** on Render or **Project** on [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Set **Build Command**: `npm run build`
4. Set **Publish Directory**: `dist`
5. Configure API Proxy in `vite.config.js` to point to your deployed backend URL.

---

### Option 2: Single-Server Full-Stack Deployment (Railway / Render)

You can serve the static frontend build directly from Express by adding:
```javascript
app.use(express.static(path.join(__dirname, "../frontend/dist")));
```

Build command:
```bash
cd frontend && npm install && npm run build && cd ../backend && npm install
```

Start command:
```bash
node backend/server.js
```

---

## 🛠️ Local Development

1. **Install Dependencies**:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Run Backend & Frontend**:
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev

   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

3. Open `http://localhost:5173` in your browser!
