import React, { useCallback } from 'react'
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Button, 
  CircularProgress,
  Alert,
  Chip,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material'
import { Download as DownloadIcon } from '@mui/icons-material'
import { format } from 'date-fns'
import { getPresignedUrl } from '../../services/api'

interface Report {
  name: string
  path: string
  lastModified: string
  size: number
}

interface ReportsListProps {
  reports: Report[]
  selectedDate: Date | null
  loading?: boolean
  error?: string | null
}

const ReportsList: React.FC<ReportsListProps> = ({ 
  reports, 
  selectedDate, 
  loading = false, 
  error = null 
}) => {
  const handleDownload = useCallback(async (report: Report) => {
    try {
      const url = await getPresignedUrl(
        format(selectedDate!, 'yyyy-MM-dd'),
        report.name
      )
      
      const link = document.createElement('a')
      link.href = url
      link.download = report.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Download failed. Please try again.')
    }
  }, [selectedDate])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress size={24} />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    )
  }

  if (!selectedDate) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%',
        color: 'text.secondary',
        textAlign: 'center',
        px: 2
      }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Select a date from the calendar
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          to view available reports
        </Typography>
      </Box>
    )
  }

  if (reports.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%',
        color: 'text.secondary',
        textAlign: 'center',
        px: 2
      }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          No reports found for
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {format(selectedDate, 'MMM dd, yyyy')}
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ 
        mb: 2, 
        pb: 2, 
        borderBottom: '1px solid', 
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {reports.length} report{reports.length !== 1 ? 's' : ''} found
        </Typography>
        <Chip 
          label={format(selectedDate, 'MMM dd')} 
          size="small" 
          variant="outlined"
          sx={{ fontSize: '0.75rem' }}
        />
      </Box>
      
      {/* Reports List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List sx={{ p: 0 }}>
          {reports.map((report, index) => (
            <React.Fragment key={report.path}>
              <ListItem 
                sx={{ 
                  px: 0, 
                  py: 1.5,
                  '&:hover': {
                    bgcolor: 'action.hover',
                    borderRadius: 1
                  }
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
                        {report.name}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {format(new Date(report.lastModified), 'MMM dd, HH:mm')}
                      </Typography>
                      <Chip 
                        label={formatFileSize(report.size)} 
                        size="small" 
                        variant="outlined"
                        sx={{ 
                          fontSize: '0.625rem', 
                          height: 20,
                          '& .MuiChip-label': {
                            px: 1
                          }
                        }}
                      />
                    </Box>
                  }
                  sx={{ mr: 1 }}
                />
                <Tooltip title="Download report">
                  <IconButton
                    size="small"
                    onClick={() => handleDownload(report)}
                    sx={{ 
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'primary.light',
                        color: 'primary.contrastText'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </ListItem>
              {index < reports.length - 1 && (
                <Divider sx={{ mx: 2 }} />
              )}
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Box>
  )
}

export default ReportsList