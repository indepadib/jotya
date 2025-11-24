import Link from 'next/link';

export default async function BuyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>Checkout</h1>
            <p>Buying Item ID: {id}</p>
            <p>Payment integration coming in Phase III.</p>
            <Link href="/" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                Back to Home
            </Link>
        </div>
    );
}
