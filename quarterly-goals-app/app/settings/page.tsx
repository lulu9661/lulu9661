'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Navigation from '@/components/Navigation';

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

export default function SettingsPage() {
  const { state, updateSettings } = useApp();
  const [question1, setQuestion1] = useState(state.settings.reflectionQuestions.question1);
  const [question2, setQuestion2] = useState(state.settings.reflectionQuestions.question2);
  const [question3, setQuestion3] = useState(state.settings.reflectionQuestions.question3);
  const [reminderDay, setReminderDay] = useState(state.settings.reminderDay);
  const [reminderTime, setReminderTime] = useState(state.settings.reminderTime);
  const [phoneNumber, setPhoneNumber] = useState(state.settings.phoneNumber);
  const [twilioAccountSid, setTwilioAccountSid] = useState(state.settings.twilioAccountSid || '');
  const [twilioAuthToken, setTwilioAuthToken] = useState(state.settings.twilioAuthToken || '');
  const [twilioPhoneNumber, setTwilioPhoneNumber] = useState(state.settings.twilioPhoneNumber || '');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateSettings({
      reflectionQuestions: {
        question1,
        question2,
        question3
      },
      reminderDay,
      reminderTime,
      phoneNumber,
      twilioAccountSid: twilioAccountSid || undefined,
      twilioAuthToken: twilioAuthToken || undefined,
      twilioPhoneNumber: twilioPhoneNumber || undefined
    });

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-neutral-900 mb-2">
            Settings
          </h1>
          <p className="text-neutral-600 text-sm">
            Customize your reflection questions and reminder preferences
          </p>
        </div>

        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">✓ Settings saved successfully!</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Reflection Questions */}
          <div className="p-6 bg-white border border-neutral-200 rounded-lg">
            <h2 className="text-lg font-light text-neutral-900 mb-4">Reflection Questions</h2>
            <p className="text-sm text-neutral-600 mb-6">
              These questions will appear during your weekly check-ins
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-light text-neutral-700 mb-2">
                  Question 1
                </label>
                <input
                  type="text"
                  value={question1}
                  onChange={e => setQuestion1(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-md text-sm font-light focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-light text-neutral-700 mb-2">
                  Question 2
                </label>
                <input
                  type="text"
                  value={question2}
                  onChange={e => setQuestion2(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-md text-sm font-light focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-light text-neutral-700 mb-2">
                  Question 3
                </label>
                <input
                  type="text"
                  value={question3}
                  onChange={e => setQuestion3(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-md text-sm font-light focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Reminder Settings */}
          <div className="p-6 bg-white border border-neutral-200 rounded-lg">
            <h2 className="text-lg font-light text-neutral-900 mb-4">Reminder Schedule</h2>
            <p className="text-sm text-neutral-600 mb-6">
              Choose when you'd like to receive weekly reminders
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-light text-neutral-700 mb-2">
                  Day of Week
                </label>
                <select
                  value={reminderDay}
                  onChange={e => setReminderDay(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-md text-sm font-light focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                >
                  {DAYS_OF_WEEK.map((day, index) => (
                    <option key={day} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-light text-neutral-700 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={e => setReminderTime(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-md text-sm font-light focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* SMS Settings */}
          <div className="p-6 bg-white border border-neutral-200 rounded-lg">
            <h2 className="text-lg font-light text-neutral-900 mb-4">SMS Notifications</h2>
            <p className="text-sm text-neutral-600 mb-6">
              Configure Twilio to receive text message reminders
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-light text-neutral-700 mb-2">
                  Your Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  placeholder="6172512112"
                  className="w-full px-4 py-2 border border-neutral-200 rounded-md text-sm font-light focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                />
              </div>

              <div className="pt-4 border-t border-neutral-100">
                <p className="text-sm text-neutral-600 mb-4">
                  To enable SMS reminders, you'll need to set up a Twilio account and add your credentials below:
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-light text-neutral-700 mb-2">
                      Twilio Account SID
                    </label>
                    <input
                      type="text"
                      value={twilioAccountSid}
                      onChange={e => setTwilioAccountSid(e.target.value)}
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-4 py-2 border border-neutral-200 rounded-md text-sm font-light focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-light text-neutral-700 mb-2">
                      Twilio Auth Token
                    </label>
                    <input
                      type="password"
                      value={twilioAuthToken}
                      onChange={e => setTwilioAuthToken(e.target.value)}
                      placeholder="********************************"
                      className="w-full px-4 py-2 border border-neutral-200 rounded-md text-sm font-light focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-light text-neutral-700 mb-2">
                      Twilio Phone Number
                    </label>
                    <input
                      type="tel"
                      value={twilioPhoneNumber}
                      onChange={e => setTwilioPhoneNumber(e.target.value)}
                      placeholder="+15555555555"
                      className="w-full px-4 py-2 border border-neutral-200 rounded-md text-sm font-light focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mt-4 p-4 bg-neutral-50 border border-neutral-200 rounded-md">
                  <p className="text-xs text-neutral-600">
                    <strong>Note:</strong> This app stores Twilio credentials in your browser's local storage only.
                    To implement actual SMS functionality, you'll need to set up a backend API that securely handles Twilio requests.
                    See the README for implementation details.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-neutral-900 text-white text-sm font-light tracking-wide rounded-md hover:bg-neutral-800 transition-colors"
          >
            Save Settings
          </button>
        </form>
      </main>
    </div>
  );
}
