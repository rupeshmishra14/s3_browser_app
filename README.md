# S3 Report Browser

A modern, secure React application for browsing and downloading CSV reports stored in AWS S3. Features a calendar-based interface with real-time report counts and seamless download functionality.

## 🚀 Features

- **Calendar Interface**: Monthly view with visual report count indicators
- **Real-time Data**: Live report counts with intelligent caching
- **Secure Downloads**: Presigned URL-based file downloads
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Performance Optimized**: Efficient caching and lazy loading

## 🛡️ Security Features

- **Content Security Policy (CSP)**: Prevents XSS and injection attacks
- **Input Validation**: Comprehensive sanitization of all user inputs
- **Secure Headers**: X-Frame-Options, X-Content-Type-Options, etc.
- **Error Boundaries**: Graceful error handling without exposing sensitive data
- **Type Safety**: Full TypeScript implementation for runtime safety

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd s3_browser_app

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔧 Configuration

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=https://your-api-gateway-url.amazonaws.com

# Environment
NODE_ENV=development

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_MODE=false
```

## 🚀 Production Deployment

### Build for Production

```bash
# Build the application
npm run build:prod

# Preview the build
npm run preview
```

### Deployment Options

#### AWS Amplify (Recommended)

1. Connect your repository to AWS Amplify
2. Configure build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build:prod
     artifacts:
       baseDirectory: dist
       files:
         - '**/*'
   ```

#### Static Hosting (Netlify, Vercel, etc.)

1. Build the application: `npm run build:prod`
2. Deploy the `dist` folder to your hosting provider
3. Configure environment variables in your hosting platform

#### Docker Deployment

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build:prod

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🧪 Development

```bash
# Development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Bundle analysis
npm run analyze
```

## 📊 Performance Optimizations

- **Code Splitting**: Automatic chunk splitting for better loading times
- **Tree Shaking**: Unused code elimination
- **Caching**: Intelligent API response caching (30 minutes)
- **Lazy Loading**: Components loaded on demand
- **Bundle Optimization**: Manual chunk configuration for vendor libraries

## 🔍 Monitoring & Analytics

### Error Tracking

The application includes error boundaries and logging utilities. For production, consider integrating:

- **Sentry**: For error tracking and performance monitoring
- **Google Analytics**: For user behavior analytics
- **AWS CloudWatch**: For API monitoring

### Performance Monitoring

```bash
# Analyze bundle size
npm run analyze

# Lighthouse audit
npx lighthouse http://localhost:3000 --output html
```

## 🛠️ API Integration

The application expects the following API endpoints:

### List Reports
```
GET /list-reports?prefix=YYYY/MM/DD
```

### Get Presigned URL
```
GET /presigned-url?date=YYYY-MM-DD&report=filename.csv
```

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env` files to version control
- Use different API endpoints for development and production
- Rotate API keys regularly

### Content Security Policy
The application includes a strict CSP that:
- Prevents XSS attacks
- Restricts resource loading to trusted sources
- Blocks inline scripts and styles

### Input Validation
All user inputs are validated and sanitized:
- Date format validation (YYYY/MM/DD, YYYY-MM-DD)
- Report name validation (alphanumeric, dots, hyphens, underscores)
- HTML entity encoding

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation as needed
4. Ensure all security checks pass

## 📞 Support

For support and questions, please contact the development team.
