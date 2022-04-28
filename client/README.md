# Crypto Watcher client

This project was bootstrapped with [Vite](https://vitejs.dev/guide/#scaffolding-your-first-vite-project).

## Available Scripts

In the project directory, you can run:

### `npm run start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run test`

Launches the test runner in the interactive watch mode.\
You can optionally use `npm run test:ui` to view the test dashboard in your browser.\
See the [Vitest](https://vitest.dev/guide/) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

## How I set it up
Use vite to create the dev folder and app template
```
npm create vite@latest
```
Enter the app name.
Select "react" from the list.
Select "react-ts" as the variant.

Navigate into the dev folder
```
npm run install
```

Install TailwindCSS
```
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```
Add the paths to all of your template files in your tailwind.config.js file by updating the "content" property
```
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```
Add the @tailwind directives for each of Tailwind’s layers to the top of your ./src/index.css file.
```
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Add Vitest testing (Vitest requires Vite >=v2.7.10 and Node >=v14)
```
npm install -D vitest
npm install -D @vitest/ui
```
