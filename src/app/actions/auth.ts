'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

const SESSION_DURATION = 60 * 60 * 24 * 7; // 1 week

export async function signup(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    if (!email || !password || !name) {
        return { error: 'All fields are required' };
    }

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        return { error: 'User already exists' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
        },
    });

    // Create session
    const expires = new Date(Date.now() + SESSION_DURATION * 1000);
    (await cookies()).set('session', user.id, { expires, httpOnly: true });

    redirect('/');
}

export async function login(prevState: any, formData: FormData) {
    try {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (!email || !password) {
            return { error: 'All fields are required' };
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return { error: 'Invalid credentials' };
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return { error: 'Invalid credentials' };
        }

        // Create session
        const expires = new Date(Date.now() + SESSION_DURATION * 1000);
        (await cookies()).set('session', user.id, { expires, httpOnly: true });
    } catch (error: any) {
        console.error('Login error:', error);
        return { error: `Login failed: ${error.message}` };
    }

    redirect('/');
}

export async function logout() {
    (await cookies()).delete('session');
    redirect('/login');
}
