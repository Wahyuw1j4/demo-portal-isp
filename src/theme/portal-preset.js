import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

const PortalPreset = definePreset(Aura, {
    semantic: {
        primary: {
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
        },
        colorScheme: {
            light: {
                primary: {
                    color: '#3300cc',
                    inverseColor: '#ffffff',
                    hoverColor: '#2900a3',
                    activeColor: '#1f007d'
                },
                surface: {
                    0: '#ffffff',
                    50: '#f8f7ff',
                    100: '#f0edff',
                    200: '#e0dbf5',
                    300: '#c8c2e0',
                    400: '#9f97c0',
                    500: '#7a7298',
                    600: '#5c5577',
                    700: '#433d5c',
                    800: '#2e2944',
                    900: '#1e1b4b',
                    950: '#13104a'
                }
            }
        }
    }
});

export default PortalPreset;
