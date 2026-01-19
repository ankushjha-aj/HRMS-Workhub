'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

type AttendanceRecord = {
    date: Date;
    punchIn: Date | null;
    punchOut: Date | null;
    totalBreakSeconds: number;
    totalWorkSeconds: number;
    status: string | null;
};

interface AttendanceCalendarProps {
    year: number;
    month: number; // 0-11
    attendanceData: AttendanceRecord[];
}

export default function AttendanceCalendar({ year, month, attendanceData }: AttendanceCalendarProps) {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState<AttendanceRecord | null>(null);

    const getDaysInMonth = (y: number, m: number) => {
        const daysInMonth = new Date(y, m + 1, 0).getDate();
        const firstDayOfMonth = new Date(y, m, 1).getDay(); // 0 = Sunday
        const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Mon=0, Sun=6

        const days = [];
        for (let i = 0; i < startDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(y, m, i));
        return days;
    };

    const days = getDaysInMonth(year, month);
    const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });

    const handleMonthChange = (direction: 'prev' | 'next') => {
        let newYear = year;
        let newMonth = month;
        if (direction === 'prev') {
            newMonth--;
            if (newMonth < 0) { newMonth = 11; newYear--; }
        } else {
            newMonth++;
            if (newMonth > 11) { newMonth = 0; newYear++; }
        }
        router.push(`/employee-dashboard/attendance?year=${newYear}&month=${newMonth}`);
    };

    const getRecordForDay = (date: Date) => {
        return attendanceData.find(r =>
            new Date(r.date).getDate() === date.getDate() &&
            new Date(r.date).getMonth() === date.getMonth() &&
            new Date(r.date).getFullYear() === date.getFullYear()
        );
    };

    const getStatusColor = (status: string | null) => {
        switch (status) {
            case 'PRESENT': return 'bg-green-500 text-white';
            case 'HALF_DAY': return 'bg-yellow-500 text-white';
            case 'SHORT_DAY': return 'bg-orange-500 text-white';
            case 'LEAVE': return 'bg-purple-500 text-white'; // Added for future support
            case 'ON_LEAVE': return 'bg-purple-500 text-white';
            case 'ABSENT': return 'bg-red-100 dark:bg-red-900/20 text-red-500'; // Or just red dot
            default: return 'bg-slate-100 dark:bg-slate-800 text-slate-400';
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header Controls */}
            <div className="flex items-center justify-between bg-employee-surface-light dark:bg-employee-surface-dark p-6 rounded-xl border border-employee-border-light dark:border-employee-border-dark shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-3xl text-employee-primary">calendar_month</span>
                    {monthName} {year}
                </h2>
                <div className="flex gap-2">
                    <button onClick={() => handleMonthChange('prev')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button onClick={() => handleMonthChange('next')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-employee-surface-light dark:bg-employee-surface-dark p-6 rounded-xl border border-employee-border-light dark:border-employee-border-dark shadow-sm">
                <div className="grid grid-cols-7 mb-4">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <div key={day} className="text-center text-sm font-semibold text-slate-500 uppercase tracking-wider py-2">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-2 lg:gap-4">
                    {days.map((date, index) => {
                        if (!date) return <div key={`empty-${index}`} className="aspect-square"></div>;

                        const record = getRecordForDay(date);
                        const isToday = new Date().toDateString() === date.toDateString();

                        return (
                            <button
                                key={date.toISOString()}
                                onClick={() => record && setSelectedDate(record)}
                                disabled={!record}
                                className={`
                                    relative aspect-square rounded-xl border p-2 flex flex-col justify-between transition-all text-left group
                                    ${record
                                        ? 'hover:scale-[1.02] hover:shadow-md cursor-pointer border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50'
                                        : 'opacity-50 cursor-default border-transparent'
                                    }
                                    ${isToday ? 'ring-2 ring-employee-primary ring-offset-2 dark:ring-offset-slate-900' : ''}
                                `}
                            >
                                <span className={`text-sm font-bold ${isToday ? 'text-employee-primary' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {date.getDate()}
                                </span>
                                {record && (
                                    <div className="flex flex-col gap-1 items-end">
                                        <div className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm ${getStatusColor(record.status)}`}>
                                            {record.status?.replace('_', ' ')}
                                        </div>
                                        {record.totalWorkSeconds > 0 && (
                                            <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                                                {Math.floor(record.totalWorkSeconds / 3600)}h {Math.floor((record.totalWorkSeconds % 3600) / 60)}m
                                            </div>
                                        )}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Details Modal */}
            {selectedDate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-employee-surface-dark w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {new Date(selectedDate.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </h3>
                                <div className={`text-xs font-bold uppercase w-fit px-2 py-0.5 rounded mt-1 ${getStatusColor(selectedDate.status)}`}>
                                    {selectedDate.status?.replace('_', ' ')}
                                </div>
                            </div>
                            <button onClick={() => setSelectedDate(null)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/30">
                                    <p className="text-xs text-green-600 dark:text-green-400 font-medium uppercase mb-1">Punch In</p>
                                    <p className="text-xl font-bold text-green-700 dark:text-green-300">
                                        {selectedDate.punchIn ? new Date(selectedDate.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30">
                                    <p className="text-xs text-red-600 dark:text-red-400 font-medium uppercase mb-1">Punch Out</p>
                                    <p className="text-xl font-bold text-red-700 dark:text-red-300">
                                        {selectedDate.punchOut ? new Date(selectedDate.punchOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-600">
                                        <span className="material-symbols-outlined">coffee</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Break Time</p>
                                        <p className="text-xs text-slate-500">Total duration</p>
                                    </div>
                                </div>
                                <p className="text-lg font-mono font-semibold text-slate-700 dark:text-slate-300">
                                    {Math.floor(selectedDate.totalBreakSeconds / 60)}m {selectedDate.totalBreakSeconds % 60}s
                                </p>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-xl bg-employee-primary/5 border border-employee-primary/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-employee-primary/10 text-employee-primary">
                                        <span className="material-symbols-outlined">timelapse</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Total Work</p>
                                        <p className="text-xs text-slate-500">Effective hours</p>
                                    </div>
                                </div>
                                <p className="text-xl font-mono font-bold text-employee-primary">
                                    {Math.floor(selectedDate.totalWorkSeconds / 3600)}h {Math.floor((selectedDate.totalWorkSeconds % 3600) / 60)}m
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
