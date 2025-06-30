import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { listReports } from '../services/api';
import { config } from '../config';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

// Cache for storing report counts
const reportCountsCache = new Map<string, { counts: Record<string, number>; timestamp: number }>();

// Production logging utility
const logger = {
  error: (message: string, error?: any) => {
    if (config.isDevelopment) {
      console.error(message, error);
    }
    // In production, you could send to error tracking service like Sentry
  },
  warn: (message: string, data?: any) => {
    if (config.isDevelopment) {
      console.warn(message, data);
    }
  }
};

export function useCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentDisplayMonth, setCurrentDisplayMonth] = useState<Date>(new Date());
  const [reportCounts, setReportCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const currentMonthKey = useRef<string>('');
  const isInitialized = useRef<boolean>(false);
  const abortController = useRef<AbortController | null>(null);

  // Check if cache is valid
  const isCacheValid = useCallback((monthKey: string) => {
    const cached = reportCountsCache.get(monthKey);
    if (!cached) return false;
    return Date.now() - cached.timestamp < config.cacheDuration;
  }, []);

  // Smart fetch - only fetch for days that might have reports
  const fetchReportCounts = useCallback(async (date: Date) => {
    const monthKey = format(date, 'yyyy-MM');
    
    // Cancel any ongoing request
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();
    
    // Check if we already have valid cached data
    if (isCacheValid(monthKey)) {
      const cached = reportCountsCache.get(monthKey);
      if (cached && Object.keys(cached.counts).length > 0) {
        setReportCounts(cached.counts);
        return;
      }
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

    // Fetch for all days in the month to ensure we get all reports
    const promises = days.map(async (day) => {
      try {
        const prefix = format(day, 'yyyy/MM/dd');
        const reports = await listReports(prefix);
        const dateStr = format(day, 'yyyy-MM-dd');
        return { dateStr, count: reports.length };
      } catch (error) {
        if (error.name === 'AbortError') {
          throw error; // Re-throw abort errors
        }
        logger.warn(`Failed to fetch reports for ${format(day, 'yyyy-MM-dd')}:`, error);
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
      
      // Only update if this is still the current month
      if (monthKey === currentMonthKey.current) {
        setReportCounts(counts);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        return;
      }
      logger.error('Failed to fetch report counts:', error);
      // Keep the zero counts if all requests fail
    } finally {
      if (monthKey === currentMonthKey.current) {
        setLoading(false);
      }
    }
  }, [isCacheValid]);

  // Memoize the month key to prevent unnecessary fetches
  const selectedMonthKey = useMemo(() => {
    return selectedDate ? format(selectedDate, 'yyyy-MM') : '';
  }, [selectedDate]);

  const displayMonthKey = useMemo(() => {
    return format(currentDisplayMonth, 'yyyy-MM');
  }, [currentDisplayMonth]);

  // Fetch counts when selected date changes (to get the month)
  useEffect(() => {
    if (selectedDate && isInitialized.current) {
      const monthKey = format(selectedDate, 'yyyy-MM');
      // Only fetch if month changed or cache is invalid
      if (monthKey !== currentMonthKey.current || !isCacheValid(monthKey)) {
        currentMonthKey.current = monthKey;
        fetchReportCounts(selectedDate);
      }
    }
  }, [selectedDate, selectedMonthKey, fetchReportCounts, isCacheValid]);

  // Fetch counts when display month changes
  useEffect(() => {
    if (isInitialized.current) {
      const monthKey = format(currentDisplayMonth, 'yyyy-MM');
      // Only fetch if month changed or cache is invalid
      if (monthKey !== currentMonthKey.current || !isCacheValid(monthKey)) {
        currentMonthKey.current = monthKey;
        fetchReportCounts(currentDisplayMonth);
      }
    }
  }, [currentDisplayMonth, displayMonthKey, fetchReportCounts, isCacheValid]);

  // Initialize with current month data when component mounts
  useEffect(() => {
    if (!isInitialized.current) {
      const today = new Date();
      const monthKey = format(today, 'yyyy-MM');
      currentMonthKey.current = monthKey;
      
      // Check if we have cached data for current month
      if (isCacheValid(monthKey)) {
        const cached = reportCountsCache.get(monthKey);
        if (cached) {
          setReportCounts(cached.counts);
          isInitialized.current = true;
          return;
        }
      }
      
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
      
      // Fetch data for current month
      fetchReportCounts(today);
    }
  }, [isCacheValid, fetchReportCounts]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  return { 
    selectedDate, 
    setSelectedDate, 
    currentDisplayMonth,
    setCurrentDisplayMonth,
    reportCounts, 
    loading 
  };
}