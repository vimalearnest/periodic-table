# Periodic Table

Interactive periodic table of elements built with React and Vite.

## Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Architecture

- **Framework**: React 19 with Vite 7
- **Styling**: Tailwind CSS 3
- **Entry**: `src/main.jsx` renders `App` into root

## Project Structure

```
src/
├── App.jsx              # Main app with table layout, filtering, element details
├── components/
│   └── PeriodicElement.jsx  # Single element tile with hover tooltip
├── data/
│   └── elements.js      # All 118 elements + category definitions + color mappings
```

## Key Patterns

- Elements have `period`, `group`, and optional `series` (lanthanide/actinide) properties
- Category filtering via `filter` state in App
- Element selection shown in detail panel below table
- Category colors defined in both `PeriodicElement.jsx` and `elements.js`
