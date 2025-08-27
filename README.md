<a name="readme-top"></a>

[![Forks][forks-shield]][forks-url] [![Stargazers][stars-shield]][stars-url] [![Issues][issues-shield]][issues-url] [![MIT License][license-shield]][license-url] [![LinkedIn][linkedin-shield]][linkedin-url]



[forks-shield]: https://img.shields.io/github/forks/taovuzu/RelayPoint.svg?style=for-the-badge
[forks-url]: https://github.com/taovuzu/RelayPoint/network/members
[stars-shield]: https://img.shields.io/github/stars/taovuzu/RelayPoint.svg?style=for-the-badge
[stars-url]: https://github.com/taovuzu/RelayPoint/stargazers
[issues-shield]: https://img.shields.io/github/issues/taovuzu/RelayPoint.svg?style=for-the-badge
[issues-url]: https://github.com/taovuzu/RelayPoint/issues
[license-shield]: https://img.shields.io/github/license/taovuzu/RelayPoint.svg?style=for-the-badge
[license-url]: https://github.com/taovuzu/RelayPoint/blob/main/LICENSE
[linkedin-shield]: https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white
[linkedin-url]: https://www.linkedin.com/in/krishna-chahar/


<div align="center">
  <table>
    <tr>
      <td align="left">
        <h1>RelayPoint</h1>
        <p>A lightweight workflow automation platform for connecting services and running relays</p>
      </td>
    </tr>
  </table>
</div>

<details>
  <summary><strong>Table of Contents</strong></summary>

  <ol>
    <li><a href="#about">About</a></li>
    <li><a href="#built-with">Built With</a></li>
    <li><a href="#key-features">Key Features</a></li>
    <li>
      <a href="#getting-started---prerequisites">Getting Started - Prerequisites</a>
    </li>
    <li>
      <a href="#getting-started---installation-docker-recommended">Getting Started - Installation (Docker Recommended)</a>
    </li>
    <li>
      <a href="#getting-started---installation-manual">Getting Started - Installation (Manual)</a>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li>
      <a href="#technical-details">Technical Details</a>
      <ul>
        <li><a href="#architecture-overview">Architecture Overview</a></li>
        <li><a href="#technology-stack">Technology Stack</a></li>
        <li><a href="#database-schema">Database Schema</a></li>
        <li><a href="#api-endpoints">API Endpoints</a></li>
        <li><a href="#processing-flow">Processing Flow</a></li>
        <li><a href="#security-features">Security Features</a></li>
        <li><a href="#performance-optimizations">Performance Optimizations</a></li>
      </ul>
    </li>
    <li><a href="#future-plans">Future Plans</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

---

## About

RelayPoint is a modern, full-stack web application and worker platform for building, scheduling, and executing "relays" — configurable automation pipelines that connect third-party services (Gmail, Google Sheets, Webhooks, Solana, etc.) and perform actions when triggers occur. It provides a web-based Relay Builder UI for non-developers and a robust server + worker runtime for reliable execution, retries, and observability.

RelayPoint helps teams automate repetitive integration tasks without writing custom scripts. It combines an expressive connector model, a lightweight runtime, and an outbox/queue-based delivery system so that relays run reliably even under intermittent failures.

Back to top

---

## Built With

- [![React][React.js]][React-url] [![Vite][Vite]][Vite-url][![Node.js][Node.js]][Node-url] [![Express][Express.js]][Express-url] [![Kafka][Apache-Kafka]][Apache-Kafka-url] [![Docker][Docker]][Docker-url][![MongoDB][MongoDB]][MongoDB-url]

Back to top

---

## Key Features

- Visual Relay Builder UI to compose triggers and actions
- Connectors for Gmail, Google Sheets, Webhooks, Solana and generic HTTP endpoints
- Worker-based execution with queueing and retries
- Outbox pattern for reliable delivery
- Scheduler for periodic relays
- Authentication and user management
- Telemetry and basic health endpoints for observability
- Extensible architecture for adding new connectors and action types

Back to top

---

## Getting Started - Prerequisites

Before you begin, ensure you have the following installed and configured:

- Git (for cloning the repo)
- Docker & Docker Compose (recommended)
- Node.js (v18 or higher) — required for local/manual runs
- npm or yarn (for client and server dependency installs)
- Kafka or a message broker compatible with the project configuration

Back to top

---

## Getting Started - Installation (Docker Recommended)

These steps will get a development environment running quickly using Docker Compose.

1. Clone the repository:

   ```bash
   git clone https://github.com/taovuzu/RelayPoint.git
   cd RelayPoint
   ```

2. Copy environment examples and configure values:

   ```bash
   cp server/env.example server/.env
   cp client/env.example client/.env
   # Edit server/.env and client/.env to set DB, broker and secrets
   ```

3. Start services with Docker Compose:

   ```bash
   docker compose up --build
   ```

4. The frontend is usually available at http://localhost:5173 and the API at http://localhost:3000 (confirm via `.env` values).

Back to top

---

## Getting Started - Installation (Manual)

If you prefer running components manually (useful for development):

Server

1. Install dependencies and configure:

   ```bash
   cd server
   cp env.example .env
   # edit .env to configure DB_URL, KAFKA_BROKERS, JWT_SECRET etc.
   npm install
   npm run migrate    # if migration script exists
   npm start
   ```

Worker

1. From the server directory:

   ```bash
   # worker may be started separately and uses the same environment
   npm run worker
   ```

Client

1. Install the frontend and run:

   ```bash
   cd client
   cp env.example .env
   npm install
   npm run dev
   ```

Notes:
- Confirm ports and URLs in `.env` files (client expects API URL pointing to server).
- Use `npm run build` in client for production builds.

Back to top

---

## Usage

General workflow:

- Admin or user connects a service (e.g., Gmail, Google Sheets) via `Connections`.
- User creates a new Relay using the Relay Builder — define a trigger (incoming email, sheet row, schedule) and add actions (send webhook, insert row, send SOL).
- Save and enable the relay. The system enqueues work when triggers fire.
- Worker processes the relay run, uses connectors to execute actions, and records status/logs.

<details>
<summary>Example Workflows</summary>

- Email-to-Sheet:
  1. Create a Gmail connection and grant minimal scopes.
  2. Create a Google Sheets connection and point to a target spreadsheet.
  3. Build a Relay: Trigger = Gmail (new email matching filter) → Action = GoogleSheetsAddRow.
  4. Enable the relay. Incoming emails will create rows.

- Webhook-based automation:
  1. Create a Relay with a Webhook trigger endpoint.
  2. Add actions: parse payload, call external API via WebhookPost, update internal DB.
  3. Use the Relay's generated endpoint to receive event payloads.

- Solana payout:
  1. Add a Solana connection with private key stored securely in the server.
  2. Create a Relay with a schedule trigger or webhook trigger to initiate transfers via SolanaSendSol action.
  3. Worker performs on-chain operation; the server logs tx hashes in RelayRun records.

</details>

Back to top

---

## Technical Details

<details>
<summary><strong>Architecture Overview</strong></summary>

RelayPoint is a client-server-worker architecture:

- Frontend (React/Vite): UI for relays, connections, user management.
- Backend API (Node.js + Express): REST API for management, authentication, and admin endpoints.
- Worker(s): Background processes that read from a queue/outbox and execute actions (send webhooks, call third-party APIs, interact with Solana).
- Message Broker / Queue: Kafka (or configured broker) for distributing work and decoupling API from execution.
- Database: Relational database used for persistent models (users, relays, runs, outbox).

Key design decisions:
- Outbox pattern to guarantee delivery of external actions and to support retry semantics.
- Separation of web API and worker processes to enable horizontal scaling of workers.
- Pluggable connector architecture so new services can be added as modules.

</details>

<details>
<summary><strong>Technology Stack</strong></summary>

- Frontend
  - React (v18+) — Vite-based SPA
  - Tailwind CSS for styling
- Backend / Worker
  - Node.js (v18+)
  - Express.js
  - Kafka (message broker) or a configured message queue
  - A NoSQL database (Mongo recommended)
- Infrastructure
  - Docker & Docker Compose for local development

</details>

<details>
<summary><strong>Database Schema</strong></summary>

Primary models (simplified):

- User
  - id (uuid)
  - email (string)
  - passwordHash (string)
  - role (string) — e.g., admin/user
  - createdAt, updatedAt

- Connection
  - id
  - userId
  - type (gmail, sheets, solana, webhook)
  - config (JSON) — credentials and connection metadata
  - enabled (boolean)

- Relay
  - id
  - userId
  - name
  - trigger (JSON) — trigger type and config
  - actions (JSON array) — sequence of action definitions
  - schedule (optional)
  - enabled (boolean)

- RelayRun
  - id
  - relayId
  - status (queued, running, success, failed)
  - startedAt, finishedAt
  - result (JSON) — logs, error messages, action outputs

- RelayRunOutbox / Outbox
  - id
  - payload (JSON)
  - attempts (int)
  - nextAttemptAt (timestamp)
  - status

</details>

<details>
<summary><strong>API Endpoints</strong></summary>

Authentication
- POST /api/v1/auth/register — Register a new user
- POST /api/v1/auth/login — Get JWT
- POST /api/v1/auth/refresh — Refresh tokens

Connections
- GET /api/v1/connections — List connections
- POST /api/v1/connections — Create a connection
- GET /api/v1/connections/:id — Retrieve connection
- DELETE /api/v1/connections/:id — Remove connection

Relays
- GET /api/v1/relays — List relays
- POST /api/v1/relays — Create a relay
- GET /api/v1/relays/:id — Get relay
- POST /api/v1/relays/:id/enable — Enable relay
- POST /api/v1/relays/:id/disable — Disable relay

Runs & Monitoring
- GET /api/v1/relays/:id/runs — List runs for a relay
- GET /api/v1/runs/:id — Get a run and logs
- POST /api/v1/health — Health check

Worker / Internal
- POST /api/v1/internal/outbox/process — (internal) process an outbox entry (used by workers)
- Webhook endpoints for triggers are generated per relay and are implemented as public routes with signing/validation options

</details>

<details>
<summary><strong>Processing Flow</strong></summary>

1. Trigger: an event occurs (incoming email, scheduled timer, webhook hit).
2. API receives/records the trigger and creates a RelayRun or an Outbox entry.
3. The outbox entry is published to the broker (Kafka) or left for worker polling.
4. Worker consumes the message, loads Relay and Connection configs, and executes configured actions in order.
5. Worker stores action results and final status in `RelayRun` and `Outbox` records, performing retries if needed.
6. Notifications or follow-up actions are performed (webhooks, DB updates, on-chain transfers).

</details>

<details>
<summary><strong>Security Features</strong></summary>

- JWT-based authentication for API.
- Role-based access control for admin operations.
- Secure storage of third-party credentials (encrypted at rest via server-side encryption service).
- Input validation and schema validation for incoming triggers and connector configs.
- Rate limiting on public endpoints and webhook receiver endpoints.
- CSRF protection for browser-based flows where applicable.
- Helmet and standard Express hardening for headers.

</details>

<details>
<summary><strong>Performance Optimizations</strong></summary>

- Decoupled workers allow horizontal scaling to increase throughput.
- Outbox + broker (Kafka) prevents blocking API calls during long-running actions.
- Batch processing capability for some connectors (e.g., sheets) to reduce API calls.
- Minimal payloads in the queue to reduce I/O and broker load.
- Planned: metrics-backed auto-scaling of workers and caching connector metadata.

</details>

Back to top

---

## Future Plans

- Performance Enhancements
  - Autoscaling workers based on queue depth.
  - Add caching layers for frequent connector metadata.
- Business Features
  - More connectors (Slack, Stripe, Notion).
  - Visual debugging and step-by-step run replay.
  - Multi-tenant support and per-tenant quotas.
- Infrastructure & Security
  - Hardening for secrets management (integrate with Vault).
  - Immutable deployment images and CI/CD improvements.
- Developer Experience
  - SDK for creating custom connectors.
  - Official helm charts for Kubernetes deployment.

Back to top

---

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contact

taovuzu - [@taovuzu](https://github.com/taovuzu) - chaharkrishna937@gmail.com

Project Link: [https://github.com/taovuzu/file-master](https://github.com/taovuzu/file-master)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<details>
<summary>Acknowledgments</summary>

We extend our gratitude to the open-source projects and their maintainers that make this application possible:


Back to top

---

## Acknowledgments

<details>
<summary>Third-party libraries and resources</summary>

- Core Technologies
  - React (https://reactjs.org/)
  - Vite (https://vitejs.dev/)
  - Node.js (https://nodejs.org/)
  - Express (https://expressjs.com/)
  - Apache Kafka (https://kafka.apache.org/)

- UI & Styling
  - Tailwind CSS (https://tailwindcss.com/)

- Developer Tools
  - Docker (https://www.docker.com/)
  - GitHub Actions for CI (https://github.com/features/actions)

</details>

Back to top

---

## Badges & Tech Reference Links

[React.js]: https://img.shields.io/badge/React-17.0.2-61DAFB?logo=react&logoColor=white
[React-url]: https://reactjs.org/
[Vite]: https://img.shields.io/badge/Vite-4.0.0-blue?logo=vite
[Vite-url]: https://vitejs.dev/
[Node.js]: https://img.shields.io/badge/Node.js-18.0.0-339933?logo=node.js&logoColor=white
[Node-url]: https://nodejs.org/
[Express.js]: https://img.shields.io/badge/Express-4.x-000000?logo=express
[Express-url]: https://expressjs.com/
[Apache-Kafka]: https://img.shields.io/badge/Kafka-Apache-F0512D?logo=apachekafka
[Apache-Kafka-url]: https://kafka.apache.org/
[Docker]: https://img.shields.io/badge/Docker-20.10-blue?logo=docker
[Docker-url]: https://www.docker.com/
[MongoDB]: https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white
[MongoDB-url]: https://www.mongodb.com/

Back to top

---