import React, { useState, useMemo } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from 'date-fns';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  reportCounts?: Record<string, number>;
  loading?: boolean;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect, reportCounts = {}, loading = false }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date();

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday as first day
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const handlePreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const isWeekend = (date: Date) => {
    const day = getDay(date);
    return day === 0 || day === 6;
  };
  const isToday = (date: Date) => isSameDay(date, today);
  const isSelected = (date: Date) => isSameDay(date, selectedDate);

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'transparent' }}>
      {/* Month/Year and Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {format(currentMonth, 'MMMM yyyy')}
        </Typography>
        <Box>
          <IconButton onClick={handlePreviousMonth} size="small" sx={{ mr: 1 }}>
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={handleNextMonth} size="small">
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      {/* Day Headers */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 1, gap: 0.5 }}>
        {dayNames.map((day, idx) => (
          <Typography key={day} align="center" sx={{ fontWeight: 500, color: idx === 5 || idx === 6 ? 'error.main' : 'text.secondary', fontSize: '0.95rem', py: 1 }}>
            {day}
          </Typography>
        ))}
      </Box>
      {/* Calendar Days */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, flex: 1, position: 'relative' }}>
        {calendarDays.map((day, idx) => {
          const inMonth = isSameMonth(day, currentMonth);
          const weekend = isWeekend(day);
          const selected = isSelected(day);
          const today = isToday(day);
          const dateKey = format(day, 'yyyy-MM-dd');
          const count = reportCounts && reportCounts[dateKey];
          // Debug log
          // console.log('Tile:', dateKey, 'Count:', count, 'reportCounts:', reportCounts);
          return (
            <Box
              key={idx}
              onClick={() => inMonth && onDateSelect(day)}
              sx={{
                aspectRatio: '1',
                width: '100%',
                height: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2,
                border: '1px solid',
                borderColor: selected
                  ? 'primary.main'
                  : inMonth
                  ? 'grey.200'
                  : 'grey.100',
                bgcolor: selected
                  ? 'primary.main'
                  : today
                  ? 'primary.light'
                  : !inMonth
                  ? 'grey.100'
                  : weekend
                  ? 'error.lighter'
                  : 'white',
                color: selected
                  ? 'white'
                  : today
                  ? 'primary.main'
                  : !inMonth
                  ? 'grey.400'
                  : weekend
                  ? 'error.main'
                  : 'text.primary',
                fontWeight: selected || today ? 700 : 500,
                fontSize: '1rem',
                cursor: inMonth ? 'pointer' : 'default',
                boxShadow: selected ? 2 : 0,
                transition: 'all 0.15s',
                '&:hover': inMonth && !selected ? { bgcolor: weekend ? 'error.light' : 'grey.50', borderColor: 'primary.light', color: weekend ? 'error.main' : undefined } : {},
                position: 'relative',
                userSelect: 'none',
                overflow: 'visible',
              }}
            >
              {day.getDate()}
              {count > 0 && (
                <Box sx={{ position: 'absolute', bottom: 6, right: 6, bgcolor: 'primary.main', color: 'white', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, boxShadow: 1, zIndex: 10, border: '2px solid #fff' }}>
                  {count}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default Calendar;
