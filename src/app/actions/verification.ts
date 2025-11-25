'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { checkAndUpdateTopRatedStatus } from '@/lib/badgeCalculator';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

// Email Verification
export async function sendEmailVerification() {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const user = await prisma.user.findUnique({
        where: { id: session },
        select: { email: true, emailVerified: true }
    });

    if (!user) return { error: 'User not found' };
    if (user.emailVerified) return { error: 'Email already verified' };

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Delete old tokens
    await prisma.verificationToken.deleteMany({
        where: { userId: session, type: 'EMAIL' }
    });

    // Create new token
    await prisma.verificationToken.create({
        data: {
            userId: session,
            type: 'EMAIL',
            token,
            expiresAt
        }
    });

    // Send verification email
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email/${token}`;

    await resend.emails.send({
        from: 'Jotya <notifications@jotya.com>',
        to: user.email,
        subject: 'Verify your email address',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #c4785a;">Verify Your Email</h2>
                <p>Click the button below to verify your email address:</p>
                <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background: #c4785a; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
                    Verify Email
                </a>
                <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
                <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
            </div>
        `
    });

    return { success: true };
}

export async function verifyEmail(token: string) {
    const verificationToken = await prisma.verificationToken.findUnique({
        where: { token },
        include: { user: true }
    });

    if (!verificationToken) return { error: 'Invalid token' };
    if (verificationToken.type !== 'EMAIL') return { error: 'Invalid token type' };
    if (new Date() > verificationToken.expiresAt) return { error: 'Token expired' };

    // Update user
    await prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerified: true }
    });

    // Delete token
    await prisma.verificationToken.delete({
        where: { id: verificationToken.id }
    });

    return { success: true, email: verificationToken.user.email };
}

// Phone Verification
export async function sendPhoneCode(phone: string) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const token = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete old tokens
    await prisma.verificationToken.deleteMany({
        where: { userId: session, type: 'PHONE' }
    });

    // Create new token
    await prisma.verificationToken.create({
        data: {
            userId: session,
            type: 'PHONE',
            token,
            code,
            expiresAt
        }
    });

    // Send SMS
    const { sendSMS } = await import('@/lib/sms');
    const smsResult = await sendSMS(phone, `Your Jotya verification code is: ${code}`);

    if (smsResult.error) {
        return { error: 'Failed to send SMS' };
    }

    return { success: true, token };
}

export async function verifyPhoneCode(token: string, code: string) {
    const verificationToken = await prisma.verificationToken.findUnique({
        where: { token }
    });

    if (!verificationToken) return { error: 'Invalid token' };
    if (verificationToken.type !== 'PHONE') return { error: 'Invalid token type' };
    if (new Date() > verificationToken.expiresAt) return { error: 'Code expired' };
    if (verificationToken.code !== code) return { error: 'Invalid code' };

    // Update user
    await prisma.user.update({
        where: { id: verificationToken.userId },
        data: { phoneVerified: true }
    });

    // Delete token
    await prisma.verificationToken.delete({
        where: { id: verificationToken.id }
    });

    return { success: true };
}
