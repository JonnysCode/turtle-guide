/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'turtle-teal': '#14B8A6',
        'turtle-amber': '#F59E0B',
        'turtle-cream': '#FEF7ED',
        'turtle-slate': '#1E293B',
        'turtle-green': '#10B981',
        'turtle-orange': '#FB923C',
      },
      fontFamily: {
        'inter': ['Inter-Regular'],
        'inter-bold': ['Inter-Bold'],
        'inter-semibold': ['Inter-SemiBold'],
      }
    },
  },
  plugins: [],
}