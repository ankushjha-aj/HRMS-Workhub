import React from 'react';
import { prisma } from '../../lib/prisma';

export default async function AdminDashboard() {
    const totalUsers = await prisma.user.count();
    const adminCount = await prisma.user.count({ where: { role: 'admin' } });
    const employeeCount = await prisma.user.count({ where: { role: 'employee' } });

    return (
        <>
            {/* VIEW: DASHBOARD */}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Stat Card 1 */}
                <div className="bg-white dark:bg-admin-surface-dark rounded-xl p-5 border border-admin-border-light dark:border-admin-border-dark shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-slate-900 dark:text-white text-4xl">groups</span>
                    </div>
                    <p className="text-slate-500 dark:text-[#9da6b8] text-sm font-medium">Total Employees</p>
                    <div className="flex flex-col mt-2">
                        <p className="text-slate-900 dark:text-white text-3xl font-extrabold tracking-tight">{totalUsers}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs font-medium text-slate-500 dark:text-[#9da6b8]">
                            <span className="flex items-center gap-1">
                                <span className="size-2 rounded-full bg-purple-500"></span>
                                Admins: {adminCount}
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="size-2 rounded-full bg-blue-500"></span>
                                Employees: {employeeCount}
                            </span>
                        </div>
                    </div>
                </div>
                {/* Stat Card 2 */}
                <div className="bg-white dark:bg-admin-surface-dark rounded-xl p-5 border border-admin-border-light dark:border-admin-border-dark shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-emerald-500 text-4xl">check_circle</span>
                    </div>
                    <p className="text-slate-500 dark:text-[#9da6b8] text-sm font-medium">Present Today</p>
                    <div className="flex items-end gap-3 mt-2">
                        <p className="text-slate-900 dark:text-white text-3xl font-extrabold tracking-tight">0</p>
                        <span className="text-emerald-500 text-xs font-medium mb-1.5 flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[14px]">trending_up</span> 0%
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-gray-800 h-1 mt-4 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '0%' }}></div>
                    </div>
                </div>
                {/* Stat Card 3 */}
                <div className="bg-white dark:bg-admin-surface-dark rounded-xl p-5 border border-admin-border-light dark:border-admin-border-dark shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-amber-500 text-4xl">beach_access</span>
                    </div>
                    <p className="text-slate-500 dark:text-[#9da6b8] text-sm font-medium">On Leave</p>
                    <div className="flex items-end gap-3 mt-2">
                        <p className="text-slate-900 dark:text-white text-3xl font-extrabold tracking-tight">0</p>
                        <span className="text-amber-500 text-xs font-medium mb-1.5 flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[14px]">trending_up</span> 0%
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-gray-800 h-1 mt-4 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: '0%' }}></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Recent Activity Table */}
                <div className="xl:col-span-2 flex flex-col bg-white dark:bg-admin-surface-dark rounded-xl border border-admin-border-light dark:border-admin-border-dark shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-5 border-b border-admin-border-light dark:border-admin-border-dark">
                        <h3 className="text-slate-900 dark:text-white text-lg font-bold">Recent Punch-ins</h3>
                        <button className="text-admin-primary hover:text-admin-primary-hover text-sm font-semibold transition-colors">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-[#161a23] border-b border-admin-border-light dark:border-admin-border-dark text-xs uppercase tracking-wider text-slate-500 dark:text-[#9da6b8]">
                                    <th className="px-6 py-4 font-semibold">Employee</th>
                                    <th className="px-6 py-4 font-semibold">Role</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-admin-border-light dark:divide-admin-border-dark">
                                <tr className="group hover:bg-slate-50 dark:hover:bg-[#252b38] transition-colors cursor-pointer">
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500 dark:text-[#9da6b8] italic">
                                        No recent punch-ins found.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pending Actions Panel */}
                <div className="xl:col-span-1 flex flex-col gap-6">
                    <div className="bg-white dark:bg-admin-surface-dark rounded-xl border border-admin-border-light dark:border-admin-border-dark p-6 shadow-sm h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-slate-900 dark:text-white text-lg font-bold">Pending Actions</h3>
                            <span className="bg-slate-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">0 New</span>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#181d26] border border-admin-border-light dark:border-admin-border-dark text-center">
                                <p className="text-slate-500 dark:text-[#9da6b8] text-sm">No pending actions.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Info */}
            <div className="pb-6 text-center lg:text-left">
                <p className="text-slate-500 dark:text-[#64748b] text-xs">Last updated: {new Date().toLocaleTimeString()} • Server Status: <span className="text-emerald-500 font-semibold">Online</span></p>
            </div>
        </>
    );
};
