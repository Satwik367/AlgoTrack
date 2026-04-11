# AlgoTrack

A full-stack DSA (Data Structures & Algorithms) problem tracking platform to monitor your problem-solving progress, analyze performance, and prepare smarter for coding interviews.

🌐 **Live Demo**: https://algo-track-sage.vercel.app

---

## Features

- **Dashboard** — overview of total problems, solve rate, weak and strong topics at a glance
- **Problem Tracker** — add, filter, search and manage DSA problems with difficulty, topic, platform, notes and time taken
- **Analytics** — topic-wise breakdown, difficulty charts, activity heatmap and performance insights
- **Codeforces Integration** — connect your Codeforces handle to view rating history, contest performance and recent problem tags

---

## Tech Stack

**Frontend**

- React 19
- React Router DOM
- Recharts
- CSS Variables (custom dark theme)

**Backend**

- Node.js
- Express.js
- MongoDB + Mongoose

**Deployment**

- Frontend → Vercel
- Backend → Render
- Database → MongoDB Atlas

---

## Project Structure

AlgoTrack/
├── backend/
│ ├── models/
│ │ ├── Problem.js
│ │ └── UserSettings.js
│ ├── routes/
│ │ ├── problems.js
│ │ ├── codeforces.js
│ │ └── settings.js
│ └── server.js
│
└── algotrack/
└── src/
├── pages/
│ ├── Dashboard.js
│ ├── Problems.js
│ ├── Analytics.js
│ └── Codeforces.js
├── utils/
│ ├── api.js
│ ├── cache.js
│ └── keepAlive.js
└── App.js

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account

### Run Locally

**Clone the repository**

```bash
git clone https://github.com/Satwik367/AlgoTrack.git
cd AlgoTrack
```

**Setup Backend**

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:
MONGO_URI=your_mongodb_connection_string

Start the backend:

```bash
node server.js
```

**Setup Frontend**

```bash
cd algotrack
npm install
npm start
```

---

## Environment Variables

**Backend** (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |

**Frontend** (`algotrack/.env.production`)
| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | Backend API URL |

---

## API Endpoints

| Method | Endpoint                           | Description              |
| ------ | ---------------------------------- | ------------------------ |
| GET    | `/api/problems`                    | Get all problems         |
| POST   | `/api/problems`                    | Add a problem            |
| PATCH  | `/api/problems/:id`                | Update a problem         |
| DELETE | `/api/problems/:id`                | Delete a problem         |
| GET    | `/api/problems/analytics/summary`  | Get analytics data       |
| GET    | `/api/codeforces/user/:handle`     | Get Codeforces user info |
| GET    | `/api/codeforces/contests/:handle` | Get contest history      |
| GET    | `/api/settings`                    | Get user settings        |
| PATCH  | `/api/settings`                    | Update user settings     |

---

## Screenshots

> Dashboard, Problems, Analytics and Codeforces pages

_(Add screenshots here)_

---

## Future Improvements

- User authentication (JWT)
- LeetCode API integration
- Daily goal tracker with streaks
- Problem recommendation engine
- Export progress as PDF/CSV
- Light/dark mode toggle

---

## Author

**Satwik** — [GitHub](https://github.com/Satwik367)

---

## License

MIT License
