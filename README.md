# Open Weather App Next.JS: Search city temperature

[Page Url](https://open-weather-app-next.vercel.app/)

- Next.js: Frontend and create API route to call Open Weather API to safeguard API Key
- Use Upstash/Redis to implement rate limiting when calling Open Weather API from frontend
- Express: Backend JSON Restful API with CRUD endpoints
- Turso/Sqlite: Backend connects Turso to save user searching history
- Next.js calls Express to render search history on page
- Next.js call Express endpoint to delete search history
- Next.js implements Exponential/Backoff strategy for handling potential connection issues when calling Express for getting search history
  ![app diagram](./public/images/app_diagram.png 'app screenshot')

## Next.JS Project Stack

### Core Technologies

- **Next.js 15.3.3**: React framework for production
- **React 19**: Frontend library
- **TypeScript**: Type-safe JavaScript
- **TailwindCSS**: Utility-first CSS framework

### UI Components & Styling

- **Shadcn UI**: Component library built on Radix UI
- **Lucide React**: Icon library
- **Sonner**: Toast notifications

### Development Tools

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **VS Code Integration**
  - Custom `.vscode/settings.json` for consistent workspace settings

### API & Data Management

- **Upstash Redis**: Rate limiting implementation
- **Exponential Backoff**: Retry strategy for API calls
- **Country State City**: Location data utilities

### Project Features

1. **API Routes**

   - Server-side API routes for OpenWeather API integration
   - API key protection through backend routes
   - Type-safe API responses

2. **Rate Limiting**

   - Implemented using Upstash Redis
   - Protects OpenWeather API endpoints
   - Configurable rate limits

3. **Error Handling**

   - Exponential backoff strategy for API retries
   - Graceful error handling for API failures
   - Toast notifications for user feedback

4. **Component Architecture**

   - Reusable Button component
   - Modular UI components
   - Responsive design with Tailwind CSS

5. **Type Safety**
   - Full TypeScript implementation
   - Type definitions for all API responses
   - Strict type checking enabled

## [Rate Limiting in Next.js using Upstash](https://upstash.com/blog/nextjs-ratelimiting)

- [Upstash Rate Limiter in GitHub](https://github.com/upstash/ratelimit-js)
- Implemented Rate Limiter on calling Open Weather API

## Exponential/Backoff strategy for handling potential connection issues

- [exponential-backoff npm package](https://www.npmjs.com/package/exponential-backoff)

- Implemented exponential backoff on fetch searching history function

## CI/CD with Vercel

### Deployment Process

- **Automatic Deployments**: The application is automatically deployed to Vercel when changes are pushed to the main branch
