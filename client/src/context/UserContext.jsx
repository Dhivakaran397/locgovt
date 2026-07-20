import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import axios from 'axios';
import { useUser as useClerkUser } from '@clerk/clerk-react';

// ── API Base ───────────────────────────────────────────────────────────────
const API_BASE = '/api';

// ── User Context ───────────────────────────────────────────────────────────
const UserContext = createContext(null);

const DEFAULT_USER_STATE = {
  _id: null,
  username: '',
  district: '',
  state: '',
  citizenXP: 0,
  currentLevel: 1,
  unlockedBadges: [],
  profile: { fullName: '', dob: '', primaryAddress: '' },
  xpProgressPercent: 0,
  xpForNextLevel: 500,
  xpProgress: 0,
};

// ── Provider ───────────────────────────────────────────────────────────────
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(DEFAULT_USER_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState(null);

  const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useClerkUser();

  // Sync session with Clerk authenticated state
  useEffect(() => {
    if (!clerkLoaded) return;

    if (isSignedIn && clerkUser) {
      const rawUsername = clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress?.split('@')[0] || 'citizen';
      const cleanUsername = rawUsername.toLowerCase().replace(/[^a-z0-9]/g, '');

      const syncUser = async () => {
        setIsLoading(true);
        try {
          // 1. Try to fetch existing user from our local database
          const { data } = await axios.get(`${API_BASE}/users/username/${cleanUsername}`);
          if (data.success) {
            setUser(data.data);
            setIsLoggedIn(true);
            localStorage.setItem('locgovt_userId', data.data._id);
          }
        } catch (err) {
          if (err.response?.status === 404) {
            // 2. User doesn't exist locally, register new user profile in custom MongoDB
            const regData = {
              username: cleanUsername,
              password: 'clerk_authenticated_user_secret_password_2026', // Satisfies backend validation
              state: 'Tamil Nadu',
              district: 'Coimbatore',
              profile: {
                fullName: clerkUser.fullName || cleanUsername,
                dob: '2000-01-01',
                primaryAddress: 'Coimbatore, Tamil Nadu'
              }
            };
            const { data: regRes } = await axios.post(`${API_BASE}/users`, regData);
            if (regRes.success) {
              setUser(regRes.data);
              setIsLoggedIn(true);
              localStorage.setItem('locgovt_userId', regRes.data._id);
            }
          }
        } finally {
          setIsLoading(false);
        }
      };

      syncUser();
    } else {
      // Clerk is signed out, clear local session
      setUser(DEFAULT_USER_STATE);
      setIsLoggedIn(false);
      localStorage.removeItem('locgovt_userId');
    }
  }, [clerkLoaded, isSignedIn, clerkUser]);

  // ── Fetch user from server by ID ────────────────────────────────────────
  const fetchUserById = useCallback(async (userId) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_BASE}/users/${userId}`);
      if (data.success) {
        setUser(data.data);
        setIsLoggedIn(true);
        localStorage.setItem('locgovt_userId', data.data._id);
      }
    } catch (err) {
      console.error('fetchUserById error:', err.message);
      setError('Failed to load user profile.');
      localStorage.removeItem('locgovt_userId');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Login: look up by username ───────────────────────────────────────────
  const loginByUsername = useCallback(async (username) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_BASE}/users/username/${username}`);
      if (data.success) {
        setUser(data.data);
        setIsLoggedIn(true);
        localStorage.setItem('locgovt_userId', data.data._id);
        return { success: true, user: data.data };
      }
    } catch (err) {
      const message =
        err.response?.status === 404
          ? 'No account found with that username.'
          : 'Login failed. Please try again.';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Register: create a new user ─────────────────────────────────────────
  const register = useCallback(async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(`${API_BASE}/users`, userData);
      if (data.success) {
        setUser(data.data);
        setIsLoggedIn(true);
        localStorage.setItem('locgovt_userId', data.data._id);
        return { success: true, user: data.data };
      }
    } catch (err) {
      const message =
        err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setUser(DEFAULT_USER_STATE);
    setIsLoggedIn(false);
    localStorage.removeItem('locgovt_userId');
  }, []);

  // ── Update user XP locally (optimistic update after feedback submission) ─
  const updateXPLocally = useCallback((xpAwarded, newTotalXP, newLevel, xpProgressPercent) => {
    setUser((prev) => ({
      ...prev,
      citizenXP: newTotalXP,
      currentLevel: newLevel,
      xpProgressPercent,
      xpProgress: newTotalXP - (newLevel - 1) * 500,
      xpForNextLevel: newLevel * 500,
    }));
  }, []);

  // ── Update unlocked badges locally ──────────────────────────────────────
  const addBadgesLocally = useCallback((newBadges) => {
    if (newBadges && newBadges.length > 0) {
      setUser((prev) => ({
        ...prev,
        unlockedBadges: [...new Set([...prev.unlockedBadges, ...newBadges])],
      }));
    }
  }, []);

  // ── Update user profile on server ───────────────────────────────────────
  const updateProfile = useCallback(async (profileData) => {
    if (!user._id) return { success: false, message: 'Not logged in.' };
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axios.put(`${API_BASE}/users/${user._id}`, profileData);
      if (data.success) {
        setUser((prev) => ({ ...prev, ...data.data }));
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Profile update failed.';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, [user._id]);

  // ── Refresh user data from server ────────────────────────────────────────
  const refreshUser = useCallback(() => {
    if (user._id) {
      fetchUserById(user._id);
    }
  }, [user._id, fetchUserById]);

  const login = useCallback((userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('locgovt_userId', userData._id);
  }, []);

  const value = {
    user,
    isLoading,
    isLoggedIn,
    error,
    login,
    loginByUsername,
    register,
    logout,
    updateXPLocally,
    addBadgesLocally,
    updateProfile,
    refreshUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// ── Hook ───────────────────────────────────────────────────────────────────
export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return ctx;
};

export default UserContext;
