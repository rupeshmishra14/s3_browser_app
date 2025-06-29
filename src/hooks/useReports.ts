import { useState, useEffect } from 'react';
import { listReports } from '../services/api';
import { format } from 'date-fns';

interface Report {
  id: string;
  title: string;
  type: string;
  size: string;
  timestamp: Date;
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
      .then((apiReports) => {
        const mapped = apiReports.map((r: any, idx: number) => {
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
  }, [selectedDate]);

  return { reports, loading, error };
} 