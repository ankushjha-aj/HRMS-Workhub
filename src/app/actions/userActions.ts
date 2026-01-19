'use server'

import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { prisma } from '../../lib/prisma'
import { revalidatePath } from 'next/cache'

export async function addUser(prevState: any, formData: FormData) {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')

    if (!session) {
        return { error: 'Unauthorized' }
    }

    const sessionData = JSON.parse(session.value)
    if (sessionData.role !== 'admin') {
        return { error: 'Access denied. Admins only.' }
    }

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as string || 'employee'

    if (!name || !email || !password) {
        return { error: 'Missing required fields' }
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                mustChangePassword: true
            }
        })
        revalidatePath('/admin')
        revalidatePath('/admin/employees')
        return { success: true, message: 'User created successfully' }
    } catch (error) {
        console.error('Add User Error:', error)
        return { error: 'Failed to create user. Email might already exist.' }

    }
}

export async function deleteUser(userId: string) {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')

    if (!session) return { error: 'Unauthorized' }

    const sessionData = JSON.parse(session.value)
    if (sessionData.role !== 'admin') {
        return { error: 'Access denied. Admins only.' }
    }

    try {
        await prisma.user.delete({
            where: { id: userId }
        })
        revalidatePath('/admin')
        revalidatePath('/admin/employees')
        return { success: true, message: 'User deleted successfully' }
    } catch (error) {
        console.error('Delete User Error:', error)
        return { error: 'Failed to delete user' }
    }
}

export async function updateUser(userId: string, formData: FormData) {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')

    if (!session) return { error: 'Unauthorized' }

    const sessionData = JSON.parse(session.value)
    if (sessionData.role !== 'admin') {
        return { error: 'Access denied. Admins only.' }
    }

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const role = formData.get('role') as string

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { name, email, role }
        })
        revalidatePath('/admin')
        revalidatePath('/admin/employees')
        return { success: true, message: 'User updated successfully' }
    } catch (error) {
        console.error('Update User Error:', error)
        return { error: 'Failed to update user' }
    }
}

export async function resetPassword(userId: string, formData: FormData) {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')

    if (!session) return { error: 'Unauthorized' }

    const sessionData = JSON.parse(session.value)
    if (sessionData.role !== 'admin') {
        return { error: 'Access denied. Admins only.' }
    }

    const password = formData.get('password') as string

    if (!password || password.length < 6) {
        return { error: 'Password must be at least 6 characters' }
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        })
        revalidatePath('/admin')
        return { success: true, message: 'Password reset successfully' }
    } catch (error) {
        console.error('Reset Password Error:', error)
        return { error: 'Failed to reset password' }
    }
}
