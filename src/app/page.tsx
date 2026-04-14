'use client';

import { useState, useEffect, useCallback } from 'react';
import Navigation from '@/components/shared/Navigation';
import StatsBar from '@/components/user/StatsBar';
import SignalList from '@/components/user/SignalList';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminDashboard from '@/components/admin/AdminDashboard';
import type { AppView, AdminUser, Signal, Stats } from '@/lib/types';

export default function HomePage() {
  const [currentView, setCurrentView] = useState<AppView>('user');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalTrades: 0, closedTrades: 0, winTrades: 0,
    lossTrades: 0, winRate: 0, activeSignals: 0,
  });
  const [isLoadingSignals, setIsLoadingSignals] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isSetup, setIsSetup] = useState(true);
  const [setupError, setSetupError] = useState('');

  const fetchSignals = useCallback(async () => {
    setIsLoadingSignals(true);
    try {
      const res = await fetch('/api/signals');
      const data = await res.json();
      if (data && Array.isArray(data)) setSignals(data);
    } catch {
      console.error('Failed to fetch signals');
    } finally {
      setIsLoadingSignals(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data && typeof data === 'object') setStats(data);
    } catch {
      console.error('Failed to fetch stats');
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    const setup = async () => {
      try {
        const res = await fetch('/api/seed', { method: 'POST' });
        const data = await res.json();
        if (!res.ok && data?.details?.includes('DATABASE_URL')) {
          setSetupError('DATABASE_URL');
        }
      } catch {
        // Seed might fail, continue anyway
      } finally {
        setIsSetup(false);
      }
    };
    setup();
  }, []);

  useEffect(() => {
    if (!isSetup) {
      fetchSignals();
      fetchStats();
    }
  }, [isSetup, fetchSignals, fetchStats]);

  useEffect(() => {
    if (currentView === 'user' && !isSetup) {
      const interval = setInterval(() => {
        fetchSignals();
        fetchStats();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [currentView, isSetup, fetchSignals, fetchStats]);

  const handleLogin = (admin: AdminUser) => {
    setAdminUser(admin);
    setIsAdmin(true);
    setCurrentView('admin-dashboard');
  };

  const handleLogout = () => {
    setAdminUser(null);
    setIsAdmin(false);
    setCurrentView('user');
  };

  if (isSetup) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#0a0e17' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-trading-border border-t-trading-gold" />
          <p className="text-sm text-trading-text-secondary">جاري تحميل المنصة...</p>
        </div>
      </div>
    );
  }

  if (setupError) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#0a0e17' }}>
        <div className="max-w-md rounded-2xl border border-trading-border bg-trading-card p-8 text-center">
          <div className="mb-4 text-4xl">⚙️</div>
          <h2 className="mb-2 text-xl font-bold text-trading-text">إعداد قاعدة البيانات</h2>
          <p className="mb-4 text-sm text-trading-text-secondary">
            يرجى إضافة متغير <code className="rounded bg-trading-bg px-2 py-0.5 text-xs text-trading-gold">DATABASE_URL</code> في إعدادات المشروع على Vercel
          </p>
          <a
            href="https://neon.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-trading-gold px-6 py-2.5 text-sm font-bold text-trading-bg"
          >
            إنشاء قاعدة مجانية من Neon
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0e17' }}>
      <Navigation
        currentView={currentView}
        onViewChange={setCurrentView}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />

      <main className="mx-auto max-w-4xl px-4 py-4 sm:px-6 sm:py-6">
        {currentView === 'user' && (
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl border border-trading-gold/20 bg-gradient-to-l from-trading-gold/10 via-trading-card to-trading-card p-5 sm:p-6">
              <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-trading-gold/5 blur-3xl" />
              <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-trading-gold/5 blur-3xl" />
              <div className="relative">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-lg bg-trading-gold/20 px-2.5 py-1 text-xs font-bold text-trading-gold">
                    🔥 حية
                  </span>
                  <span className="text-xs text-trading-text-secondary">
                    {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <h2 className="mb-1 text-xl font-bold text-trading-text sm:text-2xl">
                  مرحباً بك في <span className="gradient-gold">ForexYemeni Pro</span>
                </h2>
                <p className="text-sm text-trading-text-secondary">
                  تابع أحدث إشارات التداول من خبرائنا المحترفين
                </p>
              </div>
            </div>

            <StatsBar stats={stats} isLoading={isLoadingStats} />

            <SignalList
              signals={signals}
              isLoading={isLoadingSignals}
              onRefresh={() => {
                fetchSignals();
                fetchStats();
              }}
            />
          </div>
        )}

        {currentView === 'admin-login' && (
          <AdminLogin onLogin={handleLogin} onBack={() => setCurrentView('user')} />
        )}

        {currentView === 'admin-dashboard' && (
          <AdminDashboard onLogout={handleLogout} />
        )}
      </main>

      <footer className="mt-auto border-t border-trading-border py-4 text-center">
        <p className="text-xs text-trading-text-secondary">
          © {new Date().getFullYear()} ForexYemeni Pro - جميع الحقوق محفوظة
        </p>
      </footer>
    </div>
  );
}
