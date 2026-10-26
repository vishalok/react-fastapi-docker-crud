# React + FastAPI + Docker CRUD

## Requirements
- Docker Desktop installed and running on Windows 11
- A terminal such as PowerShell

## Run the app
In PowerShell, change directory into this extracted project folder and run:

```powershell
docker compose up --build
```

Open:
- React frontend: http://localhost:5173
- FastAPI API root: http://localhost:8000
- Interactive API docs: http://localhost:8000/docs

Stop the app with `Ctrl+C`, or in another terminal run:

```powershell
docker compose down
```

Task data is stored in a named Docker volume and should remain after container recreation. To intentionally delete the database data too, run `docker compose down -v`.

## CRUD endpoints
- `GET /tasks` — list tasks
- `POST /tasks` — create a task, JSON body: `{"title":"Learn Docker"}`
- `PUT /tasks/{id}` — update task, JSON body: `{"title":"Learn Docker","completed":true}`
- `DELETE /tasks/{id}` — delete a task

## Important hosting note
The Compose setup is for local development. For production hosting, deploy the frontend and backend as separate services and use a managed PostgreSQL database for durable production data. Update the frontend `API` constant to the deployed backend URL, configure CORS to allow the deployed frontend origin, and use HTTPS. Do not use the local SQLite file on an ephemeral hosting filesystem for production data.
