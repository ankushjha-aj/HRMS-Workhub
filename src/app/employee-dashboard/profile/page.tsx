import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '../../../lib/prisma'; // Adjusted path
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
        redirect('/');
    }

    let user;
    let userProfile = null;

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
                role: true
            }
        });

        if (user) {
            userProfile = await prisma.employeeProfile.findUnique({
                where: { userId: user.id },
                include: {
                    workExperiences: true,
                    educations: true,
                    certifications: true
                }
            });
        }

    } catch (error) {
        console.error("Session parse error", error);
        redirect('/');
    }

    if (!user) {
        redirect('/');
    }

    return <ProfileClient user={user} initialProfile={userProfile} />;
};
