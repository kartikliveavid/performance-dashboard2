# Performance Dashboard Vue

This project is a performance dashboard built using Vue 3, the Composition API, and TypeScript. It is designed to efficiently render and update over 10,000 data points at 60 frames per second (fps), providing a smooth and responsive user experience.

## Features

- Real-time data streaming and updates
- High-performance chart rendering using WebGL and Canvas
- Modular components for easy maintenance and scalability
- Responsive design for various screen sizes
- State management using Vue's reactive features

## Project Structure

```
performance-dashboard-vue
├── src
│   ├── main.ts                # Entry point of the Vue application
│   ├── App.vue                # Root component
│   ├── components             # Contains reusable components
│   ├── composables            # Custom composables for data and rendering
│   ├── views                  # Application views
│   ├── router                 # Vue Router setup
│   ├── store                  # State management
│   ├── workers                # Web Workers for data generation
│   ├── charts                 # Chart rendering logic
│   ├── types                  # TypeScript types and interfaces
│   ├── utils                  # Utility functions
│   └── styles                 # Global styles
├── index.html                 # Main HTML file
├── package.json               # NPM configuration
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite configuration
├── vitest.config.ts           # Vitest configuration
├── jest.config.js             # Jest configuration
├── .eslintrc.cjs              # ESLint configuration
├── .prettierrc                # Prettier configuration
└── README.md                  # Project documentation
```

## Installation

To get started with the project, clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd performance-dashboard-vue
npm install
```

## Development

To run the development server, use the following command:

```bash
npm run dev
```

This will start the application and open it in your default web browser.

## Building for Production

To build the application for production, run:

```bash
npm run build
```

This will create an optimized version of the application in the `dist` directory.

## Testing

The project includes tests using Vitest and Jest. To run the tests, use:

```bash
npm run test
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.