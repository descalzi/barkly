# Barkly - Dog Health Tracking Application

🐾 A mobile-first web application to track your dog's health events, vet visits, and medicine schedules.

## Overview

Barkly helps dog owners monitor and track:
- Daily health events (poo quality, vomiting, nausea, itching, etc.)
- Vet visits with linked vet records
- Medicine schedules and dosages
- Timeline and calendar views of all events

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Material-UI (MUI)
- Google OAuth for authentication
- pnpm package manager

### Backend
- Python 3.12
- FastAPI
- SQLAlchemy
- SQLite database
- Google OAuth + JWT authentication

### Deployment
- Docker with multi-stage build
- Unified container (Nginx + FastAPI)
- Traefik for path-based routing at `/barkly`

## Project Status

**Phase 1: Scaffolding & Authentication** ✅ COMPLETE

- [x] Backend structure with FastAPI
- [x] Frontend structure with React 19 + TypeScript
- [x] Google OAuth authentication flow
- [x] JWT-based session management
- [x] Docker configuration (Dockerfile, docker-compose, nginx)
- [x] Professional MUI theme with glows, shadows, animations

**Coming Next:**
- Phase 2: Database Models & Core CRUD (Dogs, Vets, Medicines)
- Phase 3: Frontend Settings UI
- Phase 4: Events & Timeline Backend
- Phase 5: Timeline View UI
- Phase 6: Calendar View
- Phase 7: Polish & Optimization
- Phase 8: Deployment & Testing

## Prerequisites

1. **Google OAuth Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create a new OAuth 2.0 Client ID
   - Add authorized redirect URIs:
     - `http://localhost:8080` (development)
     - `http://localhost:8083` (Docker local)
     - `https://chunkyboy.reindeer-great.ts.net/barkly` (production)
   - Copy the Client ID and Client Secret

2. **Software**
   - Node.js 20+ and pnpm (`npm install -g pnpm`)
   - Python 3.12+
   - Docker and Docker Compose (for containerized deployment)

## Quick Start - Testing Phase 1

**Current Status:** ✅ Frontend dependencies installed, ✅ Backend venv created with all dependencies installed

**What you need to do:**

1. **Get your Google Client Secret** from Google Cloud Console (link in Prerequisites above)
2. **Generate a SECRET_KEY** and update `backend/.env`:
   ```bash
   cd backend
   source venv/bin/activate
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   # Copy the output and replace the SECRET_KEY in backend/.env
   ```
3. **Update `backend/.env`** with your Google Client Secret and generated SECRET_KEY
4. **Start the backend** (in one terminal):
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
5. **Start the frontend** (in another terminal):
   ```bash
   cd frontend
   pnpm dev
   ```
6. **Test authentication** at http://localhost:8080 - click "Sign in with Google"

## Setup Instructions

### 1. Configure Environment Variables

#### Frontend Environment (Already Configured ✅)
The frontend `.env` file is already set up with your Google Client ID:
```bash
cd frontend
cat .env  # Verify it has VITE_GOOGLE_CLIENT_ID set
```

#### Backend Environment (Needs Configuration)
The backend `.env` file has been created with your Google Client ID, but you need to:

1. **Get your Google Client Secret** from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. **Generate a secure SECRET_KEY**:
   ```bash
   cd backend
   source venv/bin/activate
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```
3. **Edit `backend/.env`** and replace:
   - `GOOGLE_CLIENT_SECRET=GOCSPX-placeholder-replace-with-actual-secret` with your actual secret
   - `SECRET_KEY=change-this-to-a-secure-random-key-in-production` with the generated key

Your `backend/.env` should look like:
```env
DATABASE_URL=sqlite:///./barkly.db
GOOGLE_CLIENT_ID=336731728647-3tt33rpva8cgugenlhigjthhaqi4j4ah.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-actual-secret-here
SECRET_KEY=your-generated-random-key-here
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:8083
```

#### Docker Environment
Create `.env` file in the project root:
```env
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
SECRET_KEY=your-generated-secret-key-here
```

### 2. Development Mode (Separate Frontend & Backend)

#### Run Backend (Using Virtual Environment)
```bash
cd backend

# Activate the virtual environment
source venv/bin/activate

# Dependencies are already installed, but if needed:
# pip install -r requirements.txt

# Start the backend server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend will run at: http://localhost:8000
API docs available at: http://localhost:8000/docs

**Note:** The venv is already set up with all dependencies installed!

#### Run Frontend (in a separate terminal)
```bash
cd frontend

# Dependencies are already installed, but if needed:
# pnpm install

# Start the frontend dev server
pnpm dev
```

Frontend will run at: http://localhost:8080

### 3. Docker Mode (Unified Container)

```bash
# Build and run
docker compose up -d --build

# View logs
docker compose logs -f

# Stop
docker compose down
```

Application will be available at: http://localhost:8083

### 4. Production Deployment with Traefik

Ensure Traefik network exists:
```bash
docker network create traefik-network
```

Deploy:
```bash
docker compose up -d --build
```

Application will be available at: https://chunkyboy.reindeer-great.ts.net/barkly

## Project Structure

```
barkly/
├── frontend/               # React frontend
│   ├── src/
│   │   ├── api/           # API client
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── theme/         # MUI theme
│   │   ├── types/         # TypeScript types
│   │   ├── utils/         # Utility functions
│   │   └── contexts/      # React contexts (Auth)
│   ├── .env               # Development config
│   └── .env.production    # Production config
├── backend/               # FastAPI backend
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── services/     # Business logic
│   │   ├── main.py       # FastAPI app
│   │   ├── database.py   # SQLAlchemy models
│   │   └── models.py     # Pydantic schemas
│   └── requirements.txt
├── Dockerfile            # Multi-stage Docker build
├── docker-compose.yml    # Docker Compose config
├── nginx.conf           # Nginx configuration
└── start.sh             # Container startup script
```

## Current Features (Phase 1)

✅ Google OAuth authentication
✅ JWT-based session management
✅ Protected routes (authentication required)
✅ Professional mobile-first UI with MUI theme
✅ Bottom navigation layout
✅ User profile management
✅ Docker deployment ready

## API Endpoints

### Authentication
- `POST /api/auth/google` - Authenticate with Google OAuth token
- `GET /api/auth/me` - Get current user info (requires auth)

### Health
- `GET /health` - Health check endpoint

## Development Notes

### Icon Placeholders
Throughout the code, you'll find comments marked with `TODO: Icon placeholder` and suggested prompts for Freepik special-lineal-color icons. Replace MUI icons with your custom icons when ready.

### Database
Currently using SQLite for simplicity. The database file is stored in:
- Development: `backend/barkly.db`
- Docker: `/app/data/barkly.db` (persisted in Docker volume)

### Authentication Flow
1. User clicks "Sign in with Google" on LoginPage
2. Google OAuth popup appears
3. Frontend receives Google ID token
4. Token sent to `/api/auth/google` endpoint
5. Backend verifies token with Google
6. Backend creates/updates user in database
7. Backend generates JWT and returns with user info
8. Frontend stores JWT in localStorage
9. Subsequent requests include JWT in Authorization header

## Next Steps

To continue with Phase 2 (Database Models & Core CRUD):

1. Add remaining SQLAlchemy models to `backend/app/database.py`:
   - Dogs
   - Vets
   - Medicines
   - Events
   - VetVisits
   - MedicineEvents

2. Create Pydantic schemas in `backend/app/models.py`

3. Implement API routes:
   - `backend/app/api/dogs.py`
   - `backend/app/api/vets.py`
   - `backend/app/api/medicines.py`

4. Test endpoints using FastAPI Swagger docs at `/docs`

## Troubleshooting

### "Invalid Google Client ID" error
- Verify VITE_GOOGLE_CLIENT_ID is set correctly in frontend/.env
- Ensure the Client ID matches the one from Google Cloud Console
- Check authorized redirect URIs in Google Cloud Console

### Backend database errors
- Delete the SQLite database file and restart to recreate tables
- Check DATABASE_URL environment variable

### CORS errors
- Verify ALLOWED_ORIGINS in backend includes your frontend URL
- Check that backend is running on correct port (8000)

### Docker build fails
- Ensure pnpm is installed in the Node container
- Check that frontend/.env.production exists
- Verify all COPY paths in Dockerfile are correct

## License

MIT

## Contributors

Built with ❤️ for dog owners everywhere
