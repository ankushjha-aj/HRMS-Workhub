'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '../../app/actions/auth';
import ChangePasswordModal from './ChangePasswordModal';

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    employeeProfile?: {
        profileImage: string | null;
    } | null;
};

export default function EmployeeSidebar({ user }: { user: User }) {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [showPasswordModal, setShowPasswordModal] = React.useState(false);

    // Name splitting
    const names = user.name.split(' ');
    const firstName = names[0] || 'Employee';
    const lastName = names.length > 1 ? names[names.length - 1] : '';
    const initials = (firstName[0] || '') + (lastName[0] || '');

    const isActive = (path: string) => pathname === path;

    const navItems = [
        { name: 'Dashboard', href: '/employee-dashboard', icon: 'dashboard' },
        { name: 'My Attendance', href: '/employee-dashboard/attendance', icon: 'calendar_month' },
        { name: 'Task Updates', href: '/employee-dashboard/task-updates', icon: 'task' },
        { name: 'Profile', href: '/employee-dashboard/profile', icon: 'person' },
        { name: 'Holidays', href: '/employee-dashboard/holidays', icon: 'beach_access' },
        { name: 'Payslips', href: '/employee-dashboard/payslips', icon: 'receipt_long' },
    ];

    return (
        <aside className="w-72 bg-employee-surface-light dark:bg-employee-surface-dark border-r border-employee-border-light dark:border-employee-border-dark flex flex-col h-full shrink-0 transition-colors duration-300">
            {/* Logo Area */}
            <div className="p-6 pb-2">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-employee-primary flex items-center justify-center text-white shrink-0">
                        <span className="material-symbols-outlined">hub</span>
                    </div>
                    <div>
                        <h1 className="text-slate-900 dark:text-white text-lg font-bold leading-tight">opsbee</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium tracking-wide">WORKHUB</p>
                    </div>
                </div>
            </div>
            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${isActive(item.href)
                            ? 'bg-employee-primary/10 text-employee-primary dark:text-employee-primary-400'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        <span className={`material-symbols-outlined ${isActive(item.href) ? 'icon-filled' : 'group-hover:scale-110 transition-transform'}`}>
                            {item.icon}
                        </span>
                        <span className={`text-sm ${isActive(item.href) ? 'font-bold' : 'font-bold'}`}>
                            {item.name}
                        </span>
                    </Link>
                ))}
            </nav>
            {/* User Profile Snippet */}
            <div className="p-4 border-t border-employee-border-light dark:border-employee-border-dark relative">
                {isMenuOpen && (
                    <div className="absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 overflow-hidden py-1 z-50">
                        <button
                            onClick={() => {
                                setShowPasswordModal(true);
                                setIsMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                            Reset Password
                        </button>
                        <form action={logout}>
                            <button className="w-full text-left px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-2" type="submit">
                                <span className="material-symbols-outlined text-[18px]">logout</span>
                                Log Out
                            </button>
                        </form>
                    </div>
                )}

                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors text-left ${isMenuOpen ? 'bg-slate-50 dark:bg-white/5' : ''}`}
                >
                    {user.employeeProfile?.profileImage ? (
                        <div className="size-10 rounded-full ring-2 ring-white dark:ring-slate-700 overflow-hidden shrink-0">
                            <img src={user.employeeProfile.profileImage} alt={user.name} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 ring-2 ring-white dark:ring-slate-700 bg-employee-primary text-white flex items-center justify-center font-bold text-lg shrink-0">
                            {initials}
                        </div>
                    )}
                    <div className="flex flex-col min-w-0 flex-1">
                        <p className="text-slate-900 dark:text-white text-sm font-semibold truncate">{user.name}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs truncate capitalize">{user.role}</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 text-xl">
                        {isMenuOpen ? 'expand_more' : 'expand_less'}
                    </span>
                </button>
            </div>

            <ChangePasswordModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
            />
        </aside>
    );
}
