import React, { useState, useMemo } from 'react'
import { 
  Box, 
  Typography, 
  IconButton, 
  Paper,
  CircularProgress
} from '@mui/material'
import { 
  ChevronLeft as ChevronLeftIcon, 
  ChevronRight as ChevronRightIcon 
} from '@mui/icons-material'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay
} from 'date-fns'

interface CalendarProps {
  onDateSelect: (date: Date) => void
  selectedDate: Date | null
  reportCounts: Record<string, number>
  loading?: boolean
}

const GRID_COLS = 7;
const CELL_GAP = 0.02; // 2% of grid size

const Calendar: React.FC<CalendarProps> = ({ 
  onDateSelect, 
  selectedDate, 
  reportCounts, 
  loading = false 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const today = new Date();

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }) // Monday as first day
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentMonth])

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const handleDateClick = (date: Date) => {
    onDateSelect(date)
  }

  const getReportCount = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd')
    return reportCounts[dateKey] || 0
  }

  const isWeekend = (date: Date) => {
    const day = getDay(date)
    return day === 0 || day === 6 // Sunday or Saturday
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress size={40} />
      </Box>
    )
  }

  // Responsive grid size: min(90vw, 90vh - 120px)
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        maxWidth: 'min(90vw, 90vh - 120px)',
        maxHeight: 'min(90vw, 90vh - 120px)',
        aspectRatio: '1',
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Today's Date in Big Bold Font */}
      <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1, textAlign: 'center' }}>
        {format(today, 'MMM dd, yyyy')}
      </Typography>
      {/* Calendar Header (Month/Year Navigation) */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        mb: 2,
        width: '100%'
      }}>
        <IconButton onClick={handlePreviousMonth} size="small">
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>
          {format(currentMonth, 'MMMM yyyy')}
        </Typography>
        <IconButton onClick={handleNextMonth} size="small">
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* Day Headers */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(7, 1fr)`,
          width: '100%',
          mb: 1,
          gap: `${CELL_GAP * 100}%`
        }}
      >
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
          <Box
            key={day}
            sx={{
              aspectRatio: '1',
              width: '100%',
              height: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: index === 5 || index === 6 ? 'error.main' : 'text.secondary',
              fontWeight: 600,
              fontSize: '0.95rem',
              textTransform: 'uppercase',
              letterSpacing: 1
            }}
          >
            {day}
          </Box>
        ))}
      </Box>

      {/* Calendar Days Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(7, 1fr)`,
          gridTemplateRows: `repeat(${calendarDays.length / 7}, 1fr)`,
          width: '100%',
          height: '100%',
          gap: `${CELL_GAP * 100}%`
        }}
      >
        {calendarDays.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const reportCount = getReportCount(day)
          const weekend = isWeekend(day)
          return (
            <Paper
              key={index}
              elevation={isSelected ? 2 : 0}
              sx={{
                width: '100%',
                height: '100%',
                aspectRatio: '1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isCurrentMonth ? 'pointer' : 'default',
                border: '1px solid',
                borderColor: isSelected ? 'primary.main' : 'divider',
                bgcolor: isSelected
                  ? 'primary.light'
                  : weekend
                  ? 'action.hover'
                  : 'background.paper',
                color: isCurrentMonth
                  ? weekend
                    ? 'error.main'
                    : 'text.primary'
                  : 'text.disabled',
                '&:hover': isCurrentMonth
                  ? {
                      bgcolor: isSelected
                        ? 'primary.light'
                        : weekend
                        ? 'error.light'
                        : 'action.hover',
                      borderColor: 'primary.main',
                    }
                  : {},
                transition: 'all 0.2s ease',
                position: 'relative',
                boxSizing: 'border-box',
                m: 0
              }}
              onClick={() => isCurrentMonth && handleDateClick(day)}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: isSelected ? 600 : weekend ? 600 : 400,
                  fontSize: '1rem',
                }}
              >
                {format(day, 'd')}
              </Typography>
              {reportCount > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    bgcolor: 'primary.main',
                    color: 'white',
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  {reportCount}
                </Box>
              )}
            </Paper>
          )
        })}
      </Box>
    </Box>
  )
}

export default Calendar