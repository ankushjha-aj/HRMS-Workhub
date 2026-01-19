'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../contexts/DashboardContext';
import { getPunchStatus, getMonthlyAttendance } from '../actions/attendance';

import PunchWidget from '../../components/dashboard/PunchWidget';
import FaceEnrollment from '../../components/FaceEnrollment';
import type { AttendanceState } from '../actions/attendance';

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    faceEnrolled: boolean;
    faceDescriptor: any;
};

export default function DashboardContent({ user, attendanceState: initialAttendance, selectedDate, monthlyRecords: initialMonthly }: { user: User; attendanceState: AttendanceState; selectedDate?: Date; monthlyRecords?: any[] }) {
    const { selectedDate: contextDate, setSelectedDate } = useDashboard();

    // Local State for Data (Initialized with Server Props)
    const [punchStatus, setPunchStatus] = useState<AttendanceState>(initialAttendance);
    const [records, setRecords] = useState<any[]>(initialMonthly || []);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [mounted, setMounted] = useState(false);

    //Face Enrollment State
    //Face Enrollment State
    const hasValidFaceData = user.faceEnrolled &&
        user.faceDescriptor &&
        Array.isArray(user.faceDescriptor) &&
        user.faceDescriptor.length > 0;
    const [showEnrollment, setShowEnrollment] = useState(!hasValidFaceData);
    const [isEnrolled, setIsEnrolled] = useState(user.faceEnrolled);

    useEffect(() => { setMounted(true); }, []);

    // View Date for Calendar (Separate from Data Date)
    const [viewDate, setViewDate] = useState(contextDate);

    // Sync View Date when Context Date changes (e.g. initially or externally)
    useEffect(() => {
        setViewDate(contextDate);
    }, [contextDate]);

    // Helper: Get week boundaries (Monday to Sunday)
    const getWeekBoundaries = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday

        const monday = new Date(d.setDate(diff));
        monday.setHours(0, 0, 0, 0);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        return { start: monday, end: sunday };
    };

    // Helper: Get week number within month
    const getWeekNumberInMonth = (date: Date) => {
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const firstDayOfWeek = firstDay.getDay();
        const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Monday = 0

        const dayOfMonth = date.getDate();
        return Math.ceil((dayOfMonth + offset) / 7);
    };

    // State for weekly hours
    const [weeklyHours, setWeeklyHours] = useState(0);
    const [weekNumber, setWeekNumber] = useState(1);


    // Calculate weekly hours when records or contextDate changes
    useEffect(() => {
        const { start, end } = getWeekBoundaries(contextDate);
        const weekNum = getWeekNumberInMonth(contextDate);
        setWeekNumber(weekNum);

        // Filter records for this week and sum completed hours only
        const weekRecords = records.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate >= start && recordDate <= end;
        });

        const totalSeconds = weekRecords.reduce((sum, record) => sum + (record.totalWorkSeconds || 0), 0);
        const hours = totalSeconds / 3600;
        setWeeklyHours(Math.round(hours * 10) / 10); // Round to 1 decimal place

    }, [records, contextDate]);

    // Calculate next Sunday for holiday widget
    const getNextSunday = (fromDate: Date) => {
        const date = new Date(fromDate);
        const currentDay = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

        // If today is Sunday, show next Sunday (7 days away)
        // Otherwise, calculate days until next Sunday
        const daysUntilSunday = currentDay === 0 ? 7 : 7 - currentDay;

        const nextSunday = new Date(date);
        nextSunday.setDate(date.getDate() + daysUntilSunday);
        return nextSunday;
    };

    const nextHoliday = getNextSunday(contextDate);
    const daysUntilHoliday = Math.ceil((nextHoliday.getTime() - contextDate.getTime()) / (1000 * 60 * 60 * 24));
    const holidayLabel = daysUntilHoliday === 7 ? 'Next Sunday' : daysUntilHoliday === 1 ? 'Tomorrow' : `In ${daysUntilHoliday} days`;


    // Calendar Generation
    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();
    const currentMonthYear = viewDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

    // Effect: Fetch Data when Context Date Changes
    useEffect(() => {
        async function refreshData() {
            setIsLoadingData(true);
            try {
                const [newStatus, newMonthly] = await Promise.all([
                    getPunchStatus(user.id, contextDate),
                    getMonthlyAttendance(user.id, contextDate.getFullYear(), contextDate.getMonth())
                ]);
                setPunchStatus(newStatus);
                setRecords(newMonthly);
            } catch (e) {
                console.error("Failed to refresh data", e);
            } finally {
                setIsLoadingData(false);
            }
        }

        refreshData();

    }, [contextDate, user.id]);



    // Calendar Generation
    // ...


    // Calendar Generation
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday

        // Adjust for Monday start (0 = Monday, 6 = Sunday)
        const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

        const days = [];
        // Empty slots
        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }
        // Days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }
        return days;
    };

    const calendarDays = getDaysInMonth(viewDate);


    const isSunday = (day: number) => {
        const date = new Date(currentYear, currentMonth, day);
        return date.getDay() === 0;
    };

    // Handlers
    const handleDayClick = (day: number | null) => {
        if (!day) return;
        const newDate = new Date(currentYear, currentMonth, day);
        setSelectedDate(newDate);
    };

    const handleMonthChange = (increment: number) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + increment);
        setViewDate(newDate);
    };

    return (
        <div className="p-4 md:p-8 pt-6">
            <div className="max-w-[1600px] w-full grid grid-cols-12 gap-6">
                {/* LEFT COLUMN (Main Action & Stats) */}
                <div className="col-span-12 xl:col-span-8 flex flex-col gap-6">
                    {/* Punch Widget */}
                    <PunchWidget
                        userId={user.id}
                        initialState={punchStatus}
                        date={contextDate}
                        userFaceDescriptor={user.faceDescriptor}
                        userFaceEnrolled={user.faceEnrolled}
                    />
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-employee-surface-light dark:bg-employee-surface-dark rounded-xl p-6 border border-employee-border-light dark:border-employee-border-dark shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-bold mb-1">
                                        Hours - Week {weekNumber}
                                    </p>
                                    {/* Completed Hours Display */}
                                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                                        {weeklyHours} <span className="text-slate-400 text-lg font-normal">/ 48 hrs</span>
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Completed this week
                                    </p>
                                </div>
                                {/* Circular Progress Indicator */}
                                <div className="relative w-12 h-12">
                                    <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 48 48">
                                        {/* Background circle */}
                                        <circle
                                            cx="24"
                                            cy="24"
                                            r="20"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            className="text-slate-200 dark:text-slate-700"
                                        />
                                        {/* Progress circle */}
                                        <circle
                                            cx="24"
                                            cy="24"
                                            r="20"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            strokeDasharray={`${2 * Math.PI * 20}`}
                                            strokeDashoffset={`${2 * Math.PI * 20 * (1 - Math.min(weeklyHours / 48, 1))}`}
                                            className="text-employee-primary transition-all duration-1000 ease-out"
                                        />
                                    </svg>
                                    {/* Center icon */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-employee-primary text-xl">timelapse</span>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 mb-2 overflow-hidden">
                                <div className="bg-employee-primary h-2.5 rounded-full" style={{ width: `${Math.min((weeklyHours / 48) * 100, 100)}%` }}></div>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 text-right font-bold">
                                {Math.round((weeklyHours / 48) * 100)}% Completed
                            </p>
                        </div>
                        <div className="bg-employee-surface-light dark:bg-employee-surface-dark rounded-xl p-6 border border-employee-border-light dark:border-employee-border-dark shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-bold mb-1">Leave Balance</p>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {10 + 5} <span className="text-slate-400 text-lg font-normal">Days</span>
                                    </h3>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg text-purple-600 dark:text-purple-400">
                                    <span className="material-symbols-outlined">luggage</span>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded text-xs font-semibold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30">
                                    Casual: 10
                                </span>
                                <span className="px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded text-xs font-semibold text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800/30">
                                    Sick: 5
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-employee-surface-light dark:bg-employee-surface-dark rounded-xl border border-employee-border-light dark:border-employee-border-dark shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-employee-border-light dark:border-employee-border-dark flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Recent Activity</h3>
                            <button className="text-employee-primary hover:text-employee-primary-hover text-xs font-medium hover:underline">View All</button>
                        </div>
                        <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm italic">No recent activity found.</div>
                    </div>
                </div>
                <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">
                    <div className="bg-employee-surface-light dark:bg-employee-surface-dark rounded-xl border border-employee-border-light dark:border-employee-border-dark shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-900 dark:text-white">{mounted ? currentMonthYear : 'Loading...'}</h3>
                            <div className="flex gap-1">
                                <button onClick={() => handleMonthChange(-1)} className="size-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                                    <span className="material-symbols-outlined text-lg">chevron_left</span>
                                </button>
                                <button onClick={() => handleMonthChange(1)} className="size-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-y-4 gap-x-1 text-center mb-2">
                            {/* ... Headers ... */}
                            <div className="text-xs font-medium text-slate-400">M</div>
                            <div className="text-xs font-medium text-slate-400">T</div>
                            <div className="text-xs font-medium text-slate-400">W</div>
                            <div className="text-xs font-medium text-slate-400">T</div>
                            <div className="text-xs font-medium text-slate-400">F</div>
                            <div className="text-xs font-medium text-slate-400">S</div>
                            <div className="text-xs font-medium text-slate-400">S</div>
                        </div>
                        <div className="grid grid-cols-7 gap-y-1 gap-x-1 text-center text-sm">
                            {mounted && calendarDays.map((day, index) => {
                                const isToday = day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
                                const isSelected = day === contextDate.getDate() && currentMonth === contextDate.getMonth() && currentYear === contextDate.getFullYear();

                                // Determine Status for this day
                                let statusColor = '';
                                if (day && records) {
                                    const dateStr = new Date(currentYear, currentMonth, day).toDateString();
                                    const record = records.find((r: any) => new Date(r.date).toDateString() === dateStr);

                                    if (record) {
                                        switch (record.status) {
                                            case 'PRESENT': statusColor = 'bg-green-500 text-white shadow-sm shadow-green-200 dark:shadow-none'; break;
                                            case 'HALF_DAY': statusColor = 'bg-yellow-400 text-white shadow-sm shadow-yellow-200 dark:shadow-none'; break;
                                            case 'SHORT_DAY': statusColor = 'bg-orange-400 text-white shadow-sm shadow-orange-200 dark:shadow-none'; break;
                                            case 'LEAVE': statusColor = 'bg-purple-500 text-white shadow-sm shadow-purple-200 dark:shadow-none'; break;
                                            case 'ABSENT': statusColor = 'bg-red-400 text-white shadow-sm shadow-red-200 dark:shadow-none'; break;
                                            default: break;
                                        }
                                    }
                                }

                                const isWeekend = day && isSunday(day);

                                return (
                                    <div key={index} className="size-9 flex items-center justify-center">
                                        {day ? (
                                            <button
                                                onClick={() => !isWeekend && handleDayClick(day)}
                                                disabled={!!isWeekend}
                                                className={`
                                            size-8 flex items-center justify-center font-bold rounded-full transition-all duration-300
                                            ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-800' : ''}
                                            ${statusColor ? statusColor : ''}
                                            ${!statusColor && isToday ? 'bg-employee-primary text-white' : ''}
                                            ${!statusColor && !isToday && !isWeekend ? 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50' : ''}
                                            ${!statusColor && !isToday && isWeekend ? 'text-slate-400 cursor-not-allowed opacity-50' : ''}
                                        `}>
                                                {day}
                                            </button>
                                        ) : (
                                            <span></span>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-4 mt-4 pt-4 border-t border-employee-border-light dark:border-employee-border-dark text-xs text-slate-500 dark:text-slate-400 font-bold">
                            <div className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-green-500"></span> Present</div>
                            <div className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-yellow-400"></span> Half Day</div>
                            <div className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-orange-400"></span> Short Day</div>
                            <div className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-red-400"></span> Absent</div>
                            <div className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-purple-500"></span> Leave</div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-500 to-employee-primary rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute right-0 top-0 opacity-10"><span className="material-symbols-outlined text-[150px] -mr-8 -mt-8">celebration</span></div>
                        <p className="text-indigo-100 text-sm font-medium mb-1 uppercase tracking-wide">Upcoming Holiday</p>
                        <h3 className="text-2xl font-bold mb-4">Sunday</h3>
                        <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm p-3 rounded-lg border border-white/10 w-fit">
                            <div className="bg-white/90 text-employee-primary font-bold px-2 py-1 rounded text-center min-w-[50px]">
                                <span className="block text-xs uppercase">{nextHoliday.toLocaleDateString('en-US', { month: 'short' })}</span>
                                <span className="block text-xl leading-none">{nextHoliday.getDate()}</span>
                            </div>
                            <div className="text-sm font-medium">
                                {holidayLabel}
                                <span className="block text-xs text-indigo-100 font-normal">
                                    {nextHoliday.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-employee-surface-light dark:bg-employee-surface-dark rounded-xl border border-employee-border-light dark:border-employee-border-dark p-5 flex items-center gap-4">
                        <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500"><span className="material-symbols-outlined">support_agent</span></div>
                        <div><p className="text-sm font-semibold text-slate-900 dark:text-white">Need help?</p><p className="text-xs text-slate-500">Contact HR Support</p></div>
                    </div>
                </div>
            </div>
            <footer className="max-w-[1600px] w-full mt-10 pb-6 text-slate-400 dark:text-slate-500 text-xs">
                <p>© 2023 opsbee-workhub. Internal System v2.4.0</p>
            </footer>

            {/* Face Enrollment Modal */}
            {showEnrollment && (
                <FaceEnrollment
                    userId={user.id}
                    onSuccess={() => {
                        setIsEnrolled(true);
                        setShowEnrollment(false);
                    }}
                    onCancel={() => {
                        // For now, don't allow cancel on first enrollment
                        // setShowEnrollment(false);
                    }}
                />
            )}
        </div>
    );
}
