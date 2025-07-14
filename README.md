# Personal Notes & Bookmark Manager

A full-stack web app to manage your personal notes and bookmarks with robust authentication, search, tags, and favorites. Built with Node.js, Express, Next.js, and Tailwind CSS.

---

## 🚀 Product Features
- **User Authentication** (JWT, registration & login)
- **Notes & Bookmarks CRUD** (create, read, update, delete)
- **Search & Tag Filtering**
- **Mark Favorites** (toggle, filter)
- **Auto-fetch Bookmark Titles**
- **Responsive, Modern UI** (Next.js + Tailwind CSS)
- **Per-user Data Isolation**
- **In-memory Storage** (for demo/testing)
- **Proper HTTP Status Codes & Error Handling**

---

## ⚡ Project Setup

### 1. Backend (Node.js + Express)
```bash
cd backend-manager
npm install
npm start
# Runs on http://localhost:5000
```

### 2. Frontend (Next.js + Tailwind CSS)
```bash
git clone https://github.com/theayushgupta08/frontend-manager.git
cd frontend-manager
npm install
npm run dev
# Runs on http://localhost:3000
```

---

## 📚 API Documentation (Backend)

### Auth
- `POST /api/register` — Register new user `{ username, password }`
- `POST /api/login` — Login, returns `{ token }`

### Notes
- `POST /api/notes` — Create note *(auth required)*
- `GET /api/notes` — List notes (`?q=search&tags=tag1,tag2&favorite=true`)
- `GET /api/notes/:id` — Get note by ID
- `PUT /api/notes/:id` — Update note
- `DELETE /api/notes/:id` — Delete note
- `PATCH /api/notes/:id/favorite` — Toggle favorite

#### Note Object
```json
{
  "content": "string (required)",
  "tags": ["tag1", "tag2"],
  "favorite": true
}
```

### Bookmarks
- `POST /api/bookmarks` — Create bookmark *(auth required)*
- `GET /api/bookmarks` — List bookmarks (`?q=search&tags=tag1,tag2&favorite=true`)
- `GET /api/bookmarks/:id` — Get bookmark by ID
- `PUT /api/bookmarks/:id` — Update bookmark
- `DELETE /api/bookmarks/:id` — Delete bookmark
- `PATCH /api/bookmarks/:id/favorite` — Toggle favorite

#### Bookmark Object
```json
{
  "url": "string (required, valid URL)",
  "title": "string (optional, auto-fetched if empty)",
  "description": "string (optional)",
  "tags": ["tag1", "tag2"],
  "favorite": true
}
```

---

## 🛰️ Sample cURL Requests

**Register:**
```bash
curl -X POST http://localhost:5000/api/register -H "Content-Type: application/json" -d '{"username":"testuser","password":"testpass"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/login -H "Content-Type: application/json" -d '{"username":"testuser","password":"testpass"}'
```

**Create Note:**
```bash
curl -X POST http://localhost:5000/api/notes -H "Authorization: Bearer <JWT>" -H "Content-Type: application/json" -d '{"content":"My note","tags":["personal"]}'
```

**List Bookmarks:**
```bash
curl -X GET http://localhost:5000/api/bookmarks -H "Authorization: Bearer <JWT>"
```

---

## 🧑‍💻 Skills This Tests
- REST API design & security (JWT)
- Data validation & error handling
- React (Next.js) routing & state
- Tailwind CSS for UI
- Clean code & project structure
- Real-world data modeling

---

*For more details, see the `/frontend-manager` and `/backend-manager` directories.* #
