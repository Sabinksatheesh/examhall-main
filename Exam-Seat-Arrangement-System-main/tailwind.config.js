/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        st: '1384px',
        'hw': { 'max': '1384px' }
      },
      colors: {
        'green-login': '#B8EAD9',   // lighter mint green for login-related areas
        'green-medium': '#A17C5B',  // calm medium green tone
        'green-light': '#DCC7AA',   // softer pastel green, works well on light backgrounds
        'green-dark': '#5C3D2E',    // still dark, but less cold, more harmonious
        'green-save': '#BFA18F',    // can keep this as a highlight/primary CTA green
        'grey-all': '#BECCCF',      // looks good, no change needed
        'red-download': '#DD7A96',  // looks okay against #FAF9F6, keep as is
        'background': '#FAF9F6',    // unchanged
      },
      letterSpacing: {
        needed: '.09em',
      },

      fontFamily: { //custom font style
        'Outfit-Thin': "Outfit-Thin",
        'Outfit-ExtraLight': "Outfit-ExtraLight",
        'Outfit-Light': "Outfit-Light",
        'Outfit-Regular': "Outfit-Regular",
        'Outfit-Medium': "Outfit-Medium",
        'Outfit-SemiBold': "Outfit-SemiBold",
        'Outfit-Bold': "Outfit-Bold",
        'Outfit-ExtraBold': "Outfit-ExtraBold",
        'Outfit-Black': "Outfit-Black",
      },

      backgroundImage: {
        'login-signup': "url('/src/assets/bgimage.png')",
      }
    },
  },
  plugins: [],
};
