import { getWallet, getTransactions } from '@/app/actions/transaction';
import WalletView from './WalletView';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function WalletPage() {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    const wallet = await getWallet();
    const transactions = await getTransactions();

    // Default empty wallet if null
    const safeWallet = wallet || { balance: 0, pending: 0 };

    return <WalletView wallet={safeWallet} transactions={transactions} currentUserId={session} />;
}
