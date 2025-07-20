# Ecom Insights AI 🛍️🤖

**Ecom Insights AI** is an intelligent, AI-powered analytics tool that allows e-commerce businesses to ask questions in natural language and get instant, actionable insights from their sales and advertising data.

## ✨ Features

- 💬 Ask business questions in plain English (e.g., *"What were the total sales last week?"*)
- 📊 Automatic visualizations using **Recharts**
- ⚙️ Built with **Next.js**, **Google's Genkit**, and **React Server Actions**
- 📁 Uses SQLite (`ecom.db`) as the backend database
- 🧠 Converts natural language → SQL → data → insights
- 🔌 Includes a clean REST API endpoint (`/api/ask`) for integration and testing

## 📂 Tech Stack

- **Frontend**: Next.js, React, Tailwind, shadcn/ui, Recharts  
- **Backend**: Genkit, Server Actions, SQLite  
- **AI**: Language model-powered agent for SQL generation and data analysis

## 🚀 Getting Started

1. Clone the repo  
2. Install dependencies: `npm install`  
3. Run locally: `npm run dev`  
4. Access at: `http://localhost:3000`

## 🧪 Example API Usage

```bash
POST /api/ask
{
  "question": "Calculate the RoAS"
}
