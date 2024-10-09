/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.{js,ts}",
  ],
  theme: {
    extend: {
      borderRadius: {
        "custom-shape": "25% 25% 25% 0% / 25% 25% 25% 25%",
      },
      screens: {
        "2xl": "1440px",
      },
    },
  },
  plugins: [],
});
