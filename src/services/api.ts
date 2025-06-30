import axios from 'axios';
import { config } from '../config';

interface Report {
  name: string;
  path: string;
  lastModified: string;
  size: number;
}

// Input validation utilities
const validatePrefix = (prefix: string): boolean => {
  if (typeof prefix !== 'string' || prefix.length === 0) return false;
  // Validate date format: YYYY/MM/DD
  const datePattern = /^\d{4}\/\d{2}\/\d{2}$/;
  return datePattern.test(prefix);
};

const validateDate = (date: string): boolean => {
  if (typeof date !== 'string' || date.length === 0) return false;
  // Validate date format: YYYY-MM-DD
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  return datePattern.test(date);
};

const validateReportName = (report: string): boolean => {
  if (typeof report !== 'string' || report.length === 0) return false;
  // Validate report name (alphanumeric, dots, hyphens, underscores)
  const reportPattern = /^[a-zA-Z0-9._-]+$/;
  return reportPattern.test(report);
};

const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export async function listReports(prefix: string): Promise<Report[]> {
  const sanitizedPrefix = sanitizeString(prefix);
  
  if (!validatePrefix(sanitizedPrefix)) {
    throw new Error('Invalid prefix format. Expected YYYY/MM/DD');
  }

  try {
    const res = await axios.get(`${config.apiBaseUrl}/list-reports`, { 
      params: { prefix: sanitizedPrefix },
      timeout: config.apiTimeout,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    // Validate response structure
    if (!res.data || !Array.isArray(res.data.details)) {
      throw new Error('Invalid response format from server');
    }
    
    return res.data.details;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please try again.');
      }
      if (error.response?.status === 404) {
        throw new Error('No reports found for this date.');
      }
      if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
    }
    throw error;
  }
}

export async function getPresignedUrl(date: string, report: string): Promise<string> {
  const sanitizedDate = sanitizeString(date);
  const sanitizedReport = sanitizeString(report);
  
  if (!validateDate(sanitizedDate)) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD');
  }
  
  if (!validateReportName(sanitizedReport)) {
    throw new Error('Invalid report name format.');
  }

  try {
    const res = await axios.get(`${config.apiBaseUrl}/presigned-url`, { 
      params: { 
        date: sanitizedDate, 
        report: sanitizedReport 
      },
      timeout: config.apiTimeout,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    // Validate response structure
    if (!res.data || typeof res.data.url !== 'string') {
      throw new Error('Invalid response format from server');
    }
    
    // Validate URL format
    try {
      new URL(res.data.url);
    } catch {
      throw new Error('Invalid URL received from server');
    }
    
    return res.data.url;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please try again.');
      }
      if (error.response?.status === 404) {
        throw new Error('Report not found.');
      }
      if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
    }
    throw error;
  }
} 