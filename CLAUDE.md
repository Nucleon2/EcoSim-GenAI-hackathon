# Claude.md

## Project Overview

Project Name: EcoSim

EcoSim is an interactive web platform that allows users to simulate the impact of climate policies on the planet. Users can adjust variables such as renewable adoption, carbon tax, and deforestation reduction while the system visualizes environmental outcomes like temperature rise, emissions levels, and sea level change.

The application combines climate datasets, simulation logic, AI explanations, and 3D visualization to create an interactive sustainability decision-support tool.

The primary goal is to help users explore climate strategies and understand how policy decisions influence environmental outcomes.

This project is being built for a hackathon focused on sustainability and AI solutions.

---

# Goals

Primary Goals

• Provide an interactive climate simulation interface  
• Allow users to modify climate policy variables  
• Visualize global impacts using a 3D Earth  
• Generate AI explanations of policy outcomes  

Secondary Goals

• Demonstrate AI-assisted sustainability decision making  
• Provide a visually impressive interface suitable for demos  

---

# Tech Stack

Frontend

React 18  
TypeScript  
Vite  
React Three Fiber (Three.js)  
TailwindCSS  
TanStack Query  
react-globe.gl

Backend

Python 3.11+  
FastAPI  
Pydantic  

AI Layer

LLM API (DeepSeek)

Package Manager

pnpm

---

# Project Architecture

High-level architecture

Frontend (React)
→ API requests
→ Backend (FastAPI)
→ Climate Simulation Engine
→ AI Explanation Layer

---

# Folder Structure

Repo structure


project-root
│
├── frontend
│ ├── src
│ │ ├── components
│ │ ├── scenes
│ │ ├── features
│ │ ├── hooks
│ │ ├── services
│ │ ├── utils
│ │ └── pages
│ │
│ └── index.html
│
├── backend
│ ├── app
│ │ ├── api
│ │ ├── models
│ │ ├── services
│ │ ├── climate
│ │ └── main.py
│
├── docs
│ ├── PRD.md
│ └── AGENTS.md
│
└── README.md


---

# Frontend Folder Conventions

components  
Reusable UI components.

scenes  
3D scenes and visualization logic.

features  
Feature-specific logic such as policy controls or AI explanation panels.

hooks  
Custom React hooks.

services  
API communication layer.

utils  
Helper utilities.

pages  
Top-level routes.

---

# Backend Folder Conventions

api  
API routes and endpoints.

models  
Pydantic request and response schemas.

services  
Business logic and orchestration.

climate  
Climate simulation models and calculations.

main.py  
FastAPI entry point.

---

# Coding Style Rules

General

• Use TypeScript for all frontend code  
• Prefer functional components  
• Keep components small and composable  
• Avoid deeply nested logic  

Naming

Components: PascalCase  
Files: kebab-case  
Functions: camelCase  
Constants: UPPER_SNAKE_CASE  

Examples


ClimateMetrics.tsx
policy-controls.tsx
calculateTemperatureImpact()


React Patterns

• Prefer hooks over class components  
• Keep state close to where it is used  
• Use TanStack Query for server data  

Backend Patterns

• Keep API routes thin  
• Place logic inside services  
• Keep climate calculations inside climate module  

---

# Three.js / Visualization Guidelines

Use React Three Fiber for 3D rendering.

All 3D logic should live in


src/scenes


Earth scene structure


EarthScene
├ Earth
├ Atmosphere
├ HeatmapLayer
└ EmissionParticles


Avoid mixing UI state logic with rendering logic.

---

# What NOT To Do

Do NOT fetch data directly inside components.

Always use TanStack Query.

Do NOT store simulation state in localStorage.

State should be kept in React state or global state if necessary.

Do NOT place climate simulation logic inside the frontend.

All simulation logic belongs in the backend.

Do NOT create large monolithic components.

Keep components under ~200 lines when possible.

Do NOT hardcode API URLs.

Use environment variables.

Do NOT use rounded corners on panels or section containers.

All glass-panel sections and layout containers use square corners (border-radius: 0). This is an intentional design choice.

Do NOT import shadcn/Base UI primitives directly from @base-ui/react in feature components.

Always use the local shadcn wrappers from @/components/ui (e.g. @/components/ui/slider, @/components/ui/button). Add new components via `pnpm dlx shadcn@latest add <component>` which downloads them into src/components/ui.

---

# Commands

Install dependencies


pnpm install


Run frontend


pnpm dev


Build frontend


pnpm build


Run backend


cd backend
uvicorn app.main:app --reload


Run tests


pnpm test


---

# Environment Variables

Frontend


VITE_API_URL


Backend


OPENAI_API_KEY
DATA_API_KEY


---

# Branching Strategy

Use feature branches.

Example


feature/earth-visualization
feature/policy-simulation
feature/ai-explanation


Main branch should always remain deployable.

---

# Definition of Done

A feature is complete when

• It compiles without errors  
• It has clear UI integration  
• It follows folder conventions  
• It has no console errors  
• It respects coding style rules  

Dont use em dashes when writing any text