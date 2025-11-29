# Resume Insight

AI-assisted resume analyzer built with a React (Vite) frontend, Node/Express backend, MongoDB persistence, and Google Gemini for summarization.

## Prerequisites

- Node.js 18+
- MongoDB instance (Atlas or local)
- Google Gemini API key

## Setup

1. **Backend**
   ```bash
   cd server
   cp .env.example .env
   # fill in MONGO_URI and GEMINI_API_KEY
   npm install
   npm run dev
   ```

2. **Frontend**
   ```bash
   cd client
   npm install
   npm run dev
   ```
   Optionally set `VITE_API_BASE_URL` in `client/.env` if the backend runs on a non-default origin.

## API

- `POST /api/analyze` form-data payload
  - `resume` (file, pdf/txt)
  - `text` (string, optional)
  - `name`, `email` (optional metadata)
  - Responds with `{ result: { skills, summary, suggested_roles }, recordId }`

## Project Structure

- `server/src` Express app, Gemini integration, Mongo models
- `client/src` React UI for uploads, text input, and result display

## Deployment

Deploy backend as a Node service with access to MongoDB and Gemini key, then deploy the Vite build (`npm run build`) to any static host. Configure `VITE_API_BASE_URL` to point to the deployed API.

