'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

export type LoginState = {
    error?: string;
    success?: boolean;
    redirectUrl?: string;
    resetRequired?: boolean;
    userId?: string;
    tempPassword?: string;
};

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
    const emailPrefix = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!emailPrefix || !password) {
        return { error: 'Please enter both email and password.' };
    }

    const email = emailPrefix.includes('@') ? emailPrefix : `${emailPrefix}@opsbeetech.com`;

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return { error: 'Invalid credentials.' };
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (!passwordsMatch) {
            return { error: 'Invalid credentials.' };
        }

        // Check if user needs to reset password (first login)
        if (user.mustChangePassword && user.role === 'employee') {
            return {
                success: false,
                resetRequired: true,
                userId: user.id,
                // We don't send the password back for security, user just knows it
            };
        }

        // Set a simple session cookie
        const cookieStore = await cookies();
        cookieStore.set('session', JSON.stringify({ id: user.id, role: user.role }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24 // 24 hours
        });

        // Determine redirect path based on role
        if (user.role === 'admin') {
            return { success: true, redirectUrl: '/admin' };
        } else {
            return { success: true, redirectUrl: '/employee-dashboard' };
        }

    } catch (err) {
        console.error('Login error:', err);
        return { error: 'Something went wrong. Please try again.' };
    }
}

export async function completeFirstLogin(userId: string, formData: FormData): Promise<{ success?: boolean, error?: string }> {
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!newPassword || newPassword.length < 6) {
        return { error: 'Password must be at least 6 characters.' };
    }

    if (newPassword !== confirmPassword) {
        return { error: 'Passwords do not match.' };
    }

    try {
        // Fetch user to check current password
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return { error: 'User not found.' };

        // Check if new password is same as current
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return { error: 'New password cannot be the same as your current password.' };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                mustChangePassword: false
            }
        });

        return { success: true };
    } catch (error) {
        console.error('First login reset error:', error);
        return { error: 'Failed to reset password.' };
    }
}





export async function changePassword(formData: FormData): Promise<{ success?: boolean; error?: string }> {
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { error: 'All fields are required.' };
    }

    if (newPassword.length < 6) {
        return { error: 'New password must be at least 6 characters.' };
    }

    if (newPassword !== confirmPassword) {
        return { error: 'New passwords do not match.' };
    }

    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('session');

        if (!sessionCookie) {
            return { error: 'Unauthorized.' };
        }

        const session = JSON.parse(sessionCookie.value);
        const userId = session.id;

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            return { error: 'User not found.' };
        }

        // Verify current password
        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordCorrect) {
            return { error: 'Incorrect current password.' };
        }

        // Prevent reusing the same password
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return { error: 'New password cannot be the same as the current password.' };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        return { success: true };
    } catch (error) {
        console.error('Change password error:', error);
        return { error: 'Failed to update password. Please try again.' };
    }
}
