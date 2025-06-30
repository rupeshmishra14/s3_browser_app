import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://fsii1pizs1.execute-api.us-east-1.amazonaws.com';

interface Report {
  name: string;
  path: string;
  lastModified: string;
  size: number;
}

export async function listReports(prefix: string): Promise<any> {
  const res = await axios.get(`${API_BASE_URL}/list-reports`, { params: { prefix } });
  return res.data;
}

export async function getPresignedUrl(date: string, report: string): Promise<string> {
  const res = await axios.get(`${API_BASE_URL}/presigned-url`, { params: { date, report } });
  return res.data.url;
} 