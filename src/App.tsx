import React, { useCallback } from 'react';
import { Box, Paper, useMediaQuery, useTheme } from '@mui/material';
import Calendar from './components/Calendar/Calendar';
import ReportsList from './components/Reports/ReportsList';
import { useCalendar } from './hooks/useCalendar';
import { useReports } from './hooks/useReports';
import { format } from 'date-fns';

const HEADER_HEIGHT = 0;

const App: React.FC = () => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const { selectedDate, setSelectedDate, reportCounts, loading: calendarLoading } = useCalendar();
  const { reports, loading: reportsLoading, error } = useReports(selectedDate);

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
  }, [setSelectedDate]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Main Content */}
      <Box sx={{ flex: 1, height: { xs: `calc(100vh - ${HEADER_HEIGHT}px)`, md: `calc(100vh - ${HEADER_HEIGHT}px)` }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, width: '100%', maxWidth: '1600px', mx: 'auto', gap: { xs: 2, md: 2 }, pt: 2, px: 2 }}>
        {/* Reports Section */}
        <Box sx={{ width: { xs: '100%', md: '50%' }, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Paper elevation={3} sx={{ borderRadius: 3, boxShadow: 3, p: { xs: 2, md: 4 }, width: '100%', height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', bgcolor: 'white', flex: 1 }}>
            <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <ReportsList
                reports={reports}
                selectedDate={selectedDate || new Date()}
                loading={reportsLoading}
                error={error}
              />
            </Box>
          </Paper>
        </Box>
        {/* Calendar Section */}
        <Box sx={{ width: { xs: '100%', md: '50%' }, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Paper elevation={3} sx={{ borderRadius: 3, boxShadow: 3, p: { xs: 2, md: 4 }, width: '100%', height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', bgcolor: 'white', flex: 1 }}>
            <Calendar
              selectedDate={selectedDate || new Date()}
              onDateSelect={handleDateSelect}
              reportCounts={reportCounts}
              loading={calendarLoading}
            />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default App;
