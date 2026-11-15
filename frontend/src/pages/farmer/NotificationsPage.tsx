import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { NotificationItem } from '../../types';
import { Bell, AlertTriangle, Info, CheckCircle2, Clock } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-tamil">
          {t('notificationsPage.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-tamil">
          {t('notificationsPage.subtitle')}
        </p>
      </div>

      <div className="space-y-3">
        {notifications.map((notif) => {
          const title = isTamil ? (notif.title_ta || notif.title_en) : (notif.title_en || notif.title_ta);
          const message = isTamil ? (notif.message_ta || notif.message_en) : (notif.message_en || notif.message_ta);
          return (
            <div
              key={notif.id}
              className={`p-4 rounded-2xl border transition flex items-start gap-3.5 ${
                notif.severity === 'warning'
                  ? 'bg-amber-50/70 border-amber-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                notif.severity === 'warning'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {notif.severity === 'warning' ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 font-tamil">{title}</h4>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-tamil">
                    <Clock className="w-3 h-3" />
                    {notif.observation_date || t('notificationsPage.today')}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-tamil leading-relaxed">{message}</p>
                <div className="text-[10px] text-slate-400 pt-1 font-tamil">
                  {t('notificationsPage.source')} {notif.data_source_id ? notif.data_source_id.toUpperCase() : 'NILAM PESUM'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

