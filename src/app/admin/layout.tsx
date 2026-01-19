'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '../actions/auth';
import { ThemeToggle } from '../../components/ThemeToggle';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [currentDate, setCurrentDate] = useState('');

    useEffect(() => {
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
        setCurrentDate(now.toLocaleDateString('en-US', options));
    }, []);

    const isActive = (path: string) => {
        // Basic check: full match or starts with path + slash
        return pathname === path || pathname.startsWith(`${path}/`);
    };

    return (
        <div className="bg-admin-background-light dark:bg-admin-background-dark text-slate-900 dark:text-white font-display overflow-hidden selection:bg-admin-primary selection:text-white">
            <div className="flex h-screen w-full">
                {/* Sidebar Navigation */}
                <aside className="w-20 lg:w-64 flex-shrink-0 flex flex-col justify-between border-r border-admin-border-light dark:border-admin-border-dark bg-white dark:bg-[#111621] transition-colors duration-300">
                    <div className="flex flex-col gap-4 p-4">
                        {/* Brand */}
                        <div className="flex items-center gap-3 px-2">
                            <div className="bg-admin-primary/10 dark:bg-admin-primary/20 flex items-center justify-center aspect-square rounded-lg size-10 text-admin-primary dark:text-white">
                                <span className="material-symbols-outlined text-admin-primary dark:text-admin-primary">hive</span>
                            </div>
                            <div className="hidden lg:flex flex-col">
                                <h1 className="text-slate-900 dark:text-white text-base font-bold leading-none tracking-tight">opsbee</h1>
                                <p className="text-slate-500 dark:text-[#9da6b8] text-xs font-medium leading-normal mt-1 tracking-wide">WORKHUB ADMIN</p>
                            </div>
                        </div>
                        {/* Nav Items */}
                        <nav className="flex flex-col gap-1 mt-6">
                            <Link
                                href="/admin"
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg group transition-all duration-200 ${isActive('/admin') && !isActive('/admin/employees') && !isActive('/admin/attendance') && !isActive('/admin/leaves') ? 'bg-admin-primary text-white' : 'text-slate-600 dark:text-[#9da6b8] hover:bg-slate-100 dark:hover:bg-admin-surface-dark hover:text-slate-900 dark:hover:text-white'}`}
                            >
                                <span className="material-symbols-outlined" style={isActive('/admin') && !isActive('/admin/employees') ? { fontVariationSettings: "'FILL' 1" } : {}}>dashboard</span>
                                <span className="hidden lg:block text-sm font-bold">Dashboard</span>
                            </Link>
                            <Link
                                href="/admin/employees"
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg group transition-all duration-200 ${isActive('/admin/employees') ? 'bg-admin-primary text-white' : 'text-slate-600 dark:text-[#9da6b8] hover:bg-slate-100 dark:hover:bg-admin-surface-dark hover:text-slate-900 dark:hover:text-white'}`}
                            >
                                <span className="material-symbols-outlined" style={isActive('/admin/employees') ? { fontVariationSettings: "'FILL' 1" } : {}}>group</span>
                                <span className="hidden lg:block text-sm font-bold">Employees</span>
                            </Link>
                            <Link
                                href="/admin/attendance"
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg group transition-all duration-200 ${isActive('/admin/attendance') ? 'bg-admin-primary text-white' : 'text-slate-600 dark:text-[#9da6b8] hover:bg-slate-100 dark:hover:bg-admin-surface-dark hover:text-slate-900 dark:hover:text-white'}`}
                            >
                                <span className="material-symbols-outlined" style={isActive('/admin/attendance') ? { fontVariationSettings: "'FILL' 1" } : {}}>schedule</span>
                                <span className="hidden lg:block text-sm font-bold">Attendance</span>
                            </Link>
                            <Link
                                href="/admin/leaves"
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg group transition-all duration-200 ${isActive('/admin/leaves') ? 'bg-admin-primary text-white' : 'text-slate-600 dark:text-[#9da6b8] hover:bg-slate-100 dark:hover:bg-admin-surface-dark hover:text-slate-900 dark:hover:text-white'}`}
                            >
                                <span className="material-symbols-outlined" style={isActive('/admin/leaves') ? { fontVariationSettings: "'FILL' 1" } : {}}>event_busy</span>
                                <span className="hidden lg:block text-sm font-bold">Leaves</span>
                            </Link>
                            <div className="my-2 border-t border-admin-border-light dark:border-admin-border-dark"></div>
                            <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-[#9da6b8] hover:bg-slate-100 dark:hover:bg-admin-surface-dark hover:text-slate-900 dark:hover:text-white transition-all duration-200">
                                <span className="material-symbols-outlined">settings</span>
                                <span className="hidden lg:block text-sm font-bold">Settings</span>
                            </button>
                        </nav>
                    </div>
                    {/* User Profile (Bottom) */}
                    <div className="p-4">
                        <form action={logout}>
                            <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-[#9da6b8] hover:bg-red-50 dark:hover:bg-admin-surface-dark/50 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200" type="submit">
                                <span className="material-symbols-outlined">logout</span>
                                <span className="hidden lg:block text-sm font-bold">Log Out</span>
                            </button>
                        </form>

                    </div>
                </aside>
                {/* Main Content Area */}
                <main className="flex-1 flex flex-col h-full overflow-hidden bg-admin-background-light dark:bg-admin-background-dark relative transition-colors duration-300">
                    {/* Top Header */}
                    <header className="flex items-center justify-between px-6 py-4 border-b border-admin-border-light dark:border-admin-border-dark bg-white/50 dark:bg-admin-background-dark/50 backdrop-blur-md sticky top-0 z-20">
                        <div className="flex items-center gap-6 flex-1">
                            <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight capitalize">
                                {pathname === '/admin' ? 'Dashboard Overview' :
                                    pathname.includes('employees') ? 'Employee Management' :
                                        pathname.includes('attendance') ? 'Attendance Records' :
                                            pathname.includes('leaves') ? 'Leave Requests' : 'Overview'}
                            </h2>
                            {/* Search Bar */}
                            <div className="hidden md:flex items-center w-full max-w-sm h-10 rounded-lg bg-slate-100 dark:bg-admin-surface-dark border border-admin-border-light dark:border-admin-border-dark focus-within:border-admin-primary/50 transition-colors group">
                                <span className="material-symbols-outlined text-slate-400 dark:text-[#9da6b8] ml-3 group-focus-within:text-admin-primary dark:group-focus-within:text-white transition-colors">search</span>
                                <input className="w-full bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#64748b] text-sm focus:ring-0 ml-1" placeholder="Search..." type="text" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                            {/* Date Filter */}
                            <button className="hidden sm:flex items-center gap-2 h-10 px-4 bg-white dark:bg-admin-surface-dark border border-admin-border-light dark:border-admin-border-dark rounded-lg hover:bg-slate-50 dark:hover:bg-[#252b38] transition-colors text-slate-700 dark:text-white text-sm font-medium">
                                <span className="material-symbols-outlined text-slate-400 dark:text-[#9da6b8] text-[20px]">calendar_today</span>
                                <span>{currentDate}</span>
                            </button>
                            {/* Notifications */}
                            <button className="flex items-center justify-center size-10 bg-white dark:bg-admin-surface-dark border border-admin-border-light dark:border-admin-border-dark rounded-lg hover:bg-slate-50 dark:hover:bg-[#252b38] transition-colors text-slate-700 dark:text-white relative">
                                <span className="material-symbols-outlined text-[20px]">notifications</span>
                                <span className="absolute top-2 right-2.5 size-2 bg-admin-primary rounded-full animate-pulse"></span>
                            </button>
                        </div>
                    </header>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                        <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
