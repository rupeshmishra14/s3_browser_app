import React, { useCallback, useMemo } from 'react';
import { Box, Paper } from '@mui/material';
import Calendar from './components/Calendar/Calendar';
import ReportsList from './components/Reports/ReportsList';
import { useCalendar } from './hooks/useCalendar';
import { useReports } from './hooks/useReports';

const App: React.FC = () => {
  const { selectedDate, setSelectedDate, reportCounts } = useCalendar();
  const { reports, loading: reportsLoading, error } = useReports(selectedDate);

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
  }, [setSelectedDate]);

  const selectedDateForDisplay = useMemo(() => selectedDate || new Date(), [selectedDate]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Main Content */}
      <Box sx={{ flex: 1, height: { xs: '100vh', md: '100vh' }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, width: '100%', maxWidth: '1600px', mx: 'auto', gap: { xs: 2, md: 2 }, pt: 2, px: 2 }}>
        {/* Reports Section */}
        <Box sx={{ width: { xs: '100%', md: '50%' }, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Paper elevation={3} sx={{ borderRadius: 3, boxShadow: 3, p: { xs: 2, md: 4 }, width: '100%', height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', bgcolor: 'white', flex: 1 }}>
            <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <ReportsList
                reports={reports}
                selectedDate={selectedDateForDisplay}
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
              selectedDate={selectedDateForDisplay}
              onDateSelect={handleDateSelect}
              reportCounts={reportCounts}
            />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default App;
