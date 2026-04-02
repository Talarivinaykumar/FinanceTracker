import notifee, { TriggerType, RepeatFrequency, TimestampTrigger } from '@notifee/react-native';

class NotificationService {
  public async requestPermission() {
    await notifee.requestPermission();
  }

  public async scheduleDailyReminder() {
    await this.requestPermission();
    
    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'finance-reminders',
      name: 'Daily Financial Reminders',
    });

    // We'll set the alarm to tomorrow morning at 9am as a baseline, 
    // or just 24 hours from current time for simplicity.
    const date = new Date(Date.now());
    date.setDate(date.getDate() + 1);
    date.setHours(20); // 8 PM
    date.setMinutes(0);
    date.setSeconds(0);

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
      repeatFrequency: RepeatFrequency.DAILY,
    };

    await notifee.createTriggerNotification(
      {
        id: 'daily-reminder',
        title: 'Daily Check-in 💸',
        body: "Take a second to log your latest expenses and track your budget today!",
        android: {
          channelId,
          pressAction: {
            id: 'default',
          },
        },
      },
      trigger
    );
  }

  public async cancelAllReminders() {
    await notifee.cancelTriggerNotification('daily-reminder');
  }
}

export default new NotificationService();
