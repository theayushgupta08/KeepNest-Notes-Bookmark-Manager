# Personal Notes and Bookmark Manager Backend

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
   The server will run on `http://localhost:5000` by default.

## API Endpoints

### Notes API
- `POST /api/notes` — Create a note
- `GET /api/notes` — List notes (`?q=searchTerm&tags=tag1,tag2` optional)
- `GET /api/notes/:id` — Get note by ID
- `PUT /api/notes/:id` — Update note
- `DELETE /api/notes/:id` — Delete note

#### Note Object
```json
{
  "content": "string (required)",
  "tags": ["tag1", "tag2"]
}
```

### Bookmarks API
- `POST /api/bookmarks` — Create a bookmark
- `GET /api/bookmarks` — List bookmarks (`?q=searchTerm&tags=tag1,tag2` optional)
- `GET /api/bookmarks/:id` — Get bookmark by ID
- `PUT /api/bookmarks/:id` — Update bookmark
- `DELETE /api/bookmarks/:id` — Delete bookmark

#### Bookmark Object
```json
{
  "url": "string (required, valid URL)",
  "title": "string (optional, auto-fetched if empty)",
  "description": "string (optional)",
  "tags": ["tag1", "tag2"]
}
```

## Validation & Errors
- Required fields are validated.
- Bookmarks require a valid URL.
- Returns proper HTTP status codes and error messages.
- If bookmark title is empty, the server will try to fetch the page title from the URL. 