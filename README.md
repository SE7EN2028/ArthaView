# ArthaView

ArthaView is a modern, AI-powered financial dashboard designed for small and medium businesses (SMEs). It provides a central place to track revenue, categorize expenses, monitor cash flow, and receive automated financial insights powered by LLaMA 3.

## Features

- 📊 **Dashboard & Analytics**: Real-time overview of your finances with visual charts and key performance indicators.
- 💸 **Transaction Tracking**: Add, edit, filter, sort, and export transactions (CSV). Includes client-side pagination and real-time computation.
- 📈 **Cash Flow Forecasting**: Track runway, net position, and month-over-month (MoM) growth with automated burn-rate warnings.
- 🤖 **AI Insights**: A chat interface powered by Groq (LLaMA 3) that acts as your personalized financial advisor based on your transaction history.
- 📤 **Data Import**: Drag-and-drop CSV exports or Bank Statement PDFs directly into the app for automatic parsing.
- 🔒 **Privacy First**: All file processing happens in memory, and the application stores only processed numerical data in your browser's local storage—no external databases required.

## Tech Stack

- **Frontend**: React 19, Vite, React Router, Recharts, Lucide Icons
- **Backend**: Node.js, Express
- **AI Integration**: Groq API (LLaMA 3)
- **Styling**: Vanilla CSS with modern standard variables, glassmorphism, and responsive design

## Getting Started

1. **Install Dependencies**:
   Navigate to the project root and install for both frontend and backend.
   \`\`\`bash
   cd frontend && npm install
   cd ../backend && npm install
   \`\`\`

2. **Environment Variables**:
   In the `backend` folder, create a `.env` file and add your Groq API key:
   \`\`\`
   GROQ_API_KEY=your_api_key_here
   PORT=5001
   \`\`\`

3. **Run the Application**:
   Start both the frontend and backend servers.
   \`\`\`bash
   # In terminal 1
   cd backend && npm start

   # In terminal 2
   cd frontend && npm run dev
   \`\`\`

4. **Open in Browser**:
   Visit `http://localhost:5173` to see the app.

## Project Structure

- `frontend/`: The React web application
- `backend/`: The Express API handling file uploads, persistent storage, and AI inference

## License

Copyright © 2026 ArthaView. All rights reserved.
