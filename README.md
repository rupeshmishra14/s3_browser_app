# S3 Report Browser

A modern, responsive web application for browsing and downloading CSV reports stored in AWS S3. Features a calendar-based interface with real-time report counts and seamless download functionality.

## Features

- 📅 **Calendar Interface**: Monthly view with report count indicators
- 📊 **Real-time Counts**: Shows actual number of reports per day
- ⚡ **Fast Loading**: Smart caching and optimized API calls
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🔄 **Auto-refresh**: Cached data with 10-minute expiration
- 🎨 **Modern UI**: Material-UI components with AWS-themed colors

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **UI Library**: Material-UI (MUI)
- **Date Handling**: date-fns
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Backend**: AWS Lambda + API Gateway + S3

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=https://your-api-gateway-url.amazonaws.com
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## API Endpoints

The application expects the following API endpoints:

### List Reports
```
GET /list-reports?prefix=YYYY/MM/DD
```

### Get Presigned URL
```
GET /presigned-url?date=YYYY-MM-DD&report=filename.csv
```

## Project Structure

```
src/
├── components/
│   ├── Calendar/          # Calendar component with date selection
│   └── Reports/           # Reports list and download functionality
├── hooks/
│   ├── useCalendar.ts     # Calendar state and report count management
│   └── useReports.ts      # Reports fetching and state management
├── services/
│   ├── api.ts            # API service layer
│   └── types.ts          # TypeScript type definitions
└── App.tsx               # Main application component
```

## Performance Optimizations

- **Smart Caching**: 10-minute cache for report counts
- **Parallel API Calls**: Efficient batch loading
- **React.memo**: Prevents unnecessary re-renders
- **useCallback/useMemo**: Optimized event handlers and calculations
- **Lazy Loading**: Only fetch data when needed

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to AWS Amplify
1. Connect your repository to AWS Amplify
2. Configure build settings
3. Deploy automatically on push to main branch

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
