/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        der: "#2563eb", // blue
        die: "#db2777", // pink
        das: "#16a34a", // green
        accent: "#f97316", // coral/orange
        good: "#16a34a",
        bad: "#dc2626",
      },
      maxWidth: { app: "430px" },
    },
  },
  plugins: [],
};
