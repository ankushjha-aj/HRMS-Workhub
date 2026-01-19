'use server';

import { prisma } from '../../lib/prisma';
import { revalidatePath } from 'next/cache';

export type PunchStatus = 'NOT_PUNCHED' | 'PUNCHED_IN' | 'ON_BREAK' | 'PUNCHED_OUT';

export type AttendanceState = {
    status: PunchStatus;
    punchIn?: Date | null;
    punchOut?: Date | null;
    breakStartTime?: Date | null;
    breakType?: 'LUNCH' | 'TEA' | null;
    totalBreakSeconds: number;
    totalLunchSeconds: number;
    totalTeaSeconds: number;
    totalWorkSeconds: number;
    dbRecordId?: string;
};

// Helper: Get start of today (local time handled by client usually, but server needs consistency. 
// Ideally we rely on UTC or store a date string. For simplicity we'll use midnight UTC of the provided date or current server time if simple.)
// Best practice: Store 'YYYY-MM-DD' as the key.
// Helper: Get start of today or provided date
function getTodayDate(date: Date = new Date()) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

export async function getPunchStatus(userId: string, date?: Date): Promise<AttendanceState> {
    const targetDate = getTodayDate(date);
    const startOfDay = new Date(targetDate);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const record = await prisma.attendance.findFirst({
        where: {
            userId,
            date: { gte: startOfDay, lte: endOfDay }
        }
    });

    const baseState: AttendanceState = {
        status: 'NOT_PUNCHED',
        totalBreakSeconds: 0,
        totalLunchSeconds: 0,
        totalTeaSeconds: 0,
        totalWorkSeconds: 0
    };

    if (!record) return baseState;

    // Map DB record to State
    const state: AttendanceState = {
        ...baseState,
        punchIn: record.punchIn,
        punchOut: record.punchOut,
        breakStartTime: record.breakStartTime,
        breakType: record.breakType as 'LUNCH' | 'TEA' | null,
        totalBreakSeconds: record.totalBreakSeconds,
        totalLunchSeconds: record.totalLunchSeconds,
        totalTeaSeconds: record.totalTeaSeconds,
        totalWorkSeconds: record.totalWorkSeconds,
        dbRecordId: record.id
    };

    if (record.punchOut) {
        state.status = 'PUNCHED_OUT';
    } else if (record.breakStartTime) {
        state.status = 'ON_BREAK';
    } else if (record.punchIn) {
        state.status = 'PUNCHED_IN';
    }

    return state;
}

export async function performPunch(userId: string, action: 'IN' | 'OUT' | 'START_BREAK' | 'END_BREAK', date?: Date, breakType?: 'LUNCH' | 'TEA') {
    const targetDate = getTodayDate(date);
    const startOfDay = new Date(targetDate);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const makeTimestamp = (baseDate: Date) => {
        const now = new Date();
        const d = new Date(baseDate);
        d.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
        return d;
    };

    const timestamp = makeTimestamp(targetDate);

    // Fetch existing
    let record = await prisma.attendance.findFirst({
        where: {
            userId,
            date: { gte: startOfDay, lte: endOfDay }
        }
    });

    try {
        let finalRecord = null;

        if (action === 'IN') {
            if (record) return { error: 'Already punched in for this date.' };
            finalRecord = await prisma.attendance.create({
                data: {
                    userId,
                    date: startOfDay,
                    punchIn: timestamp,
                    status: 'PRESENT'
                }
            });
        }
        else {
            if (action === 'START_BREAK') {
                if (!record || record.punchOut) return { error: 'Cannot start break.' };
                if (record.breakStartTime) return { error: 'Already on break.' };
                if (!breakType) return { error: 'Break type required.' };

                // New Requirement: Check if break type already taken?
                // User said: "if I have ended the lunch break, my lunch break needs to be blocked for that day"
                if (breakType === 'LUNCH' && record.totalLunchSeconds > 0) return { error: 'Lunch break already taken.' };
                if (breakType === 'TEA' && record.totalTeaSeconds > 0) return { error: 'Tea break already taken.' };

                finalRecord = await prisma.attendance.update({
                    where: { id: record.id },
                    data: {
                        breakStartTime: timestamp,
                        breakType: breakType
                    }
                });
            }
            else if (action === 'END_BREAK') {
                if (!record || !record.breakStartTime) return { error: 'Not on break.' };

                const breakStart = new Date(record.breakStartTime);
                const breakDurationMs = timestamp.getTime() - breakStart.getTime();
                const breakDurationSeconds = Math.floor(breakDurationMs / 1000);

                // Determine which accumulator to update
                const currentType = record.breakType;
                const updateData: any = {
                    breakStartTime: null,
                    breakType: null,
                    totalBreakSeconds: { increment: Math.max(0, breakDurationSeconds) }
                };

                if (currentType === 'LUNCH') {
                    updateData.totalLunchSeconds = { increment: Math.max(0, breakDurationSeconds) };
                } else if (currentType === 'TEA') {
                    updateData.totalTeaSeconds = { increment: Math.max(0, breakDurationSeconds) };
                }

                finalRecord = await prisma.attendance.update({
                    where: { id: record.id },
                    data: updateData
                });
            }
            else if (action === 'OUT') {
                if (!record || record.punchOut) return { error: 'Cannot punch out.' };

                // Calc Break if open
                let additionalBreak = 0;
                let additionalLunch = 0;
                let additionalTea = 0;

                if (record.breakStartTime) {
                    const breakStart = new Date(record.breakStartTime);
                    additionalBreak = Math.floor((timestamp.getTime() - breakStart.getTime()) / 1000);

                    if (record.breakType === 'LUNCH') additionalLunch = additionalBreak;
                    if (record.breakType === 'TEA') additionalTea = additionalBreak;
                }

                const totalBreak = record.totalBreakSeconds + additionalBreak;

                // Calc Work - Calculate total duration in seconds (including breaks)
                const punchInTime = new Date(record.punchIn!);
                const totalDurationMs = timestamp.getTime() - punchInTime.getTime();
                const totalDurationSeconds = Math.floor(totalDurationMs / 1000);
                const totalWorkSeconds = totalDurationSeconds; // Include breaks in work time

                // Status (based on hours including breaks)
                const hours = totalWorkSeconds / 3600;
                let status = 'ABSENT';
                if (hours >= 6.5) status = 'PRESENT';
                else if (hours >= 4.5) status = 'HALF_DAY';
                else if (totalWorkSeconds > 0) status = 'SHORT_DAY';

                finalRecord = await prisma.attendance.update({
                    where: { id: record.id },
                    data: {
                        punchOut: timestamp,
                        breakStartTime: null,
                        breakType: null,
                        totalBreakSeconds: totalBreak,
                        totalLunchSeconds: { increment: additionalLunch },
                        totalTeaSeconds: { increment: additionalTea },
                        totalWorkSeconds: Math.max(0, totalWorkSeconds),
                        status
                    }
                });
            }
        }


        // Construct Return State
        const baseStateReturn: AttendanceState = {
            status: 'NOT_PUNCHED',
            totalBreakSeconds: 0,
            totalLunchSeconds: 0,
            totalTeaSeconds: 0,
            totalWorkSeconds: 0
        };

        revalidatePath('/employee-dashboard');

        if (finalRecord) {
            const common = {
                totalBreakSeconds: finalRecord.totalBreakSeconds,
                totalLunchSeconds: finalRecord.totalLunchSeconds,
                totalTeaSeconds: finalRecord.totalTeaSeconds,
                totalWorkSeconds: finalRecord.totalWorkSeconds,
                dbRecordId: finalRecord.id,
                breakType: finalRecord.breakType as 'LUNCH' | 'TEA' | null
            };

            if (finalRecord.punchOut) return { success: true, updatedState: { ...common, status: 'PUNCHED_OUT' as const, punchIn: finalRecord.punchIn, punchOut: finalRecord.punchOut } };
            else if (finalRecord.breakStartTime) return { success: true, updatedState: { ...common, status: 'ON_BREAK' as const, punchIn: finalRecord.punchIn, breakStartTime: finalRecord.breakStartTime, totalWorkSeconds: 0 } };
            else return { success: true, updatedState: { ...common, status: 'PUNCHED_IN' as const, punchIn: finalRecord.punchIn, totalWorkSeconds: 0 } };
        }

        return { success: true, updatedState: baseStateReturn };

    } catch (e) {
        console.error("Punch Error", e);
        return { error: 'Failed to update attendance.' };
    }
}

export async function getMonthlyAttendance(userId: string, year: number, month: number) {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0); // Last day of month

    const records = await prisma.attendance.findMany({
        where: {
            userId,
            date: {
                gte: startDate,
                lte: endDate
            }
        },
        orderBy: { date: 'asc' }
    });

    return records;
}
