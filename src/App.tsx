import React, { useCallback } from 'react';
import { Container, Typography, Box, CircularProgress, Paper, useTheme, Grid } from '@mui/material';
import Calendar from './components/Calendar/Calendar';
import ReportsList from './components/Reports/ReportsList';
import { useCalendar } from './hooks/useCalendar';
import { useReports } from './hooks/useReports';
import { getPresignedUrl } from './services/api';
import { format } from 'date-fns';

interface Report {
  name: string;
  path: string;
  lastModified: string;
  size: number;
}

const App: React.FC = () => {
  const { selectedDate, setSelectedDate, reportCounts, loading: calendarLoading } = useCalendar();
  const { reports, loading: reportsLoading, error } = useReports(selectedDate);
  const theme = useTheme();

  const handleDownload = useCallback(async (report: Report) => {
    if (!selectedDate) return;
    // Fix timezone issue by using local date formatting instead of toISOString()
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    try {
      const url = await getPresignedUrl(dateStr, report.name);
      window.open(url, '_blank');
    } catch (e) {
      alert('Failed to get download link');
    }
  }, [selectedDate]);

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
  }, [setSelectedDate]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth={false} sx={{ py: 3, px: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'text.primary' }}>
            S3 Report Browser
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>
            Browse and download CSV reports by date
          </Typography>
        </Box>

        {/* Main Content */}
        <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 200px)' }}>
          {/* Reports Panel - Left Side (Vertical Rectangle) */}
          <Box sx={{ width: '30%', minWidth: 300 }}>
            <Paper 
              elevation={1} 
              sx={{ 
                height: '100%', 
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Reports
                {selectedDate && (
                  <Typography component="span" variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                    ({format(selectedDate, 'MMM dd, yyyy')})
                  </Typography>
                )}
              </Typography>
              
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <ReportsList 
                  reports={reports} 
                  selectedDate={selectedDate}
                  loading={reportsLoading}
                  error={error}
                />
              </Box>
            </Paper>
          </Box>

          {/* Calendar Panel - Right Side (Square) */}
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Box sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}>
              <Paper 
                elevation={1} 
                sx={{ 
                  width: '100%',
                  height: '100%',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  aspectRatio: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid',
                  borderColor: 'divider',
                  p: 0,
                  m: 0,
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ width: '100%', height: '100%' }}>
                  <Calendar
                    onDateSelect={handleDateSelect}
                    selectedDate={selectedDate}
                    reportCounts={reportCounts}
                    loading={calendarLoading}
                  />
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default App;
