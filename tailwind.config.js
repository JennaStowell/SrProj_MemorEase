/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './app/**/*.{js,ts,jsx,tsx}', // Specify your app directory files
    ],
    theme: {
      extend: {colors: {
        maroon: '#800000', // Define the maroon color
      },},
    },
    plugins: [],
  };
  