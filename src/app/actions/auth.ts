'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sendEmailVerification } from './verification';
import bcrypt from 'bcryptjs';

const SESSION_DURATION = 60 * 60 * 24 * 7; // 1 week

export async function signup(prevState: any, formData: FormData) {
    try {
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (!name || !email || !password) {
            return { error: 'All fields are required' };
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return { error: 'User already exists' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                wallet: {
                    create: {
                        balance: 0,
                        pending: 0
                    }
                }
            },
        });

        const cookieStore = await cookies();
        cookieStore.set('session', user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        // Send verification email
        try {
            await sendEmailVerification();
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            // Continue even if email fails, or maybe warn user
        }

        return { success: true };
    } catch (error) {
        console.error('Signup error:', error);
        return { error: 'Failed to create account' };
    }
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
