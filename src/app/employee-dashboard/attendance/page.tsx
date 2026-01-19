import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '../../../lib/prisma';
import { getMonthlyAttendance } from '../../actions/attendance';
import AttendanceCalendar from '../../../components/dashboard/AttendanceCalendar';

export default async function AttendancePage({
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
        });
    } catch {
        redirect('/');
    }

    if (!user) redirect('/');

    // Parse search params for date
    const params = await searchParams; // Await searchParams in Next.js 15+ (if applicable, good practice anyway)

    const now = new Date();
    const yearParam = params.year;
    const monthParam = params.month;

    const year = typeof yearParam === 'string' ? parseInt(yearParam) : now.getFullYear();
    const month = typeof monthParam === 'string' ? parseInt(monthParam) : now.getMonth();

    const attendanceData = await getMonthlyAttendance(user.id, year, month);

    return (
        <div className="p-4 md:p-8 pt-6">
            <div className="max-w-[1600px] w-full flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">My Attendance</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">View your working hours, breaks, and daily status.</p>
                </div>

                <AttendanceCalendar year={year} month={month} attendanceData={attendanceData} />
            </div>
        </div>
    );
}
