# GeoTube

Discover and analyze YouTube videos by geographic location. Search any topic and see where in the world content comes from — plotted on an interactive 3D globe. Compare countries, travel through time, watch trending content by region, and take a cinematic AI-narrated world tour.

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Java | 17+ | Backend runtime |
| Maven | 3.8+ | Backend build |
| Node.js | 18+ | Frontend runtime |
| npm | 9+ | Frontend package manager |
| MongoDB | 6+ | Database |
| Ollama | latest | Local LLM for AI features |

---

## 1. Clone the Repository

```bash
git clone <repo-url>
cd ise_project
```

---

## 2. MongoDB Setup

Make sure MongoDB is running locally on the default port:

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Ubuntu / Debian
sudo systemctl start mongod

# Verify it's running
mongosh --eval "db.runCommand({ connectionStatus: 1 })"
```

MongoDB will automatically create the `geotube` database on first use. No manual schema setup is needed.

---

## 3. Ollama Setup (AI Features)

Ollama runs the local LLM used for comparative analysis, story narratives, and route planning.

```bash
# macOS
brew install ollama

# Start the Ollama server
ollama serve

# In a separate terminal, pull the default model
ollama pull deepseek-r1:14b
```

> Ollama is optional. If it is not running, the app falls back to rule-based extraction automatically.

---

## 4. Backend Setup

### 4.1 Configure API Keys

Open `backend/src/main/resources/application.properties` and set your YouTube Data API v3 key:

```properties
youtube.api.key=YOUR_YOUTUBE_API_KEY_HERE
```

Optionally set a MongoDB URI if not using the default localhost:

```properties
spring.data.mongodb.uri=mongodb://localhost:27017/geotube
```

Alternatively, export them as environment variables before running:

```bash
export YOUTUBE_API_KEY=your_key_here
export MONGODB_URI=mongodb://localhost:27017/geotube
```

### 4.2 Build the Backend

```bash
cd backend
mvn clean package -DskipTests
```

This produces `target/geotube-backend-0.0.1-SNAPSHOT.jar`.

### 4.3 Run the Backend

```bash
java -jar target/geotube-backend-0.0.1-SNAPSHOT.jar
```

Or run directly with Maven:

```bash
mvn spring-boot:run
```

The backend starts on **http://localhost:8080**.

To verify it is running:

```bash
curl http://localhost:8080/api/trending
```

---

## 5. Frontend Setup

### 5.1 Install Dependencies

```bash
cd frontend
npm install
```

### 5.2 Environment (optional)

By default the frontend connects to `http://localhost:8080`. To use a different backend URL, create a `.env` file in the `frontend/` directory:

```env
REACT_APP_API_URL=http://localhost:8080
```

### 5.3 Run the Frontend

```bash
npm start
```

The app opens at **http://localhost:3000**.

---

## 6. Running Everything Together

Open three terminals:

**Terminal 1 — MongoDB**
```bash
brew services start mongodb-community   # or: mongod --dbpath /data/db
```

**Terminal 2 — Backend**
```bash
cd backend
mvn spring-boot:run
```

**Terminal 3 — Frontend**
```bash
cd frontend
npm start
```

Then visit **http://localhost:3000**.

---

## 7. Features

| Mode | How to Use |
|------|-----------|
| **Explore** | Type a topic (e.g. "street food") and click Search. Country markers appear on the globe sized by video count. Click a country to see cities, click a city to see videos. |
| **Time Travel** | Switch to Timeline mode. Drag the year slider to filter content by publication year. |
| **Trending Live** | Switch to Trending mode. Globe shows live trending regions. Click a region to see its top videos. |
| **Comparative Analysis** | After a search, click countries to select them (up to 4), then click Analyze. A dashboard appears with radar charts, bar charts, heatmaps, and an Ask AI tab. |
| **Globe Story Mode** | After a search, click the Story button. An AI-narrated cinematic world tour plays across up to 6 countries with animated camera travel. |

---

## 8. API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/search` | Search videos by topic, returns country markers |
| GET | `/api/country/{country}?query=` | Get cities within a country |
| GET | `/api/city/{city}?query=` | Get videos for a city |
| POST | `/api/analyze` | Run comparative analysis for 2–4 countries |
| POST | `/api/analyze/chat` | Ask AI a question about an analysis |
| POST | `/api/story/generate` | Generate a Globe Story Mode world tour |
| GET | `/api/trending` | Get trending videos for 10 regions |
| GET | `/api/timeline?query=&year=` | Get country hotspots filtered by year |

---

## 9. Troubleshooting

**Globe does not load**
- Make sure the backend is running and reachable at `http://localhost:8080`.
- Check the browser console for CORS errors.

**Search returns no results**
- Verify the YouTube API key in `application.properties` is valid and has the YouTube Data API v3 enabled in Google Cloud Console.

**Analysis / Story has no AI narrative**
- Check that Ollama is running (`ollama serve`) and the model is downloaded (`ollama pull deepseek-r1:14b`).
- The app will still work with rule-based fallback if Ollama is unavailable.

**MongoDB connection error**
- Confirm MongoDB is running: `mongosh --eval "db.adminCommand('ping')"`
- Check that the URI in `application.properties` matches your MongoDB setup.

**Port conflicts**
- Backend port can be changed in `application.properties`: `server.port=8080`
- Frontend port can be changed by setting `PORT=3001 npm start`
