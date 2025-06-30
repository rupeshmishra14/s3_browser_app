import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { listReports } from '../services/api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

// Cache for storing report counts
const reportCountsCache = new Map<string, { counts: Record<string, number>; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache

export function useCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [reportCounts, setReportCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const currentMonthKey = useRef<string>('');
  const isInitialized = useRef<boolean>(false);

  // Check if cache is valid
  const isCacheValid = useCallback((monthKey: string) => {
    const cached = reportCountsCache.get(monthKey);
    if (!cached) return false;
    return Date.now() - cached.timestamp < CACHE_DURATION;
  }, []);

  // Fetch all reports for the month and use counts from backend if available
  const fetchMonthReportCounts = useCallback(async (date: Date) => {
    const monthKey = format(date, 'yyyy-MM');
    const monthPrefix = format(date, 'yyyy/MM/');

    if (isCacheValid(monthKey)) {
      const cached = reportCountsCache.get(monthKey);
      setReportCounts(cached!.counts);
      return;
    }

    setLoading(true);

    // Initialize all days with 0
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const days = eachDayOfInterval({ start, end });
    const counts: Record<string, number> = {};
    days.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      counts[dateStr] = 0;
    });

    try {
      // Fetch all reports for the month
      const response = await listReports(monthPrefix);
      let backendCounts = response.counts;
      if (backendCounts && typeof backendCounts === 'object') {
        // Use backend counts directly
        Object.entries(backendCounts).forEach(([dayStr, count]) => {
          if (counts[dayStr] !== undefined) {
            counts[dayStr] = count as number;
          }
        });
      } else if (Array.isArray(response.details)) {
        // Fallback: group details by day
        response.details.forEach((report: { path: string }) => {
          const match = report.path.match(/\d{4}\/\d{2}\/\d{2}/);
          if (match) {
            const [y, m, d] = match[0].split('/');
            const dayStr = `${y}-${m}-${d}`;
            if (counts[dayStr] !== undefined) {
              counts[dayStr] += 1;
            }
          }
        });
      }
      reportCountsCache.set(monthKey, { counts, timestamp: Date.now() });
      setReportCounts(counts);
    } catch (error) {
      console.error('Failed to fetch monthly report counts:', error);
    } finally {
      setLoading(false);
    }
  }, [isCacheValid]);

  // Memoize the month key to prevent unnecessary fetches
  const selectedMonthKey = useMemo(() => {
    return selectedDate ? format(selectedDate, 'yyyy-MM') : '';
  }, [selectedDate]);

  // Fetch counts when selected date changes (to get the month)
  useEffect(() => {
    if (selectedDate && isInitialized.current) {
      if (selectedMonthKey !== currentMonthKey.current || !isCacheValid(selectedMonthKey)) {
        currentMonthKey.current = selectedMonthKey;
        fetchMonthReportCounts(selectedDate);
      }
    }
  }, [selectedDate, selectedMonthKey, fetchMonthReportCounts, isCacheValid]);

  // Initialize with current month data when component mounts
  useEffect(() => {
    if (!isInitialized.current) {
      const today = new Date();
      const monthKey = format(today, 'yyyy-MM');
      currentMonthKey.current = monthKey;
      // Initialize all days with 0
      const start = startOfMonth(today);
      const end = endOfMonth(today);
      const days = eachDayOfInterval({ start, end });
      const counts: Record<string, number> = {};
      days.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        counts[dateStr] = 0;
      });
      setReportCounts(counts);
      isInitialized.current = true;
      fetchMonthReportCounts(today);
    }
  }, [fetchMonthReportCounts]);

  return { selectedDate, setSelectedDate, reportCounts, loading };
} 