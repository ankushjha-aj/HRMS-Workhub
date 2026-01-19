/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Login Palette
                "login-primary": "#06e4f9",
                "login-background-light": "#f9fafa",
                "login-background-dark": "#16181d",
                "login-surface-dark": "#1F242D",
                "login-text-main": "#E0E5ED",
                "login-text-muted": "#9CA3AF",

                // Admin Palette
                "admin-primary": "#0d2f73",
                "admin-primary-hover": "#163c85",
                "admin-background-light": "#f6f6f8",
                "admin-background-dark": "#111621",
                "admin-surface-light": "#ffffff",
                "admin-surface-dark": "#1e232e",
                "admin-border-light": "#e2e8f0",
                "admin-border-dark": "#2d3544",

                // Employee Palette
                "employee-primary": "#1276a1",
                "employee-primary-hover": "#0e6082",
                "employee-background-light": "#f6f7f8",
                "employee-background-dark": "#22262a",
                "employee-surface-light": "#ffffff",
                "employee-surface-dark": "#2d3238",
                "employee-border-light": "#e2e8f0",
                "employee-border-dark": "#374151",
            },
            fontFamily: {
                "display": ["Manrope", "sans-serif"],
                "mono": ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"]
            },
            boxShadow: {
                'login-glow': '0 0 15px rgba(6, 228, 249, 0.3)',
                'login-recessed': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.6)',
            }
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/container-queries'),
    ],
}
