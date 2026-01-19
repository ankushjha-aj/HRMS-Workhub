import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '../../lib/prisma';
import EmployeeSidebar from '../../components/dashboard/EmployeeSidebar';
import EmployeeHeader from '../../components/dashboard/EmployeeHeader';

import DashboardLayoutWrapper from './DashboardLayoutWrapper';

export default async function EmployeeDashboardLayout({ children }: { children: React.ReactNode }) {
    // ... (Auth/User fetching remains) ...
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
        redirect('/');
    }

    let user;
    try {
        const session = JSON.parse(sessionCookie.value);
        user = await prisma.user.findUnique({
            where: { id: session.id },
            select: {
                id: true, name: true, email: true, role: true,
                employeeProfile: { select: { profileImage: true } }
            }
        });
    } catch (error) {
        console.error("Session parse error", error);
        redirect('/');
    }

    if (!user) redirect('/');

    return (
        <DashboardLayoutWrapper>
            <div className="bg-employee-background-light dark:bg-employee-background-dark font-display text-slate-800 dark:text-slate-200 antialiased overflow-hidden h-screen flex">
                {/* Sidebar */}
                <EmployeeSidebar user={user} />

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                    {/* Header */}
                    <EmployeeHeader user={user} />

                    {/* Page Content */}
                    <div className="flex-1 overflow-y-auto">
                        {children}
                    </div>
                </main>
            </div>
        </DashboardLayoutWrapper>
    );
}
