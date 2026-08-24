import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from './AuthContext';

/**
 * Caches the reports list so the dashboard doesn't refetch on every visit.
 * Mutations (save/delete) update the cache optimistically-ish: server first, then cache.
 */
const ReportsContext = createContext(null);

export function ReportsProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.listReports();
      setReports(res?.reports || res || []);
      setLoaded(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && !loaded) refresh();
    if (!isAuthenticated) {
      setReports([]);
      setLoaded(false);
    }
  }, [isAuthenticated, loaded, refresh]);

  const removeReport = useCallback(async (id) => {
    await api.deleteReport(id);
    setReports((list) => list.filter((r) => String(r.id ?? r._id) !== String(id)));
  }, []);

  const upsertReport = useCallback((report) => {
    const id = String(report.id ?? report._id);
    setReports((list) => {
      const exists = list.some((r) => String(r.id ?? r._id) === id);
      return exists ? list.map((r) => (String(r.id ?? r._id) === id ? { ...r, ...report } : r)) : [report, ...list];
    });
  }, []);

  const value = useMemo(
    () => ({ reports, loading, error, refresh, removeReport, upsertReport }),
    [reports, loading, error, refresh, removeReport, upsertReport],
  );

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>;
}

export function useReports() {
  const ctx = useContext(ReportsContext);
  if (!ctx) throw new Error('useReports must be used inside <ReportsProvider>');
  return ctx;
}
