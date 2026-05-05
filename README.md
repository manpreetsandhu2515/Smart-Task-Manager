# Smart Task Manager API

Production-style FastAPI backend for managing tasks with JWT authentication and PostgreSQL.

## Features

- User registration and login with JWT tokens
- Task CRUD for authenticated users
- Task priority (`low`, `medium`, `high`)
- Due date filtering and completion status
- PostgreSQL database support
- Clean modular code structure
- Ready for deployment with environment variables

## Project structure

```
app/
  main.py
  auth.py
  database.py
  models.py
  schemas.py
  routes/
    __init__.py
    task.py
    user.py
frontend/
  index.html
  style.css
  app.js
docs/
  index.html
  style.css
  app.js
.github/
  workflows/
    ci.yml
requirements.txt
README.md
```

## Setup

1. Create a Python virtual environment:

```bash
python -m venv .venv
.venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Create a PostgreSQL database and set the connection string:

```bash
set DATABASE_URL=postgresql://user:password@localhost/taskdb
set SECRET_KEY=your-secret-key
```

4. Run the app:

```bash
uvicorn app.main:app --reload
```

5. Open the API docs:

```text
http://127.0.0.1:8000/docs
```

## Frontend preview

Open the static frontend with your browser:

```bash
start frontend\index.html
```

Use the login/register forms and the task manager UI to interact with the local FastAPI backend.

## GitHub deployment

1. Initialize git and commit the project:

```bash
git init
git add .
git commit -m "Add Smart Task Manager backend and frontend"
```

2. Push to your GitHub repository:

```bash
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

3. Use GitHub Pages for the static frontend:

- In GitHub repository Settings → Pages, choose `main` branch and `/docs` folder.
- The static frontend will be available at `https://<your-username>.github.io/<repo-name>/`.

4. Deploy backend separately to a service like Render, Railway, or Heroku.

## Environment variables

- `DATABASE_URL` — PostgreSQL connection URL
- `SECRET_KEY` — JWT signing secret
- `ACCESS_TOKEN_EXPIRE_MINUTES` — token lifetime in minutes

## API endpoints

### Users

- `POST /users/register` — register a new user
- `POST /users/login` — login and receive JWT token
- `GET /users/me` — current authenticated user

### Tasks

- `GET /tasks/` — list tasks with optional filtering
- `POST /tasks/` — create a task
- `GET /tasks/{task_id}` — read one task
- `PATCH /tasks/{task_id}` — update a task
- `DELETE /tasks/{task_id}` — delete a task

## Notes

- The app initializes the database schema automatically on startup.
- Use the Bearer token from `/users/login` for task endpoints.
