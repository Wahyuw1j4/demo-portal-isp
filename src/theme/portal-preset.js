import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

const PortalPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '#f6fbf7',
            100: '#eaf6ee',
            200: '#d8ecde',
            300: '#c4e4cc',
            400: '#abd9b7',
            500: '#92caa2',
            600: '#79b88c',
            700: '#679f79',
            800: '#58886a',
            900: '#4b735b',
            950: '#2f4a39'
        },
        colorScheme: {
            light: {
                primary: {
                    color: '#79b88c',
                    inverseColor: '#ffffff',
                    hoverColor: '#679f79',
                    activeColor: '#58886a'
                },
                surface: {
                    0: '#ffffff',
                    50: '#f6fbf7',
                    100: '#eaf6ee',
                    200: '#d5e6da',
                    300: '#bfd4c4',
                    400: '#9db9a5',
                    500: '#7e9886',
                    600: '#667e70',
                    700: '#4e6358',
                    800: '#39493f',
                    900: '#2a352e',
                    950: '#1f2923'
                }
            }
        }
    }
});

export default PortalPreset;
