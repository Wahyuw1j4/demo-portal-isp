import PrimeUI from 'tailwindcss-primeui';

/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    plugins: [PrimeUI],
    theme: {
        screens: {
            sm: '576px',
            md: '768px',
            lg: '992px',
            xl: '1200px',
            '2xl': '1920px'
        },
        extend: {
            colors: {
                indigo: {
                    50: '#f0edff',
                    100: '#ddd6fe',
                    200: '#c4b5fd',
                    300: '#a78bfa',
                    400: '#7c5ce8',
                    500: '#5a2dcf',
                    600: '#4318d1',
                    700: '#3300cc',
                    800: '#2900a3',
                    900: '#1f007d',
                    950: '#13004d'
                }
            },
            fontFamily: {
                body: ['"Plus Jakarta Sans"', 'sans-serif'],
                display: ['"Plus Jakarta Sans"', 'sans-serif']
            }
        }
    }
};
