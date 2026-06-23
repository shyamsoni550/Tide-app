/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ocean: {
          night: "#040D1A",
          deep: "#07172B",
          card: "rgba(255, 255, 255, 0.08)",
          cyan: "#00D4FF",
          teal: "#00E5A0",
          muted: "#7DD3C7",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(0, 212, 255, 0.28)",
        tealGlow: "0 0 34px rgba(0, 229, 160, 0.22)",
      },
      backgroundImage: {
        "ocean-radial":
          "radial-gradient(circle at top left, rgba(0, 212, 255, 0.22), transparent 34%), radial-gradient(circle at bottom right, rgba(0, 229, 160, 0.16), transparent 32%)",
      },
      keyframes: {
        floatUp: {
          "0%": { transform: "translateY(20px) scale(0.9)", opacity: "0" },
          "18%": { opacity: "0.55" },
          "100%": { transform: "translateY(-110vh) scale(1.15)", opacity: "0" },
        },
        waveDrift: {
          "0%": { transform: "translateX(-4%) translateY(0)" },
          "50%": { transform: "translateX(3%) translateY(-10px)" },
          "100%": { transform: "translateX(-4%) translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.45", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.08)" },
        },
      },
      animation: {
        "float-up": "floatUp linear infinite",
        "wave-drift": "waveDrift 9s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}
