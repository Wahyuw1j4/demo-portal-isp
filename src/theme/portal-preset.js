import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

const PortalPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '#f7fee7',
            100: '#ecfccb',
            200: '#d9f99d',
            300: '#bef264',
            400: '#a3e635',
            500: '#84cc16',
            600: '#65a30d',
            700: '#4d7c0f',
            800: '#3f6212',
            900: '#365314',
            950: '#1a2e05'
        },
        colorScheme: {
            light: {
                primary: {
                    color: '#65a30d',
                    inverseColor: '#ffffff',
                    hoverColor: '#4d7c0f',
                    activeColor: '#3f6212'
                },
                surface: {
                    0: '#ffffff',
                    50: '#f7fee7',
                    100: '#ecfccb',
                    200: '#dbe9c2',
                    300: '#c2d4a0',
                    400: '#93ab6e',
                    500: '#728951',
                    600: '#55693a',
                    700: '#3f4f2a',
                    800: '#2b351d',
                    900: '#1f2a14',
                    950: '#1a2412'
                }
            }
        }
    }
});

export default PortalPreset;
