'use client';

import { signup } from '@/app/actions/auth';
import styles from './signup.module.css';
import Link from 'next/link';
import { useActionState } from 'react';

const initialState = {
    error: '',
};

export default function SignupPage() {
    // @ts-ignore
    const [state, formAction, isPending] = useActionState(signup, initialState);

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Join Jotya</h1>
                <form action={formAction} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="name" className={styles.label}>Full Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            className={styles.input}
                            placeholder="John Doe"
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            className={styles.input}
                            placeholder="you@example.com"
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            className={styles.input}
                            placeholder="••••••••"
                        />
                    </div>

                    {state?.error && (
                        <p style={{ color: 'red', fontSize: '0.875rem' }}>{state.error}</p>
                    )}

                    <button
                        type="submit"
                        className={`btn btn-primary ${styles.submitButton}`}
                        disabled={isPending}
                    >
                        {isPending ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className={styles.footer}>
                    Already have an account?{' '}
                    <Link href="/login" className={styles.link}>
                        Log In
                    </Link>
                </div>
            </div>
        </div>
    );
}
