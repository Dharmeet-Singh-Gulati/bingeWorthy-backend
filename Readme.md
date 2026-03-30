# 🔐 bingeWorthy Backend (Proxy Server)

A lightweight backend proxy built to securely handle API requests for the bingeWorthy application. This server ensures that sensitive API keys (Hugging Face, TMDB) are not exposed on the client side.

---

## 🚀 Purpose

* Hide and protect API keys from being exposed in the frontend
* Route AI (GPT) requests securely through a backend layer
* Act as a middleware between frontend and external APIs

---

## ⚙️ Tech Stack

* Node.js
* Express.js
* Axios
* Deployment: Render

---

## 🔗 Live Integration

Frontend Application:
👉 https://streamgpt-80b01.web.app

---

## 🔌 API Endpoint

### POST `/api/gpt`

Handles AI-based movie recommendations.

#### Request Body:

```json
{
  "query": "action movies",
  "numberOfMovies": 5
}
```

#### Description:

* Sends request to Hugging Face via secure backend
* Returns a list of recommended movies

---

## 🔐 Security

> All external API calls are routed through this server to prevent exposure of API keys in the browser.

---

## 🛠 Setup

```bash
npm install
npm start
```

Create a `.env` file:

```env
HF_API_KEY=your_huggingface_api_key
TMDB_API_KEY=your_tmdb_api_key
```

---

## 📌 Note

This backend is designed as a minimal proxy layer and does not include database or authentication logic.
