import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { expenseAPI } from '../services/api';
import WeeklyChallenges from './WeeklyChallenges';

export default function Navbar({ theme, toggleTheme }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showChallenges, setShowChallenges] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(0);
  const [points, setPoints] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotificationList, setShowNotificationList] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!user) return;
    setBudget(user.budget || 0);
    const storedPoints = Number(localStorage.getItem(`userPoints_${user.id}`) || 0);
    setPoints(storedPoints);
    if (user.isDummy) {
      // For dummy users, load expenses from localStorage if any
      const stored = localStorage.getItem('dummyExpenses');
      setExpenses(stored ? JSON.parse(stored) : []);
    } else {
      expenseAPI.getAll().then(data => setExpenses(data.expenses || [])).catch(() => setExpenses([]));
    }
  }, [user]);

  useEffect(() => {
    const stored = localStorage.getItem('expenseNotifications');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure all notifications have a 'read' property
      const withRead = parsed.map(n => ({ ...n, read: n.read !== undefined ? n.read : true }));
      setNotifications(withRead);
    }

    const handler = (event) => {
      const { message } = event.detail || {};
      if (!message) return;

      const newEntry = { message, timestamp: Date.now(), read: false };
      setNotifications((prev) => {
        const updated = [newEntry, ...prev].slice(0, 20);
        localStorage.setItem('expenseNotifications', JSON.stringify(updated));
        return updated;
      });
      setToast(message);
      setTimeout(() => setToast(null), 2000);
    };

    window.addEventListener('expense-notification', handler);
    return () => window.removeEventListener('expense-notification', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
    <header className="border-b border-ink-200 dark:border-ink-800 bg-ink-50 dark:bg-ink-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-sage-400 flex items-center justify-center">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M7.5 1L1 5v9h4.5V9h4v5H14V5L7.5 1z" fill="#0e0f11" className="dark:fill-white" />
            </svg>
          </div>
          <span className="font-display font-700 text-base tracking-tight text-ink-900 dark:text-ink-100">
            Smart<span className="text-sage-400">Tracker</span>
          </span>
        </div>

        {/* User + Theme + Logout */}
        {user && (
          <div className="flex items-center gap-4">
            <div
              onClick={() => navigate('/profile')}
              className="hidden sm:flex items-center gap-2 cursor-pointer"
              title="Open profile"
            >
              <div className="w-7 h-7 rounded-full bg-sage-400/20 border border-sage-400/30 flex items-center justify-center">
                <span className="text-sage-400 text-xs font-semibold">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-ink-700 dark:text-ink-300 font-medium">{user.name}</span>
            </div>
            <button
              onClick={() => setShowChallenges(!showChallenges)}
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300 dark:bg-amber-400/10 dark:border-amber-300"
              title="View weekly challenges"
            >
              <span className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-xs font-bold text-ink-900">💰</span>
              <span className="text-xs text-ink-700 dark:text-ink-300 font-semibold">
                {points > 0 ? `${points} pts` : 'Coins'}
              </span>
            </button>
            <div className="relative">
              <button
                onClick={() => setShowNotificationList((prev) => !prev)}
                className="relative flex items-center justify-center w-8 h-8 rounded-full bg-ink-100 dark:bg-ink-800 border border-ink-200 dark:border-ink-700"
                title="Expense notifications"
              >
                <span className="text-xs">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-[10px] font-bold text-white bg-rose-500 rounded-full w-4 h-4 flex items-center justify-center">{unreadCount}</span>
                )}
              </button>
              {showNotificationList && (
                <div className="absolute right-0 mt-2 w-80 max-h-72 overflow-y-auto bg-ink-50 dark:bg-ink-900 border border-ink-200 dark:border-ink-700 rounded-lg shadow-lg z-50">
                  {notifications.length === 0 ? (
                    <div className="p-3 text-xs text-ink-500">No notifications yet.</div>
                  ) : (
                    notifications.map((n, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          if (!n.read) {
                            setNotifications(prev => {
                              const updated = prev.map((item, idx) => idx === i ? { ...item, read: true } : item);
                              localStorage.setItem('expenseNotifications', JSON.stringify(updated));
                              return updated;
                            });
                          }
                        }}
                        className={`p-2 border-b border-ink-200 dark:border-ink-800 text-xs text-ink-700 dark:text-ink-300 cursor-pointer hover:bg-ink-100 dark:hover:bg-ink-800 ${!n.read ? 'bg-green-100 dark:bg-green-900/20' : ''}`}
                      >
                        <p>{n.message}</p>
                        <p className="text-xs text-ink-500 dark:text-ink-400">{new Date(n.timestamp).toLocaleString()}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 text-xs text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-100 transition-colors duration-150 font-medium"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-ink-600 dark:text-ink-400 hover:text-rose-300 transition-colors duration-150 font-medium"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
    {showChallenges && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowChallenges(false)}>
        <div className="bg-white dark:bg-ink-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-ink-900 dark:text-ink-100">Weekly Challenges</h2>
            <button onClick={() => setShowChallenges(false)} className="text-ink-500 hover:text-ink-700 dark:text-ink-400 dark:hover:text-ink-200">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <WeeklyChallenges expenses={expenses} budget={budget} onPointsUpdate={setPoints} />
        </div>
      </div>
    )}

    {toast && (
      <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-ink-900/95 text-white px-4 py-2 shadow-lg border border-ink-700">
        {toast}
      </div>
    )}
    </>
  );
}
