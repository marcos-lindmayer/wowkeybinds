# WoW Keybinds - React TypeScript App

A React TypeScript application for displaying World of Warcraft spell icons and keybinds across different expansions.

## Features

- Browse spells by expansion (Classic, TBC Classic, MoP Classic, Retail)
- View spell icons and names organized by class
- Responsive grid layout
- TypeScript for type safety

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

- `src/types.ts` - TypeScript interfaces for spell data
- `src/App.tsx` - Main application component with expansion selector
- `src/ClassSection.tsx` - Component for displaying spells by class
- `src/SpellCard.tsx` - Individual spell card component
- `src/spells.json` - Spell data with icons
- `public/zamimg-icons/` - Spell icon images

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner