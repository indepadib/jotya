'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function updateProfile(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const avatar = formData.get('avatar') as string; // Base64 string

    if (!name || !email) {
        return { error: 'Name and email are required' };
    }

    try {
        // Check if email is taken by another user
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser && existingUser.id !== session) {
            return { error: 'Email is already in use' };
        }

        const data: any = { name, email };
        if (avatar) {
            data.image = avatar; // Assuming we add avatar field to User model or use existing field if any. 
            // Wait, User model might not have avatar field yet. Let's check schema.
        }

        // Let's check schema first before committing to this code completely.
        // But for now I'll write it assuming I might need to update schema or use a different field.
        // Actually, looking at previous file views, I didn't verify User model has avatar.
        // I'll assume it doesn't and I might need to add it or use a placeholder.
        // Let's check schema in next step. For now, I will comment out avatar update if field missing.

        await prisma.user.update({
            where: { id: session },
            data
        });

        revalidatePath('/profile');
        return { success: true };
    } catch (error) {
        console.error('Profile update error:', error);
        return { error: 'Failed to update profile' };
    }
}

export async function changePassword(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { error: 'All fields are required' };
    }

    if (newPassword !== confirmPassword) {
        return { error: 'New passwords do not match' };
    }

    if (newPassword.length < 6) {
        return { error: 'Password must be at least 6 characters' };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session }
        });

        if (!user) return { error: 'User not found' };

        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return { error: 'Incorrect current password' };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: session },
            data: { password: hashedPassword }
        });

        return { success: true };
    } catch (error) {
        console.error('Password change error:', error);
        return { error: 'Failed to change password' };
    }
}
