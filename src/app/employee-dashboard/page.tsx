import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '../../lib/prisma';
import { getPunchStatus, getMonthlyAttendance } from '../actions/attendance';
import DashboardContent from './DashboardContent';

export default async function EmployeeDashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
        redirect('/');
    }

    let user;
    try {
        const session = JSON.parse(sessionCookie.value);
        if (session.role !== 'employee') {
            // redirect('/admin'); 
        }

        user = await prisma.user.findUnique({
            where: { id: session.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                faceEnrolled: true,
                faceDescriptor: true
            }
        });
    } catch (error) {
        console.error("Session parse error", error);
        redirect('/');
    }

    if (!user) {
        redirect('/');
    }

    const params = await searchParams;
    const dateParam = typeof params.date === 'string' ? params.date : undefined;
    const date = dateParam ? new Date(dateParam) : undefined;

    // Use selected date or current date for month view
    const viewDate = date || new Date();

    // Parallel Fetching
    const [monthlyRecords, punchStatus] = await Promise.all([
        getMonthlyAttendance(user.id, viewDate.getFullYear(), viewDate.getMonth()),
        getPunchStatus(user.id, date)
    ]);

    return <DashboardContent user={user} attendanceState={punchStatus} selectedDate={date} monthlyRecords={monthlyRecords} />;
};
