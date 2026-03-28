import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { expenseAPI } from '../services/api';
import WeeklyChallenges from '../components/WeeklyChallenges';
import Spinner from '../components/Spinner';
import ErrorAlert from '../components/ErrorAlert';

export default function Profile() {
  const { user, updateUserBudget } = useAuth();
  const navigate = useNavigate();

  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudget, setNewBudget] = useState(user?.budget || 0);
  const points = Number(localStorage.getItem(`userPoints_${user?.id}`) || 0);

  const handleSaveBudget = async () => {
    try {
      await updateUserBudget(Number(newBudget));
      setIsEditingBudget(false);
    } catch (err) {
      alert('Failed to update budget');
    }
  };

  const handleCancelEdit = () => {
    setNewBudget(user?.budget || 0);
    setIsEditingBudget(false);
  };

  if (!user) {
    navigate('/login', { replace: true });
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-700 text-ink-900 dark:text-ink-100">Profile</h1>
          <p className="text-sm text-ink-500 dark:text-ink-300">Your user details and reward stats</p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-secondary"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="card space-y-4">
        <div>
          <p className="text-xs text-ink-500 dark:text-ink-400 uppercase tracking-wider">Name</p>
          <p className="text-lg font-semibold text-ink-900 dark:text-ink-100">{user.name}</p>
        </div>

        <div>
          <p className="text-xs text-ink-500 dark:text-ink-400 uppercase tracking-wider">Email</p>
          <p className="text-lg font-semibold text-ink-900 dark:text-ink-100">{user.email}</p>
        </div>

        <div>
          <p className="text-xs text-ink-500 dark:text-ink-400 uppercase tracking-wider">Budget</p>
          {isEditingBudget ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                value={newBudget}
                onChange={(e) => setNewBudget(Number(e.target.value))}
                className="input-field w-32"
                min="0"
              />
              <button onClick={handleSaveBudget} className="btn-primary text-xs px-2 py-1">Save</button>
              <button onClick={handleCancelEdit} className="btn-secondary text-xs px-2 py-1">Cancel</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold text-ink-900 dark:text-ink-100">₹{Number(user.budget || 0).toLocaleString('en-IN')}</p>
              <button onClick={() => setIsEditingBudget(true)} className="text-sage-400 hover:text-sage-500 text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div>
          <p className="text-xs text-ink-500 dark:text-ink-400 uppercase tracking-wider">Challenge Points</p>
          <p className="text-lg font-semibold text-amber-400">{points} pts</p>
        </div>

        <p className="text-sm text-ink-500 dark:text-ink-300">Dummy login users have local-only data and no API calls.</p>
      </div>
    </div>
  );
}
