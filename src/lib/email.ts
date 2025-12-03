import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
    to,
    subject,
    html,
}: {
    to: string;
    subject: string;
    html: string;
}) {
    try {
        const data = await resend.emails.send({
            from: 'Jotya <noreply@jotya.com>', // Update with verified domain if available
            to,
            subject,
            html,
        });
        return { success: true, data };
    } catch (error) {
        console.error('Failed to send email:', error);
        return { success: false, error };
    }
}

export const EMAIL_TEMPLATES = {
    LABEL_GENERATED: (buyerName: string, trackingNumber: string, trackingUrl: string) => `
        <h1>Order Shipped!</h1>
        <p>Hi ${buyerName},</p>
        <p>Good news! Your order has been shipped.</p>
        <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
        <p>You can track your package here: <a href="${trackingUrl}">Track Package</a></p>
        <br/>
        <p>Thanks,<br/>The Jotya Team</p>
    `,
    OUT_FOR_DELIVERY: (buyerName: string, trackingNumber: string) => `
        <h1>Out for Delivery</h1>
        <p>Hi ${buyerName},</p>
        <p>Your package (${trackingNumber}) is out for delivery today!</p>
        <p>Please be ready to receive it.</p>
    `,
    DELIVERED_BUYER: (buyerName: string, trackingNumber: string) => `
        <h1>Package Delivered</h1>
        <p>Hi ${buyerName},</p>
        <p>Your package (${trackingNumber}) has been delivered.</p>
        <p>If you have any issues, please report them within 48 hours.</p>
    `,
    DELIVERED_SELLER: (sellerName: string, amount: number) => `
        <h1>Funds Released!</h1>
        <p>Hi ${sellerName},</p>
        <p>Your package has been delivered and <strong>${amount} MAD</strong> has been added to your wallet.</p>
        <p>Keep up the great work!</p>
    `
};

export async function sendMessageNotification(
    recipientEmail: string,
    senderName: string,
    messagePreview: string
) {
    return sendEmail({
        to: recipientEmail,
        subject: `New message from ${senderName} on Jotya`,
        html: `
            <h1>You have a new message</h1>
            <p>Hi,</p>
            <p><strong>${senderName}</strong> sent you a message:</p>
            <blockquote style="border-left: 3px solid #0ea5e9; padding-left: 16px; margin: 16px 0; color: #666;">
                ${messagePreview}${messagePreview.length >= 100 ? '...' : ''}
            </blockquote>
            <p><a href="https://jotya.com/inbox" style="display: inline-block; padding: 12px 24px; background: #0ea5e9; color: white; text-decoration: none; border-radius: 8px;">View Message</a></p>
            <br/>
            <p>Thanks,<br/>The Jotya Team</p>
        `
    });
}

export async function sendOfferNotification(
    sellerEmail: string,
    buyerName: string,
    offerAmount: number,
    itemTitle: string
) {
    return sendEmail({
        to: sellerEmail,
        subject: `New offer on your item: ${itemTitle}`,
        html: `
            <h1>You received a new offer!</h1>
            <p>Hi,</p>
            <p><strong>${buyerName}</strong> made an offer on your item:</p>
            <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="margin: 0; font-weight: 600;">${itemTitle}</p>
                <p style="margin: 8px 0 0 0; font-size: 24px; color: #0ea5e9; font-weight: 700;">${offerAmount} MAD</p>
            </div>
            <p>You can accept or decline this offer in your messages.</p>
            <p><a href="https://jotya.com/inbox" style="display: inline-block; padding: 12px 24px; background: #0ea5e9; color: white; text-decoration: none; border-radius: 8px;">View Offer</a></p>
            <br/>
            <p>Thanks,<br/>The Jotya Team</p>
        `
    });
}

export async function sendOfferResponseNotification(
    buyerEmail: string,
    status: 'ACCEPTED' | 'REJECTED',
    itemTitle: string
) {
    const isAccepted = status === 'ACCEPTED';
    return sendEmail({
        to: buyerEmail,
        subject: `Your offer was ${isAccepted ? 'accepted' : 'declined'}: ${itemTitle}`,
        html: `
            <h1>Offer ${isAccepted ? 'Accepted' : 'Declined'}</h1>
            <p>Hi,</p>
            <p>Your offer on <strong>${itemTitle}</strong> has been <strong>${isAccepted ? 'accepted' : 'declined'}</strong>.</p>
            ${isAccepted ? `
                <p style="background: #dcfce7; padding: 16px; border-radius: 8px; color: #166534; margin: 16px 0;">
                    🎉 Great news! The seller accepted your offer. You can now proceed to checkout.
                </p>
                <p><a href="https://jotya.com/inbox" style="display: inline-block; padding: 12px 24px; background: #22c55e; color: white; text-decoration: none; border-radius: 8px;">Go to Messages</a></p>
            ` : `
                <p style="background: #fef3c7; padding: 16px; border-radius: 8px; color: #92400e; margin: 16px 0;">
                    The seller has declined your offer. You can try making a different offer or browse other items.
                </p>
            `}
            <br/>
            <p>Thanks,<br/>The Jotya Team</p>
        `
    });
}
