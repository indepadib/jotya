import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import SellForm from './SellForm';

export default async function SellPage() {
    const session = (await cookies()).get('session');

    if (!session || !session.value) {
        redirect('/login');
    }

    return <SellForm />;
}
