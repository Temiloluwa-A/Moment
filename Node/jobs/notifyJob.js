const Timer = require('../model/timer.model');
const User = require('../model/user.model');
const sendEmail = require('../utils/sendEmail');

const clientUrl = () => process.env.CLIENT_URL || 'http://localhost:5173';

const emailShell = (heading, bodyHtml, momentUrl, ctaLabel) => `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #2E241A;">
        <h2 style="font-style: italic; color: #A9631E;">Moment</h2>
        <h3 style="color: #2E241A;">${heading}</h3>
        ${bodyHtml}
        <p style="text-align: center; margin: 32px 0;">
            <a href="${momentUrl}" style="background: #A9631E; color: #F7EFE0; padding: 12px 28px; border-radius: 999px; text-decoration: none; font-weight: bold;">${ctaLabel}</a>
        </p>
    </div>
`;

const sendReminderEmail = async (owner, moment) => {
    const momentUrl = `${clientUrl()}/moment/${moment.slug}`;
    const html = emailShell(
        '24 hours left',
        `<p>Hi ${owner.fullName || 'there'},</p><p>Your countdown "<strong>${moment.title || 'Untitled moment'}</strong>" ends in about a day.</p>`,
        momentUrl,
        'View your moment'
    );
    await sendEmail({ to: owner.email, subject: `24 hours left on "${moment.title || 'your moment'}"`, html });
};

const sendCompletionEmail = async (owner, moment) => {
    const momentUrl = `${clientUrl()}/moment/${moment.slug}`;
    const html = emailShell(
        'Your countdown has ended',
        `<p>Hi ${owner.fullName || 'there'},</p><p>"<strong>${moment.title || 'Untitled moment'}</strong>" just reached zero.</p>`,
        momentUrl,
        'View your moment'
    );
    await sendEmail({ to: owner.email, subject: `"${moment.title || 'Your moment'}" has ended`, html });
};

// Sends the two time-based notifications (24h-left reminder, completion) for
// every eligible countdown, then marks each as sent so it never fires twice.
// Exported as a plain function — called by the cron schedule in production,
// callable directly (and repeatably, to check idempotency) elsewhere.
const runNotificationSweep = async () => {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const dueForReminder = await Timer.find({
        mode: 'countdown',
        notify: true,
        ownerDeleted: { $ne: true },
        reminderSentAt: null,
        endAt: { $gt: now, $lte: in24h },
    }).populate('userId', 'fullName email');

    let remindersSent = 0;
    for (const moment of dueForReminder) {
        const owner = moment.userId;
        if (!owner?.email) continue;
        try {
            await sendReminderEmail(owner, moment);
            moment.reminderSentAt = now;
            await moment.save();
            remindersSent += 1;
        } catch (err) {
            console.error(`Failed to send reminder email for moment ${moment._id}:`, err.message);
        }
    }

    const dueForCompletion = await Timer.find({
        mode: 'countdown',
        notify: true,
        ownerDeleted: { $ne: true },
        completionNotifiedAt: null,
        endAt: { $lte: now },
    }).populate('userId', 'fullName email');

    let completionsSent = 0;
    for (const moment of dueForCompletion) {
        const owner = moment.userId;
        if (!owner?.email) continue;
        try {
            await sendCompletionEmail(owner, moment);
            moment.completionNotifiedAt = now;
            await moment.save();
            completionsSent += 1;
        } catch (err) {
            console.error(`Failed to send completion email for moment ${moment._id}:`, err.message);
        }
    }

    return { remindersSent, completionsSent };
};

module.exports = { runNotificationSweep };
