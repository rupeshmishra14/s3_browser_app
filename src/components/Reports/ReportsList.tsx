import React, { useMemo, useCallback, useState } from 'react';
import { Box, Typography, IconButton, Snackbar, Alert } from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DownloadIcon from '@mui/icons-material/Download';
import { format } from 'date-fns';
import { getPresignedUrl } from '../../services/api';

interface ExtendedReport {
  id: string;
  title: string;
  type: string;
  size: string;
  timestamp: Date;
  path?: string;
  name?: string;
}

interface ReportsListProps {
  reports: ExtendedReport[];
  selectedDate: Date;
  loading?: boolean;
  error?: string | null;
}

const getFileIcon = (type: string) => {
  return <InsertDriveFileIcon sx={{ color: 'primary.main' }} />;
};

const ReportsList: React.FC<ReportsListProps> = ({ reports, selectedDate, loading = false, error = null }) => {
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const formatDate = useMemo(() => 
    format(selectedDate, 'EEEE, MMMM d, yyyy'), [selectedDate]
  );

  const handleDownload = useCallback(async (report: ExtendedReport) => {
    try {
      const url = await getPresignedUrl(
        format(selectedDate, 'yyyy-MM-dd'),
        report.title || report.name || ''
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = report.title || report.name || 'report';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setNotification({
        open: true,
        message: `Download started for ${report.title}`,
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: 'Download failed. Please try again.',
        severity: 'error'
      });
    }
  }, [selectedDate]);

  const handleCloseNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  return (
    <Box sx={{ width: '100%', minHeight: 400, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        Control and Reports
        <Box component="span" sx={{ fontWeight: 400, fontSize: '1rem', color: 'primary.main', ml: 1 }}>
          {reports.length > 0 && `(${reports.length})`}
        </Box>
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        {formatDate}
      </Typography>
      {loading ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'grey.400' }}>
          <Typography>Loading...</Typography>
        </Box>
      ) : error ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'error.main' }}>
          <Typography>{error}</Typography>
        </Box>
      ) : reports.length === 0 ? (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'grey.400', minHeight: 200 }}>
          <InsertDriveFileIcon sx={{ fontSize: 48, mb: 2 }} />
          <Typography>No reports available for this date</Typography>
        </Box>
      ) : (
        <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
          {reports.map((report, idx) => (
            <Box key={report.id} sx={{ border: '1px solid', borderColor: 'grey.200', borderRadius: 2, p: 2, mb: 2, bgcolor: 'grey.50', '&:hover': { bgcolor: 'grey.100' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ mr: 2 }}>{getFileIcon(report.type)}</Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 500, color: 'text.primary' }}>{report.title}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Last modified: {format(report.timestamp, 'MMM dd, yyyy HH:mm')} • Size: {report.size}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton size="small" sx={{ bgcolor: 'grey.100', '&:hover': { bgcolor: 'grey.200' } }} onClick={() => handleDownload(report)}>
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}
      
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReportsList;