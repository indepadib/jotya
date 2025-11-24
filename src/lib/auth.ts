import { cookies } from 'next/headers';

export async function getSession() {
    const session = (await cookies()).get('session')?.value;
    return session || null;
}
