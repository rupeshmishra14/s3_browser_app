import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { listReports } from '../services/api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

// Cache for storing report counts
const reportCountsCache = new Map<string, { counts: Record<string, number>; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache

export function useCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
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

  // Smart fetch - only fetch for days that might have reports
  const fetchReportCounts = useCallback(async (date: Date) => {
    const monthKey = format(date, 'yyyy-MM');
    
    // Check if we already have valid cached data
    if (isCacheValid(monthKey)) {
      const cached = reportCountsCache.get(monthKey);
      setReportCounts(cached!.counts);
      return;
    }

    setLoading(true);
    
    // Initialize with zeros for all days
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const days = eachDayOfInterval({ start, end });
    const counts: Record<string, number> = {};
    
    // Initialize all days with 0
    days.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      counts[dateStr] = 0;
    });

    // Set initial counts immediately (all zeros)
    setReportCounts(counts);

    // Only fetch for recent days (last 7 days) and current month to reduce API calls
    const today = new Date();
    const recentDays = days.filter(day => {
      const diffTime = Math.abs(today.getTime() - day.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 || day.getMonth() === today.getMonth();
    });

    // Make API calls only for recent days
    const promises = recentDays.map(async (day) => {
      try {
        const prefix = format(day, 'yyyy/MM/dd');
        const reports = await listReports(prefix);
        const dateStr = format(day, 'yyyy-MM-dd');
        return { dateStr, count: reports.length };
      } catch (error) {
        console.warn(`Failed to fetch reports for ${format(day, 'yyyy-MM-dd')}:`, error);
        const dateStr = format(day, 'yyyy-MM-dd');
        return { dateStr, count: 0 };
      }
    });

    try {
      // Wait for all promises to resolve
      const results = await Promise.all(promises);
      
      // Update counts with actual results
      results.forEach(({ dateStr, count }) => {
        counts[dateStr] = count;
      });
      
      // Cache the results
      reportCountsCache.set(monthKey, {
        counts,
        timestamp: Date.now()
      });
      
      setReportCounts(counts);
    } catch (error) {
      console.error('Failed to fetch report counts:', error);
      // Keep the zero counts if all requests fail
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
      // Only fetch if month changed or cache is invalid
      if (selectedMonthKey !== currentMonthKey.current || !isCacheValid(selectedMonthKey)) {
        currentMonthKey.current = selectedMonthKey;
        fetchReportCounts(selectedDate);
      }
    }
  }, [selectedDate, selectedMonthKey, fetchReportCounts, isCacheValid]);

  // Initialize with current month data when component mounts
  useEffect(() => {
    if (!isInitialized.current) {
      const today = new Date();
      const monthKey = format(today, 'yyyy-MM');
      currentMonthKey.current = monthKey;
      
      // Initialize with current month
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
    }
  }, []);

  return { selectedDate, setSelectedDate, reportCounts, loading };
} 