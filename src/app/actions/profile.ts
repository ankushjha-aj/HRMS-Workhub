'use server';

import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { revalidatePath } from 'next/cache';

// Helper to sanitize dates for Prisma (convert string -> Date or null)
const safeDate = (dateStr: any) => (dateStr ? new Date(dateStr) : null);

export async function getProfile(userId: string) {
    if (!userId) return null;

    try {
        const profile = await prisma.employeeProfile.findUnique({
            where: { userId },
            include: {
                workExperiences: true,
                educations: true,
                certifications: true
            }
        });
        return profile;
    } catch (error) {
        console.error("Error fetching profile:", error);
        return null; // Return null gracefully
    }
}

export async function updateProfile(userId: string, data: any) {
    if (!userId) {
        return { success: false, error: "User ID is required" };
    }

    try {
        const {
            name, // User fields
            email, // User fields

            // Profile Fields
            designation,
            department,
            phoneNumber,
            alternatePhone,
            alternateEmail,
            address,
            pincode,
            mapLocation,
            joiningDate,
            dateOfBirth,
            profileImage,

            // Guardian
            guardianName,
            guardianDesignation,
            guardianPhone,
            guardianEmail,

            // Relations (arrays)
            workExperiences,
            educations,
            certifications
        } = data;

        // 1. Transaction to update User and Upsert Profile + Relations
        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // A. Update User Basic Info (Name/Email)
            await tx.user.update({
                where: { id: userId },
                data: { name, email: email?.endsWith('@opsbeetech.com') ? email : `${email}@opsbeetech.com` } // Ensure email format if changed
            });

            // B. Upsert Employee Profile
            await tx.employeeProfile.upsert({
                where: { userId },
                create: {
                    userId,
                    designation,
                    department,
                    phoneNumber,
                    alternatePhone,
                    alternateEmail,
                    address,
                    pincode,
                    mapLocation,
                    joiningDate: safeDate(joiningDate),
                    dateOfBirth: safeDate(dateOfBirth),
                    profileImage,
                    guardianName,
                    guardianDesignation,
                    guardianPhone,
                    guardianEmail,

                    // Create Relations
                    workExperiences: {
                        create: workExperiences?.map((w: any) => ({
                            company: w.company,
                            role: w.role,
                            description: w.description,
                            startDate: safeDate(w.startDate),
                            endDate: safeDate(w.endDate)
                        }))
                    },
                    educations: {
                        create: educations?.map((e: any) => ({
                            level: e.level,
                            institution: e.institution,
                            year: e.year,
                            score: e.score
                        }))
                    },
                    certifications: {
                        create: certifications?.map((c: any) => ({
                            name: c.name,
                            issuer: c.issuer,
                            date: safeDate(c.date)
                        }))
                    }
                },
                update: {
                    designation,
                    department,
                    phoneNumber,
                    alternatePhone,
                    alternateEmail,
                    address,
                    pincode,
                    mapLocation,
                    joiningDate: safeDate(joiningDate),
                    dateOfBirth: safeDate(dateOfBirth),
                    profileImage,
                    guardianName,
                    guardianDesignation,
                    guardianPhone,
                    guardianEmail,

                    // Update Relations: Strategy -> Delete All & Re-create (Simplest for this use case)
                    workExperiences: {
                        deleteMany: {},
                        create: workExperiences?.map((w: any) => ({
                            company: w.company,
                            role: w.role,
                            description: w.description,
                            startDate: safeDate(w.startDate),
                            endDate: safeDate(w.endDate)
                        }))
                    },
                    educations: {
                        deleteMany: {},
                        create: educations?.map((e: any) => ({
                            level: e.level,
                            institution: e.institution,
                            year: e.year,
                            score: e.score
                        }))
                    },
                    certifications: {
                        deleteMany: {},
                        create: certifications?.map((c: any) => ({
                            name: c.name,
                            issuer: c.issuer,
                            date: safeDate(c.date)
                        }))
                    }
                }
            });
        }, { maxWait: 5000, timeout: 20000 });

        revalidatePath('/employee-dashboard/profile');
        return { success: true };
    } catch (error) {
        console.error("Error updating profile:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to update profile" };
    }
}
