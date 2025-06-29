# S3 Report Browser Web Application - Technical Document

## Project Overview

This document outlines the complete technical architecture and implementation plan for building a user-friendly web application to browse and download CSV reports stored in AWS S3. The application will feature a calendar-based interface where users can view reports by date and download them seamlessly.

## Current State Analysis

### Existing Backend Infrastructure
- **Lambda Function**: Already implemented with two endpoints
  - `/list-reports` - Lists CSV files for a given date prefix
  - `/presigned-url` - Generates download URLs for specific reports
- **API Gateway**: Configured at `https://fsii1pizs1.execute-api.us-east-1.amazonaws.com`
- **S3 Bucket**: `s3-browser-report` with reports stored in `YYYY/MM/DD/report.csv` format

### API Endpoints Documentation

#### 1. List Reports Endpoint
```
GET /list-reports?prefix=2025/06/29
```

**Response:**
```json
{
  "reports": ["today_report.csv"],
  "prefix": "2025/06/29",
  "details": [
    {
      "name": "today_report.csv",
      "path": "2025/06/29/today_report.csv",
      "lastModified": "2025-06-29T09:44:39.000Z",
      "size": 0
    }
  ],
  "debug": {
    "bucket": "s3-browser-report",
    "fullPrefix": "2025/06/29",
    "totalFiles": 1,
    "timestamp": "2025-06-29T13:36:29.000Z"
  }
}
```

#### 2. Presigned URL Endpoint
```
GET /presigned-url?date=2025-06-29&report=report_name.csv
```

**Response:**
```json
{
  "name": "report_name.csv",
  "path": "2025/06/29/report_name.csv",
  "url": "https://s3-browser-report.s3.us-east-1.amazonaws.com/..."
}
```

## Frontend Application Architecture

### Technology Stack
- **Framework**: React.js with TypeScript
- **UI Library**: Material-UI (MUI) for modern, responsive design
- **State Management**: React Context API or Zustand
- **HTTP Client**: Axios for API calls
- **Date Handling**: date-fns for calendar functionality
- **Build Tool**: Vite for fast development and building
- **Hosting**: AWS Amplify

### Application Structure

```
src/
├── components/
│   ├── Calendar/
│   │   ├── Calendar.tsx
│   │   ├── CalendarDay.tsx
│   │   └── CalendarHeader.tsx
│   ├── Reports/
│   │   ├── ReportsList.tsx
│   │   ├── ReportCard.tsx
│   │   └── DownloadButton.tsx
│   ├── Layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── LoadingSpinner.tsx
│   └── Common/
│       ├── ErrorBoundary.tsx
│       └── Toast.tsx
├── services/
│   ├── api.ts
│   └── types.ts
├── hooks/
│   ├── useReports.ts
│   └── useCalendar.ts
├── utils/
│   ├── dateUtils.ts
│   └── formatters.ts
├── contexts/
│   └── AppContext.tsx
└── pages/
    ├── Dashboard.tsx
    └── ReportsView.tsx
```

## Core Features Implementation

### 1. Calendar Interface

#### Calendar Component Design
```typescript
interface CalendarProps {
  onDateSelect: (date: Date) => void;
  selectedDate: Date | null;
  reportCounts: Record<string, number>;
}

interface CalendarDayProps {
  date: Date;
  isSelected: boolean;
  reportCount: number;
  onClick: () => void;
}
```

#### Key Features:
- Monthly calendar view with navigation
- Visual indicators showing report count per day
- Hover effects and click interactions
- Responsive design for mobile and desktop

### 2. Reports List View

#### Reports List Component
```typescript
interface Report {
  name: string;
  path: string;
  lastModified: string;
  size: number;
}

interface ReportsListProps {
  reports: Report[];
  selectedDate: Date;
  onDownload: (report: Report) => void;
}
```

#### Features:
- Grid/list view toggle
- Report metadata display (name, size, last modified)
- Download buttons with progress indicators
- Search and filter functionality
- Sort by name, date, or size

### 3. Download Functionality

#### Download Service
```typescript
class DownloadService {
  async getPresignedUrl(date: string, reportName: string): Promise<string>
  async downloadReport(url: string, filename: string): Promise<void>
  async getReportCount(date: string): Promise<number>
}
```

#### Features:
- Automatic presigned URL generation
- Progress tracking for large files
- Error handling and retry logic
- File type validation

## Data Flow Architecture

### 1. Application State Management
```typescript
interface AppState {
  selectedDate: Date | null;
  reports: Report[];
  loading: boolean;
  error: string | null;
  reportCounts: Record<string, number>;
}
```

### 2. API Integration Layer
```typescript
class ReportsAPI {
  private baseURL = 'https://fsii1pizs1.execute-api.us-east-1.amazonaws.com';
  
  async listReports(date: Date): Promise<Report[]>
  async getPresignedUrl(date: string, report: string): Promise<string>
  async getMonthlyReportCounts(year: number, month: number): Promise<Record<string, number>>
}
```

### 3. Custom Hooks
```typescript
// useReports.ts
export const useReports = (date: Date | null) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Implementation for fetching and managing reports
};

// useCalendar.ts
export const useCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [reportCounts, setReportCounts] = useState<Record<string, number>>({});
  
  // Implementation for calendar state management
};
```

## UI/UX Design Specifications

### 1. Color Scheme
- **Primary**: AWS Blue (#FF9900)
- **Secondary**: Dark Blue (#232F3E)
- **Background**: Light Gray (#F8F9FA)
- **Text**: Dark Gray (#333333)
- **Accent**: Green (#28A745) for success states

### 2. Layout Structure
```
┌─────────────────────────────────────────┐
│ Header (Logo, Title, User Info)         │
├─────────────────────────────────────────┤
│ Sidebar | Main Content Area             │
│ (Month   | Calendar View                │
│  Nav)    | or Reports List              │
│          |                              │
│          |                              │
└─────────────────────────────────────────┘
```

### 3. Responsive Design
- **Desktop**: Full calendar view with sidebar
- **Tablet**: Compact calendar with collapsible sidebar
- **Mobile**: Month view with bottom navigation

## Performance Optimizations

### 1. Data Caching
- Implement React Query for API response caching
- Cache report counts for 1 hour
- Cache presigned URLs for 15 minutes

### 2. Lazy Loading
- Load reports only when date is selected
- Implement virtual scrolling for large report lists
- Lazy load calendar months

### 3. Bundle Optimization
- Code splitting by routes
- Tree shaking for unused components
- Image optimization and compression

## Error Handling Strategy

### 1. API Error Handling
```typescript
interface APIError {
  status: number;
  message: string;
  code?: string;
}

const handleAPIError = (error: APIError) => {
  switch (error.status) {
    case 404:
      return 'No reports found for this date';
    case 500:
      return 'Server error. Please try again later';
    default:
      return 'An unexpected error occurred';
  }
};
```

### 2. User Feedback
- Toast notifications for success/error states
- Loading skeletons for better UX
- Retry mechanisms for failed downloads
- Offline detection and handling

## Security Considerations

### 1. CORS Configuration
- Configure Amplify to allow API Gateway requests
- Implement proper CORS headers in Lambda
- Validate origin domains

### 2. Data Validation
- Sanitize user inputs
- Validate date formats
- Check file extensions before download

### 3. Rate Limiting
- Implement client-side rate limiting
- Add exponential backoff for retries
- Monitor API usage

## Deployment Strategy

### 1. AWS Amplify Setup
```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### 2. Environment Configuration
```typescript
// config.ts
export const config = {
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'https://fsii1pizs1.execute-api.us-east-1.amazonaws.com',
  environment: process.env.NODE_ENV || 'development',
  maxRetries: 3,
  cacheTimeout: 3600000, // 1 hour
};
```

### 3. CI/CD Pipeline
- GitHub integration with Amplify
- Automatic deployments on main branch
- Preview deployments for pull requests
- Environment-specific configurations

## Testing Strategy

### 1. Unit Tests
- Component testing with React Testing Library
- Hook testing with custom test utilities
- API service mocking

### 2. Integration Tests
- End-to-end testing with Playwright
- API integration testing
- Cross-browser compatibility

### 3. Performance Testing
- Lighthouse audits
- Bundle size monitoring
- API response time tracking

## Monitoring and Analytics

### 1. Application Monitoring
- Error tracking with Sentry
- Performance monitoring with AWS X-Ray
- User analytics with Google Analytics

### 2. API Monitoring
- CloudWatch metrics for Lambda
- API Gateway usage tracking
- S3 access logging

## Future Enhancements

### 1. Advanced Features
- Report preview functionality
- Bulk download capabilities
- Report sharing via email
- Advanced search and filtering

### 2. Performance Improvements
- Server-side pagination
- Real-time updates with WebSockets
- Progressive Web App (PWA) features

### 3. User Experience
- Dark mode support
- Customizable dashboard
- Keyboard shortcuts
- Accessibility improvements

## Development Timeline

### Phase 1: Core Infrastructure (Week 1-2)
- [ ] Set up React project with TypeScript
- [ ] Configure AWS Amplify
- [ ] Implement basic API integration
- [ ] Create project structure

### Phase 2: Calendar Implementation (Week 3-4)
- [ ] Build calendar component
- [ ] Implement date selection logic
- [ ] Add report count indicators
- [ ] Create responsive design

### Phase 3: Reports Management (Week 5-6)
- [ ] Build reports list component
- [ ] Implement download functionality
- [ ] Add search and filter features
- [ ] Error handling and loading states

### Phase 4: Polish and Deploy (Week 7-8)
- [ ] UI/UX refinements
- [ ] Performance optimization
- [ ] Testing and bug fixes
- [ ] Production deployment

## Conclusion

This technical document provides a comprehensive roadmap for building the S3 Report Browser Web Application. The architecture leverages your existing Lambda backend while creating a modern, user-friendly frontend interface. The calendar-based approach will provide an intuitive way for users to browse and download reports, with robust error handling and performance optimizations.

The project can be developed incrementally, with each phase building upon the previous one. The use of AWS Amplify for hosting ensures seamless integration with your existing AWS infrastructure while providing excellent developer experience and deployment capabilities. 