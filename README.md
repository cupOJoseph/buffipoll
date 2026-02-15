# BuffiPoll 📊

A simple, live polling app built for presentations and audience engagement.

## Features

- **Live Voting**: Big, clickable buttons for easy audience participation
- **Real-time Results**: Live updates every 2 seconds with animated percentage bars
- **One Vote Per Browser**: Uses localStorage to prevent multiple votes
- **Admin Panel**: Easy-to-use interface for managing polls
- **Mobile Friendly**: Works great on all screen sizes
- **Presentation Ready**: Large text and clean UI designed for audience viewing

## Tech Stack

- **Next.js 16** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **API Routes** for backend functionality
- **In-memory storage** for demo purposes

## Usage

### Main Poll Page (/)
- View the current poll question
- Vote by clicking on your preferred option
- See live results with percentage bars and vote counts
- Results update automatically every 2 seconds

### Admin Panel (/admin)
- Update poll questions and options
- Add/remove answer choices (2-6 options supported)
- Reset all votes without changing the poll
- View real-time voting statistics
- No authentication required (designed for presentations)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the poll.
Visit [http://localhost:3000/admin](http://localhost:3000/admin) for poll management.

## Deployment Notes

This app uses in-memory storage for simplicity. In a serverless environment like Vercel, the poll data will reset when the server restarts. For production use, consider integrating with a database or persistent storage solution.

## Demo

Perfect for:
- Conference presentations
- Classroom polling
- Team meetings
- Workshop engagement
- Live audience feedback

---

Built with ❤️ for seamless audience interaction!