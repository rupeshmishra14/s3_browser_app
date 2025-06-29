import { useState, useEffect } from 'react';
import { listReports } from '../services/api';
import { format } from 'date-fns';

interface Report {
  name: string;
  path: string;
  lastModified: string;
  size: number;
}

export function useReports(selectedDate: Date | null) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDate) {
      setReports([]);
      return;
    }
    setLoading(true);
    setError(null);
    const prefix = format(selectedDate, 'yyyy/MM/dd');
    listReports(prefix)
      .then(setReports)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedDate]);

  return { reports, loading, error };
} 