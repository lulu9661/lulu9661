# Quarterly Goals App

A minimalist, intention-focused app for setting and tracking quarterly goals across 7 life domains with habit tracking and weekly reflections.

## Features

### 🎯 Seven Life Domains
- **Meaning** - Purpose and values
- **Career** - Professional development
- **Educational/Personal Growth** - Learning and self-improvement
- **Health** - Physical and mental wellness
- **Social** - Relationships and community
- **Romantic** - Intimate relationships
- **Financial** - Financial goals and stability

### 📝 Goal Management
- **Brainstorming** - Add unlimited potential goals to any category anytime
- **Tournament Selection** - Use head-to-head challenges to select one goal per category per quarter
- **Quarterly Planning** - Selection period opens 3 weeks before each quarter
- **Goal Locking** - Goals are locked once the quarter starts (no changes allowed)

### 🏃 Habit Tracking
- **Monthly Habits** - Set SMART habits each month to work toward quarterly goals
- **Flexible Frequency** - Habits can be daily, weekly, or custom frequencies (e.g., "3x per week")
- **Habit Locking** - Habits lock when the month starts
- **Streak Tracking** - Track consecutive weeks and total weeks of completion

### ✅ Weekly Check-Ins
- **Progress Tracking** - Mark habits as Completed/Partial/Not Completed
- **Reflection Questions** - Customizable weekly reflection prompts (inspired by 5-minute journal)
- **Quotes** - Motivational quotes from Stoic philosophers, James Clear, and other habit experts
- **SMS Reminders** - Optional text message reminders (Twilio integration)

### 🎨 Design
- **Japanese/Scandi Aesthetic** - Minimalist, clean design with lots of white space
- **Mobile-First** - Fully responsive design optimized for phone use
- **Offline Capable** - Data stored in browser local storage

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd quarterly-goals-app
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

### 1. Brainstorm Goals
- Go to the **Brainstorm** page
- Add potential goals to any of the 7 categories
- You can add unlimited goals at any time

### 2. Select Goals for the Quarter
- 3 weeks before each quarter, the **Select Goals** page becomes active
- Use tournament-style selection to choose one goal per category
- Maximum of 7 goals per quarter

### 3. Set Monthly Habits
- Set specific monthly habits for each quarterly goal
- Define the frequency (daily, 3x/week, etc.)
- Habits lock when the month starts

### 4. Weekly Check-Ins
- Report on habit completion (Completed/Partial/Not Completed)
- Answer reflection questions
- View streak stats

### 5. Customize Settings
- Customize reflection questions
- Set reminder day and time
- Configure Twilio for SMS (optional)

## Tech Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- React Context
- Local Storage

## License

MIT
