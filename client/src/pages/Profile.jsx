import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import LevelWidget from '../components/LevelWidget';
import BadgeDisplay from '../components/BadgeDisplay';
import { SignIn, SignUp } from '@clerk/clerk-react';

const DISTRICTS = {
  'Tamil Nadu':    ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli', 'Tirunelveli', 'Vellore', 'Erode', 'Thanjavur', 'Dindigul'],
  'Maharashtra':   ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Thane', 'Navi Mumbai', 'Amravati'],
  'Karnataka':     ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi', 'Davangere', 'Ballari', 'Bidar', 'Udupi', 'Shimoga'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut', 'Allahabad', 'Bareilly', 'Aligarh', 'Ghaziabad', 'Moradabad'],
  'Gujarat':       ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Anand', 'Navsari', 'Morbi'],
  'Rajasthan':     ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar'],
  'West Bengal':   ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Malda', 'Bardhaman', 'Baharampur', 'Habra', 'Kharagpur'],
  'Telangana':     ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Ramagundam', 'Khammam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet'],
  'Delhi':         ['New Delhi', 'Dwarka', 'Rohini', 'Pitampura', 'Janakpuri', 'Saket', 'Lajpat Nagar', 'Karol Bagh', 'Connaught Place', 'Vasant Kunj'],
  'Kerala':        ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha', 'Kannur', 'Kottayam', 'Malappuram'],
};

const STATES = Object.keys(DISTRICTS);

const FormField = ({ label, id, children }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="text-[10px] font-bold font-mono tracking-widest text-slate-500 uppercase block">
      {label}
    </label>
    {children}
  </div>
);

const LeaderRow = ({ rank, entry, isMe }) => {
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-lg border transition-all"
      style={{
        background:  isMe ? '#f1f5f9' : '#ffffff',
        borderColor: isMe ? 'var(--gov-navy)' : '#e2e8f0',
      }}
    >
      <span className="w-8 text-center font-display text-xs font-black text-slate-400">
        {medals[rank] || `#${rank}`}
      </span>
      <div className="w-8 h-8 rounded bg-gov-navy text-white flex items-center justify-center text-xs font-bold uppercase">
        {entry.username?.[0] || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-800 font-mono truncate">
          @{entry.username}
          {isMe && <span className="text-gov-blue ml-2 text-[9px] font-bold">(YOU)</span>}
        </p>
        <p className="text-[9px] text-slate-400 font-mono">{entry.district}, {entry.state}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-display text-sm font-bold text-gov-navy">
          {(entry.citizenXP || 0).toLocaleString()}
        </p>
        <p className="text-[9px] text-slate-400 font-mono">XP</p>
      </div>
    </div>
  );
};

const Profile = () => {
  const { user, isLoggedIn, login } = useUser();
  const { addToast }                 = useToast();
  const { t }                        = useLanguage();

  const [activeTab, setActiveTab] = useState('profile');

  const [authTab,   setAuthTab]   = useState('login');
  const [authForm,  setAuthForm]  = useState({ username: '', password: '', fullName: '', state: STATES[0], district: DISTRICTS[STATES[0]][0] });
  const [authLoad,  setAuthLoad]  = useState(false);

  const [settings,   setSettings]  = useState({ fullName: '', bio: '', dob: '', primaryAddress: '', state: '', district: '' });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [pwForm,     setPwForm]    = useState({ current: '', next: '', confirm: '' });
  const [pwLoading,  setPwLoading] = useState(false);

  const [leaders,  setLeaders]  = useState([]);
  const [lLoading, setLLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setSettings({
        fullName:       user.profile?.fullName || '',
        bio:            user.profile?.bio      || '',
        dob:            user.profile?.dob      || '',
        primaryAddress: user.profile?.primaryAddress || '',
        state:          user.state             || STATES[0],
        district:       user.district          || '',
      });
    }
  }, [user]);

  const fetchLeaders = useCallback(async () => {
    setLLoading(true);
    try {
      const res = await axios.get('/api/users/leaderboard');
      setLeaders(res.data?.data || []);
    } catch {
      setLeaders([]);
    } finally {
      setLLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'leaderboard') fetchLeaders();
  }, [activeTab, fetchLeaders]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoad(true);
    try {
      if (authTab === 'login') {
        const res = await axios.post('/api/users/login', {
          username: authForm.username.trim(),
          password: authForm.password,
        });
        login(res.data.data);
        addToast({ type: 'success', message: `Connected as @${res.data.data.username}.` });
      } else {
        if (authForm.password.length < 6) {
          addToast({ type: 'info', message: 'Password must be 6+ characters.' });
          return;
        }
        const res = await axios.post('/api/users/register', {
          username: authForm.username.trim(),
          password: authForm.password,
          profile:  { fullName: authForm.fullName.trim() },
          state:    authForm.state,
          district: authForm.district,
        });
        login(res.data.data);
        addToast({ type: 'xp', message: `Account created. +50 XP bonus awarded.` });
      }
    } catch (err) {
      addToast({ type: 'error', message: err.response?.data?.message || 'Authentication error.' });
    } finally {
      setAuthLoad(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    try {
      const res = await axios.put(`/api/users/${user.username}`, {
        profile:  {
          fullName:       settings.fullName,
          bio:            settings.bio,
          dob:            settings.dob,
          primaryAddress: settings.primaryAddress,
        },
        state:    settings.state,
        district: settings.district,
      });
      login({ ...user, ...res.data.data });
      addToast({ type: 'success', message: 'Civic profile saved.' });
    } catch (err) {
      addToast({ type: 'error', message: err.response?.data?.message || 'Update failed.' });
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) {
      addToast({ type: 'info', message: 'Passwords do not match.' });
      return;
    }
    if (pwForm.next.length < 6) {
      addToast({ type: 'info', message: 'Password must be 6+ characters.' });
      return;
    }
    setPwLoading(true);
    try {
      await axios.put(`/api/users/${user.username}/password`, {
        currentPassword: pwForm.current,
        newPassword:     pwForm.next,
      });
      setPwForm({ current: '', next: '', confirm: '' });
      addToast({ type: 'success', message: 'Security credentials updated.' });
    } catch (err) {
      addToast({ type: 'error', message: err.response?.data?.message || 'Change failed.' });
    } finally {
      setPwLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="page-wrapper max-w-md mx-auto space-y-6">
        <div
          className="rounded-xl p-8 bg-white border border-slate-200 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gov-navy" />
          <div className="relative text-center space-y-2">
            <p className="section-label">{t('profileTitle') === 'அடையாள கன்சோல்' ? 'அடையாள கன்சோல்' : t('profileTitle') === 'पहचान कंसोल' ? 'पहचान कंसोल' : 'CITIZEN IDENTITY'}</p>
            <h1 className="font-display font-black text-2xl text-gov-navy">{t('profileTitle')}</h1>
            <p className="text-slate-500 text-xs leading-relaxed">{t('profileDesc')}</p>
          </div>
        </div>

        {/* Form selection */}
        <div className="flex rounded border border-slate-200 overflow-hidden bg-white p-1 shadow-sm">
          {[['login','profileSignTab'],['register','profileRegTab']].map(([v,lKey]) => (
            <button
              key={v}
              onClick={() => setAuthTab(v)}
              className="flex-1 py-2.5 rounded font-display text-[10px] font-bold tracking-widest transition-all"
              style={{
                background:  authTab === v ? 'var(--gov-navy)' : 'transparent',
                color:       authTab === v ? '#ffffff'          : '#64748b',
              }}
              id={`auth-tab-${v}`}
            >
              {t(lKey)}
            </button>
          ))}
        </div>

        <div className="flex justify-center p-2">
          {authTab === 'login' ? (
            <SignIn routing="hash" />
          ) : (
            <SignUp routing="hash" />
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="page-wrapper space-y-6 animate-slide-up">

      {/* ── PROFILE BRAND ──────────────────────────────────────────── */}
      <section
        className="rounded-xl p-8 bg-white border border-slate-200 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gov-navy" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex-1 space-y-3">
            <p className="section-label">{t('profileVerifiedTitle')}</p>
            <h1 className="font-display font-black text-2xl text-gov-navy">
              @{user.username}
            </h1>
            <p className="text-slate-500 text-xs font-display font-bold leading-none">{user.profile?.fullName || 'Active Citizen'}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="badge badge-cyan font-mono">LEVEL {user.currentLevel || 1}</span>
              <span className="badge badge-glass font-mono">{(user.citizenXP || 0).toLocaleString()} XP</span>
              <span className="badge badge-glass font-mono">{user.district.toUpperCase()}</span>
              <span className="badge badge-glass font-mono">{user.state.toUpperCase()}</span>
            </div>

            {user.profile?.bio && (
              <p className="text-xs text-slate-500 mt-2.5 italic max-w-md leading-relaxed">
                "{user.profile.bio}"
              </p>
            )}

            {(user.profile?.dob || user.profile?.primaryAddress) && (
              <div className="flex flex-col gap-1.5 pt-3 mt-1 text-[10px] text-slate-400 font-mono">
                {user.profile.dob && (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span>{t('profileDob')}: {user.profile.dob}</span>
                  </div>
                )}
                {user.profile.primaryAddress && (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                    </svg>
                    <span>{t('profileAddress')}: {user.profile.primaryAddress}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="w-full md:w-48 flex-shrink-0">
            <LevelWidget xp={user.citizenXP || 0} />
          </div>
        </div>
      </section>

      {/* ── TABS ─────────────────────────────────────────────────── */}
      <div className="flex gap-2 border-b border-slate-200" role="tablist" aria-label="Tabs">
        {[['profile','profileOverview'],['settings','profileSettings'],['leaderboard','profileLeaderboard']].map(([v,lKey]) => (
          <button
            key={v}
            role="tab"
            aria-selected={activeTab === v}
            onClick={() => setActiveTab(v)}
            className="px-5 py-2.5 text-xs font-display font-black tracking-wider border-b-2 transition-all"
            style={{
              borderColor: activeTab === v ? 'var(--gov-navy)' : 'transparent',
              color:       activeTab === v ? 'var(--gov-navy)' : '#94a3b8',
            }}
            id={`profile-tab-${v}`}
          >
            {t(lKey)}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ─────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { l: t('profileStatsXp'),   v: user.citizenXP || 0,              c: '#0f294a' },
              { l: t('profileStatsLvl'),  v: `LEVEL ${user.currentLevel || 1}`, c: '#7c3aed' },
              { l: t('profileStatsVisited'), v: user.stats?.servicesVisited || 0,  c: '#16a34a' },
              { l: t('profileStatsFeedback'), v: user.stats?.feedbackGiven || 0,    c: '#d97706' },
            ].map((s) => (
              <div key={s.l} className="glass-card p-4">
                <p className="text-[9px] font-bold text-slate-400 font-mono tracking-widest uppercase">{s.l}</p>
                <p className="font-display font-black text-lg mt-1" style={{ color: s.c }}>
                  {s.v.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <BadgeDisplay earnedBadges={user.badges || []} />
        </div>
      )}

      {/* ── SETTINGS ─────────────────────────────────────────────── */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-xl">
          <form onSubmit={handleSaveSettings} className="glass-card p-6 space-y-4 shadow-sm" aria-label="Settings form">
            <p className="section-label">{t('profileMetadataTitle')}</p>

            <FormField label={t('profileFullName')} id="settings-fullname">
              <input
                id="settings-fullname"
                type="text"
                value={settings.fullName}
                onChange={(e) => setSettings((p) => ({ ...p, fullName: e.target.value }))}
                className="input-field text-xs"
                placeholder={t('profileFullName')}
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label={t('profileDob')} id="settings-dob">
                <input
                  id="settings-dob"
                  type="date"
                  value={settings.dob}
                  onChange={(e) => setSettings((p) => ({ ...p, dob: e.target.value }))}
                  className="input-field text-xs text-slate-700"
                />
              </FormField>

              <FormField label={t('profileAddress')} id="settings-address">
                <input
                  id="settings-address"
                  type="text"
                  value={settings.primaryAddress}
                  onChange={(e) => setSettings((p) => ({ ...p, primaryAddress: e.target.value }))}
                  className="input-field text-xs"
                  placeholder={t('profileAddress')}
                />
              </FormField>
            </div>

            <FormField label={t('profileBio')} id="settings-bio">
              <textarea
                id="settings-bio"
                rows={2}
                value={settings.bio}
                onChange={(e) => setSettings((p) => ({ ...p, bio: e.target.value }))}
                className="input-field text-xs resize-none"
                placeholder={t('profileBioPlaceholder')}
                maxLength={300}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label={t('profileState')} id="settings-state">
                <select
                  id="settings-state"
                  value={settings.state}
                  onChange={(e) => setSettings((p) => ({ ...p, state: e.target.value, district: DISTRICTS[e.target.value]?.[0] || '' }))}
                  className="input-field text-xs"
                >
                  {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </FormField>
              <FormField label={t('profileDistrict')} id="settings-district">
                <select
                  id="settings-district"
                  value={settings.district}
                  onChange={(e) => setSettings((p) => ({ ...p, district: e.target.value }))}
                  className="input-field text-xs"
                >
                  {(DISTRICTS[settings.state] || []).map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </FormField>
            </div>

            <button type="submit" disabled={settingsLoading} className="btn-cyan w-full py-2.5 font-display tracking-widest text-[10px]" id="settings-save-btn">
              {settingsLoading ? t('cardLoading') : t('profileSaveBtn')}
            </button>
          </form>

          {/* Change password */}
          <form onSubmit={handleChangePassword} className="glass-card p-6 space-y-4 shadow-sm" aria-label="Credentials Form">
            <p className="section-label">{t('profileChangePw')}</p>

            {[
              { l: t('profileCurrentPw'), k: 'current', id: 'pw-current', ac: 'current-password' },
              { l: t('profileNewPw'),     k: 'next',    id: 'pw-new',     ac: 'new-password'     },
              { l: t('profileConfirmPw'), k: 'confirm', id: 'pw-confirm', ac: 'new-password'     },
            ].map(({ l, k, id, ac }) => (
              <FormField key={k} label={l} id={id}>
                <input
                  id={id}
                  type="password"
                  value={pwForm[k]}
                  onChange={(e) => setPwForm((p) => ({ ...p, [k]: e.target.value }))}
                  className="input-field text-xs"
                  placeholder="••••••••"
                  autoComplete={ac}
                  required
                />
              </FormField>
            ))}

            <button type="submit" disabled={pwLoading} className="btn-purple w-full py-2.5 font-display tracking-widest text-[10px]" id="pw-change-btn">
              {pwLoading ? t('cardLoading') : t('profileUpdatePwBtn')}
            </button>
          </form>
        </div>
      )}

      {/* ── LEADERBOARD ──────────────────────────────────────────── */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-3">
          <p className="section-label">{t('profileTopCitizens')}</p>
          {lLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton h-12" />
              ))}
            </div>
          ) : leaders.length > 0 ? (
            <div className="space-y-2">
              {leaders.map((entry, i) => (
                <LeaderRow
                  key={entry._id || entry.username}
                  rank={i + 1}
                  entry={entry}
                  isMe={entry.username === user.username}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card p-10 text-center">
              <p className="text-slate-500 text-xs font-mono">{t('profileLeaderLoading')}</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default Profile;
