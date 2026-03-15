# AI Climate Policy Copilot (EcoSim)

## Overview
**EcoSim** is an interactive web platform and AI-powered simulation tool that allows users to explore climate policy decisions and instantly understand their environmental impact. Built for a sustainability and AI hackathon, the platform acts as a decision-support tool. It visualizes environmental outcomes like global temperature change, emissions levels, and sea level rise dynamically, based on user-adjusted policy variables.

The system combines actual climate data, robust simulation logic, AI reasoning, and immersive 3D visualization to help policymakers, researchers, and citizens understand the consequences of different sustainability strategies.

---

## Key Features

- **Interactive Policy Controls**: Adjust key variables such as carbon tax levels, renewable energy adoption, deforestation reduction, and methane mitigation.
- **Real-time Climate Metrics**: The system calculates and displays global temperature rise, CO2 concentration, emissions trajectory, and sea level rise as policies change.
- **3D Earth Visualization**: An immersive Three.js-powered globe displaying warming heatmaps, emission particles, and deforestation changes.
- **AI Climate Advisor**: An intelligent assistant that analyzes your simulation results and explains in plain language the environmental consequences of your chosen policy combinations.
- **Sustainability Goal Mode**: Set specific targets (e.g., "Limit warming to 1.5°C") and let the AI suggest optimal policy strategies to achieve them.

---

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- React Three Fiber (Three.js) for 3D rendering
- TailwindCSS
- TanStack Query

### Backend
- Python 3.11+
- FastAPI
- Pydantic

### Services & Data
- **AI Layer**: LLM API (DeepSeek)
- **Package Manager**: pnpm

---

## Project Architecture

```text
Frontend (React)
       ↓ API requests
Backend (FastAPI)
       ↓
Climate Simulation Engine
       ↓
AI Explanation Layer
```

---

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- pnpm
- Python (3.11+)

### 1. Environment Variables

Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:8001/api
```

Create a `.env` file in the `server` directory and add your necessary API keys:
```env
DEEPSEEK_API_KEY=your_api_key_here
```

### 2. Running the Frontend

Navigate to the `client` directory, install dependencies, and start the Vite development server.

```bash
cd client
pnpm install
pnpm dev
```

### 3. Running the Backend

Navigate to the `server` directory, create a virtual environment (optional but recommended), install the required dependencies, and run the FastAPI server.

```bash
cd server
pip install -r requirements.txt  # Or your chosen Python dependency manager
uvicorn app.main:app --port 8001 --reload
```

### 4. Testing
To run the frontend tests:
```bash
cd client
pnpm test
```

---

## Development Guidelines

- **Frontend**: Use TypeScript and functional React components. Prefer hooks over class members. Use TanStack Query for remote state management. All 3D logic lives in `src/scenes` and should not mix with general UI state. 
- **Backend**: Keep API routing thin and push logic into `services` and `climate` folders. Wait for the simulation logic inside the backend; the frontend should not do heavy climate math.
- **Commit Strategy**: Use specific feature branches like `feature/earth-visualization` or `feature/policy-simulation`. Ensure the `main` branch is always deployable.
