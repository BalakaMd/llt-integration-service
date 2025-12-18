# LittleLifeTrip Integration Service

A Node.js microservice that provides unified access to external APIs for the LittleLifeTrip travel planning platform.

## Features

- **Weather API** - 5-day weather forecasts via OpenWeatherMap
- **Maps API** - POI search and geocoding via Google Maps
- **Calendar API** - Google Calendar integration for trip events
- **Two-level caching** - Redis (fast) + PostgreSQL (persistent)
- **Swagger documentation** - Interactive API docs

## Tech Stack

- **Runtime:** Node.js 18
- **Framework:** Express.js
- **Database:** PostgreSQL 15 (Sequelize ORM)
- **Cache:** Redis 7
- **External APIs:** OpenWeatherMap, Google Maps, Google Calendar
- **Validation:** Joi
- **Documentation:** Swagger (OpenAPI 3.0)

## Quick Start

### Prerequisites

- Docker & Docker Compose
- API Keys:
  - [OpenWeatherMap API Key](https://openweathermap.org/api)
  - [Google Maps API Key](https://console.cloud.google.com/)
  - [Google OAuth2 Credentials](https://console.cloud.google.com/) (for Calendar)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd llt-integration-service
```

2. Create `.env` file from example:

```bash
cp .env.example .env
```

3. Fill in your API keys in `.env`:

```env
GOOGLE_MAPS_API_KEY=your_google_maps_key
OPENWEATHER_API_KEY=your_openweather_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3003/api/v1/integrations/calendar/google/callback
```

4. Start the service:

```bash
docker-compose up --build
```

5. Access the service:

- **API:** http://localhost:3003/api/v1/integrations
- **Swagger UI:** http://localhost:3003/integrations/docs
- **Health Check:** http://localhost:3003/integrations/health

## API Endpoints

### Weather

| Method | Endpoint                  | Description                     |
| ------ | ------------------------- | ------------------------------- |
| GET    | `/weather/city?city=Kyiv` | Get 5-day forecast by city name |

**Query Parameters:**

- `city` (required) - City name
- `start_date` (optional) - Filter start date (YYYY-MM-DD)
- `end_date` (optional) - Filter end date (YYYY-MM-DD)

**Example Response:**

```json
{
  "data": {
    "city": "Kyiv",
    "city_en": "Kyiv",
    "coordinates": { "lat": 50.4501, "lng": 30.5234 },
    "forecast": [
      {
        "date": "2024-12-18",
        "temp_min_c": -2.5,
        "temp_max_c": 3.8,
        "condition": "light snow",
        "humidity_percent": 78,
        "precipitation_chance": 60
      }
    ]
  }
}
```

### Maps

| Method | Endpoint               | Description                       |
| ------ | ---------------------- | --------------------------------- |
| POST   | `/maps/pois`           | Search POIs by city and interests |
| GET    | `/maps/city?city=Kyiv` | Get city information              |

**POST /maps/pois Request Body:**

```json
{
  "city": "Kyiv",
  "interests": ["history", "food", "culture"]
}
```

### Calendar

| Method | Endpoint                                 | Description             |
| ------ | ---------------------------------------- | ----------------------- |
| GET    | `/calendar/google/connect?userId=<uuid>` | Start OAuth2 flow       |
| GET    | `/calendar/google/callback`              | OAuth2 callback         |
| GET    | `/calendar/status?userId=<uuid>`         | Check connection status |
| POST   | `/calendar/events`                       | Create calendar event   |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Integration Service                       │
├─────────────────────────────────────────────────────────────┤
│  Routes (Joi validation) → Controllers → Services           │
├─────────────────────────────────────────────────────────────┤
│                     Caching Layer                            │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐  │
│  │   Redis     │ ←→ │  PostgreSQL │ ←→ │  External APIs  │  │
│  │  (3h TTL)   │    │  (persist)  │    │                 │  │
│  └─────────────┘    └─────────────┘    └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Caching Strategy

1. **Request comes in** → Check Redis (fastest)
2. **Redis miss** → Check PostgreSQL (persistent)
3. **PostgreSQL miss** → Call external API
4. **Save to both** → Redis + PostgreSQL

Benefits:

- Fast responses (Redis: ~5ms)
- Data survives Redis restart (PostgreSQL backup)
- Reduced API quota usage

## Project Structure

```
llt-integration-service/
├── config/
│   ├── config.js          # Database configuration
│   ├── database.js        # Sequelize instance
│   └── oauth.js           # Google OAuth2 client
├── src/
│   ├── config/
│   │   └── swagger.js     # Swagger configuration
│   ├── controllers/       # Request handlers
│   ├── middlewares/       # Validation middleware
│   ├── models/            # Sequelize models
│   ├── routes/            # API routes with Swagger docs
│   ├── services/          # Business logic
│   ├── utils/             # Redis & Google Maps clients
│   ├── validators/        # Joi schemas
│   └── app.js             # Application entry point
├── docker-compose.yml
├── Dockerfile
├── package.json
└── .env.example
```

## Environment Variables

| Variable               | Description                 |
| ---------------------- | --------------------------- |
| `PORT`                 | Server port (default: 3003) |
| `DB_HOST`              | PostgreSQL host             |
| `DB_PORT`              | PostgreSQL port             |
| `DB_NAME`              | Database name               |
| `DB_USER`              | Database user               |
| `DB_PASS`              | Database password           |
| `REDIS_HOST`           | Redis host                  |
| `REDIS_PORT`           | Redis port                  |
| `GOOGLE_MAPS_API_KEY`  | Google Maps API key         |
| `OPENWEATHER_API_KEY`  | OpenWeatherMap API key      |
| `GOOGLE_CLIENT_ID`     | Google OAuth2 client ID     |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret |
| `GOOGLE_CALLBACK_URL`  | OAuth2 callback URL         |

## Integration with Other Services

For services running in separate Docker Compose networks, use:

```python
# Python example
INTEGRATION_SERVICE_URL = "http://host.docker.internal:3003/api/v1/integrations"
```

## Development

### Run locally (without Docker):

```bash
npm install
npm run dev
```

### Reset database:

```bash
docker-compose down -v
docker-compose up --build
```
