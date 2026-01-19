'use client';

import React, { useState, useEffect } from 'react';
import { ThemeToggle } from '../ThemeToggle';

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
};

import { useDashboard } from '../../contexts/DashboardContext';

export default function EmployeeHeader({ user }: { user: User }) {
    const { selectedDate, setSelectedDate } = useDashboard();

    const [currentTime, setCurrentTime] = useState(selectedDate);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Sync internal clock-time base with selected date
        const timer = setInterval(() => {
            const now = new Date();
            const target = new Date(selectedDate);
            target.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
            setCurrentTime(target);
        }, 1000);
        return () => clearInterval(timer);
    }, [selectedDate]);


    const dateString = currentTime.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const names = user.name.split(' ');
    const firstName = names[0] || 'Employee';

    const hours = currentTime.getHours();
    let greeting = 'Good Morning';
    if (hours >= 12 && hours < 17) {
        greeting = 'Good Afternoon';
    } else if (hours >= 17) {
        greeting = 'Good Evening';
    }

    return (
        <header className="h-20 flex items-center justify-between px-8 bg-employee-surface-light/50 dark:bg-employee-surface-dark/50 backdrop-blur-sm z-10 sticky top-0 border-b border-transparent dark:border-white/5">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{greeting}, {firstName}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                        {mounted ? dateString : 'Loading...'}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-1">
                <ThemeToggle />
                <button className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative flex items-center justify-center">
                    <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white dark:border-slate-800"></span>
                    <span className="material-symbols-outlined text-[20px]">notifications</span>
                </button>
            </div>
        </header>
    );
}
