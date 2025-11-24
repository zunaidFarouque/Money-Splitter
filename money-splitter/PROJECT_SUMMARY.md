# Money Splitter Project Summary

## Overview
Money Splitter is a web application designed to help users split expenses among friends or groups. It is built with Svelte 5 and SvelteKit, utilizing modern web technologies for a responsive and interactive experience.

## Tech Stack
- **Framework**: SvelteKit (Svelte 5)
- **Styling**: TailwindCSS v4, Skeleton UI
- **Build Tool**: Vite
- **Deployment**: GitHub Pages (`adapter-static`)
- **State Management**: Svelte 5 Runes (`.svelte.ts` files), `svelte-persisted-state`
- **Icons**: Lucide Svelte
- **Visualization**: Mermaid (likely for graphs/charts)

## Project Structure
### Root Directory (`money-splitter/`)
- `package.json`: Dependencies and scripts.
- `svelte.config.js`: SvelteKit configuration.
- `vite.config.ts`: Vite configuration.
- `tailwind.config.js`: Tailwind configuration (implied/v4 might be different).

### Source Directory (`src/`)
- **`routes/`**: Application routes.
    - `+page.svelte`: Landing page.
    - `App/`: Main application logic/views.
    - `Event/`: Event-specific logic/views.
- **`lib/`**: Shared utilities and state.
    - `state.svelte.ts`: Global state management using Svelte 5 runes.
    - `calculator.svelte.ts`: Core logic for expense splitting.
    - `ledgerCalculator.ts`: Logic for calculating debts/ledger.
    - `PWA_nav_mngr.svelte.ts`: Navigation state management (multiple versions present).
    - `utils.ts`: General utility functions.

## Key Features
- **Expense Calculation**: Logic to split money and calculate who owes whom.
- **Persistence**: Uses `svelte-persisted-state` to save data.
- **PWA Features**: Service worker present (`src/service-worker.js`), indicating offline capabilities or PWA installability.

## Development
- `npm run dev`: Start development server.
- `npm run build`: Build for production.
- `npm run deploy`: Deploy to GitHub Pages.
