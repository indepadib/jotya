import { Resend } from 'resend';

export async function sendMessageNotification(
    toEmail: string,
    fromName: string,
    messagePreview: string
) {
    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
            from: 'Jotya <notifications@jotya.com>',
            to: toEmail,
            subject: `New message from ${fromName}`,
            html: `
                <h2>You have a new message on Jotya</h2>
                <p><strong>${fromName}</strong> sent you a message:</p>
                <blockquote style="padding: 10px; background: #f5f5f5; border-left: 3px solid #007bff;">
                    ${messagePreview}
                </blockquote>
                <p><a href="https://jotya.netlify.app/inbox" style="color: #007bff;">View in Jotya</a></p>
            `
        });
    } catch (error) {
        console.error('Failed to send message notification:', error);
    }
}

export async function sendOfferNotification(
    toEmail: string,
    fromName: string,
    amount: number,
    itemTitle: string
) {
    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
            from: 'Jotya <notifications@jotya.com>',
            to: toEmail,
            subject: `New offer for ${itemTitle}`,
            html: `
                <h2>You received a new offer!</h2>
                <p><strong>${fromName}</strong> made an offer on your item:</p>
                <p style="font-size: 18px;"><strong>${itemTitle}</strong></p>
                <p style="font-size: 24px; color: #28a745;"><strong>${amount} MAD</strong></p>
                <p><a href="https://jotya.netlify.app/inbox" style="color: #007bff;">View Offer</a></p>
            `
        });
    } catch (error) {
        console.error('Failed to send offer notification:', error);
    }
}

export async function sendOfferResponseNotification(
    toEmail: string,
    status: 'ACCEPTED' | 'REJECTED',
    itemTitle: string
) {
    const statusText = status === 'ACCEPTED' ? 'accepted' : 'declined';
    const color = status === 'ACCEPTED' ? '#28a745' : '#dc3545';

    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
            from: 'Jotya <notifications@jotya.com>',
            to: toEmail,
            subject: `Offer ${statusText} for ${itemTitle}`,
            html: `
                <h2>Offer ${statusText}</h2>
                <p>Your offer for <strong>${itemTitle}</strong> has been <span style="color: ${color}; font-weight: bold;">${statusText}</span>.</p>
                ${status === 'ACCEPTED' ? '<p><a href="https://jotya.netlify.app/inbox" style="color: #007bff;">Continue to checkout</a></p>' : ''}
            `
        });
    } catch (error) {
        console.error('Failed to send offer response notification:', error);
    }
}
