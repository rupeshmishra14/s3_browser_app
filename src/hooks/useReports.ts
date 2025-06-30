import { useState, useEffect, useMemo } from 'react';
import { listReports } from '../services/api';
import { format } from 'date-fns';

interface ExtendedReport {
  id: string;
  title: string;
  type: string;
  size: string;
  timestamp: Date;
  path?: string;
  name?: string;
}

export function useReports(selectedDate: Date | null) {
  const [reports, setReports] = useState<ExtendedReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize the prefix to prevent unnecessary API calls
  const prefix = useMemo(() => {
    return selectedDate ? format(selectedDate, 'yyyy/MM/dd') : '';
  }, [selectedDate]);

  useEffect(() => {
    if (!selectedDate) {
      setReports([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    listReports(prefix)
      .then((apiReports) => {
        const details = Array.isArray(apiReports.details) ? apiReports.details : [];
        const mapped = details.map((r, idx) => {
          // Guess type from extension
          let type = 'OTHER';
          if (r.name.endsWith('.pdf')) type = 'PDF';
          else if (r.name.endsWith('.xlsx')) type = 'XLSX';
          else if (r.name.endsWith('.docx')) type = 'DOCX';
          
          // Format size
          let sizeStr = r.size;
          if (typeof r.size === 'number') {
            if (r.size > 1024 * 1024) sizeStr = (r.size / (1024 * 1024)).toFixed(1) + ' MB';
            else if (r.size > 1024) sizeStr = (r.size / 1024).toFixed(1) + ' KB';
            else sizeStr = r.size + ' B';
          }
          
          return {
            id: r.path || r.name || String(idx),
            title: r.name,
            type,
            size: sizeStr,
            timestamp: r.lastModified ? new Date(r.lastModified) : new Date(),
          };
        });
        setReports(mapped);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [prefix]);

  return { reports, loading, error };
} 