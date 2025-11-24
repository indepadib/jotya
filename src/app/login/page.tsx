'use client';

import { login } from '@/app/actions/auth';
import styles from './login.module.css';
import Link from 'next/link';
import { useActionState } from 'react';

const initialState = {
    error: '',
};

export default function LoginPage() {
    // @ts-ignore - useActionState types are tricky with server actions sometimes
    const [state, formAction, isPending] = useActionState(login, initialState);

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Welcome Back</h1>
                <form action={formAction} className={styles.form}>
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
                        {isPending ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                <div className={styles.footer}>
                    Don't have an account?{' '}
                    <Link href="/signup" className={styles.link}>
                        Sign Up
                    </Link>
                </div>
            </div>
        </div>
    );
}
