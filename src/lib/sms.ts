import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export async function sendSMS(to: string, message: string) {
    try {
        await client.messages.create({
            body: message,
            from: twilioPhone,
            to: to
        });
        return { success: true };
    } catch (error) {
        console.error('SMS send error:', error);
        return { error: 'Failed to send SMS' };
    }
}
