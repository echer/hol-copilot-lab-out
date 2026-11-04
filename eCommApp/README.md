# The Daily Harvest

A TypeScript shopping website built with React and Vite. This application is the sample project for the GitHub Copilot hands-on labs.

## Prerequisites

- Node.js 18 or later
- npm

## Setup and run

Run these commands from the repository root:

```bash
cd eCommApp
npm ci
npm run dev
```

Vite starts the development server on `http://localhost:3000` and is configured to open the browser automatically. If that port is unavailable, check the URL printed by Vite in the terminal.

## Common commands

Run these from `eCommApp/`:

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Type-check with TypeScript, then create the production build in `dist/` |
| `npm run preview` | Serve the production build locally; run `npm run build` first |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest in watch mode |
| `npm run test:run` | Run all tests once |
| `npm run test:ui` | Open the Vitest UI |
| `npm run test:coverage` | Run tests and print coverage; HTML report is written under `coverage/` |

Tests use Vitest, React Testing Library, and jsdom. Test files use the `*.test.*` naming pattern and are kept beside the code they cover. The suite includes utility and cart-state unit tests, component tests for the shopping, login, and admin flows, and application route tests. There is no end-to-end test suite. Shared test setup is in `src/test/setup.ts`, and `src/test/test-utils.tsx` provides a render helper with the router and cart provider.

## Project structure

```text
eCommApp/
├── public/
│   └── products/         # Product JSON data and product images
├── src/
│   ├── components/       # Pages and UI components; CartPage.test.tsx is an example test
│   ├── context/           # Shared React state, including the shopping cart
│   ├── test/              # Test setup and shared render helpers
│   ├── types/             # TypeScript interfaces and types
│   ├── utils/             # Reusable helper functions
│   ├── App.tsx            # Application routes and top-level providers
│   ├── App.css            # Application-specific styles
│   ├── index.css          # Global styles
│   └── main.tsx           # Browser entry point; mounts App inside the router
├── index.html             # HTML page loaded by Vite
├── package.json           # Dependencies and npm scripts
├── package-lock.json      # Locked npm dependency versions
├── tsconfig.json          # TypeScript settings for application code
├── tsconfig.node.json     # TypeScript settings for Vite configuration
├── vite.config.ts         # Vite server/build and Vitest configuration
└── README.md
```

The browser loads `index.html`, which starts `src/main.tsx`; that mounts `App.tsx`, where the application routes are defined. Product data is loaded from JSON files under `public/products/`.

## Troubleshooting

- If product data or images do not load, run the app with Vite and verify the corresponding files exist under `public/products/` or `public/products/productImages/`.
- If Vite selects a different port, use the local URL printed in the terminal.
- If installation or tests fail with a Node version error, verify that Node.js 18 or later is active.
