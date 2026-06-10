# news_node

A RESTful news API built with Node.js, Express, and MongoDB. Deployed on Vercel.

**Live:** https://news-app-ashy-three-60.vercel.app

---

## Tech stack

| | |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| Database | MongoDB (Mongoose) |
| HTTP client | Axios |
| Date handling | Moment.js |
| Config | dotenv |
| Deployment | Vercel |

---

## Project structure

```
news_node/
├── app.js            # Entry point — Express app setup and route registration
├── Routes/           # Route definitions
├── Services/         # Business logic
├── DAL/              # Data access layer — database queries
├── Models/           # Mongoose schemas
├── vercel.json       # Vercel deployment config
├── .env              # Environment variables (do not commit — see below)
└── package.json
```

The project follows a layered architecture: Routes → Services → DAL → Models. Routes handle HTTP concerns, Services hold business logic, and the DAL isolates all database interactions.

---

## Getting started

### Prerequisites

- Node.js v16+
- A MongoDB connection string (Atlas or local)

### Install and run

```bash
git clone https://github.com/pranee525/news_node.git
cd news_node
npm install
```

Create a `.env` file in the root:

```
MONGODB_URI=your_mongodb_connection_string
```

Then start the server:

```bash
node app.js
```

---

## Deployment

The project includes a `vercel.json` that routes all requests to `app.js`, so deploying to Vercel is straightforward:

```bash
vercel
```

Set `MONGODB_URI` as an environment variable in your Vercel project settings — do not rely on the committed `.env` file in production.

---

## Dependencies

| Package | Purpose |
|---|---|
| `express` | HTTP server and routing |
| `mongoose` | MongoDB ODM |
| `mongodb` | MongoDB native driver (v6) |
| `axios` | HTTP requests |
| `moment` | Date formatting |
| `dotenv` | Environment variable loading |
| `body-parser` | Request body parsing |
| `mongodb-memory-server` | In-memory MongoDB for testing |

---

## License

Not specified.
