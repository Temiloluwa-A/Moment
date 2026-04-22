/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx}"
    ],
    darkMode: "class",
    theme: {
        extend: {
            "colors": {
                "inverse-primary": "#b02e00",
                "on-primary-container": "#761c00",
                "surface-dim": "#19120d", 
                "surface-variant": "#3c332d",
                "outline-variant": "#564334",
                "surface-bright": "#403731",
                "surface-container": "#261e18",
                "tertiary-fixed-dim": "#ebc23e",
                "surface-container-high": "#312822",
                "surface-tint": "#ffb5a0",
                "inverse-on-surface": "#372f28",
                "tertiary-container": "#caa41e",
                "on-tertiary": "#3c2f00",
                "on-secondary": "#522300",
                "on-primary-fixed-variant": "#872100",
                "primary-fixed": "#ffdbd1",
                "on-surface": "#efe0d6",
                "tertiary": "#ebc23e",
                "on-secondary-fixed": "#321300",
                "tertiary-fixed": "#ffe087",
                "on-surface-variant": "#dcc1ae",
                "surface-container-lowest": "#130d08",
                "on-tertiary-fixed": "#241a00",
                "outline": "#a48c7a",
                "secondary-fixed-dim": "#ffb68b",
                "surface": "#19120d",
                "error": "#ffb4ab",
                "secondary-container": "#753809",
                "surface-container-highest": "#3c332d",
                "on-tertiary-fixed-variant": "#574500",
                "on-tertiary-container": "#4c3b00",
                "secondary": "#ffb68b",
                "primary": "#ffb5a0",
                "on-primary": "#5f1500",
                "error-container": "#93000a",
                "secondary-fixed": "#ffdbc8",
                "on-background": "#efe0d6",
                "on-error-container": "#ffdad6",
                "on-secondary-container": "#fba46d",
                "surface-container-low": "#221a14",
                "on-secondary-fixed-variant": "#723607",
                "primary-container": "#ff8663",
                "inverse-surface": "#efe0d6",
                "on-error": "#690005",
                "background": "#19120d",
                "primary-fixed-dim": "#ffb5a0",
                "on-primary-fixed": "#3b0900"
            },
            "borderRadius": {
                "DEFAULT": "1rem",
                "lg": "2rem",
                "xl": "3rem",
                "full": "9999px"
            },
            "fontFamily": {
                "headline": ["Noto Serif"],
                "body": ["Manrope"],
                "label": ["Manrope"]
            }
        },
    }, 
    plugins: [],
}
