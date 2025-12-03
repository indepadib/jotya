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
