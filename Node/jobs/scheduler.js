const cron = require('node-cron');
const { runNotificationSweep } = require('./notifyJob');

// Starts the recurring sweep for the 24h-reminder and completion emails.
// Called once, from index.js, after the DB connection is established —
// never imported anywhere that shouldn't trigger a live schedule.
const startNotificationScheduler = () => {
    cron.schedule('*/15 * * * *', async () => {
        try {
            const { remindersSent, completionsSent } = await runNotificationSweep();
            if (remindersSent || completionsSent) {
                console.log(`Notification sweep: ${remindersSent} reminder(s), ${completionsSent} completion(s) sent.`);
            }
        } catch (err) {
            console.error('Notification sweep failed:', err.message);
        }
    });
    console.log('Notification scheduler started (every 15 minutes).');
};

module.exports = startNotificationScheduler;
