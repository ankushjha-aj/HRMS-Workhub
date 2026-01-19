'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
            aria-label="Toggle Theme"
        >
            {theme === 'dark' ? (
                <span className="material-symbols-outlined text-[20px]">light_mode</span>
            ) : (
                <span className="material-symbols-outlined text-[20px]">dark_mode</span>
            )}
        </button>
    );
}