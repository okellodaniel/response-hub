# Response Hub - Adverse News Search Application

## Project Overview

Response Hub is a React-based application for managing and searching adverse news records. The application integrates with an external Adverse News Extraction API to perform searches and display results.

## Features

- **User Authentication**: Secure login and session management
- **Adverse News Search**: Search for adverse news using name parameters
- **Search Management**: View, filter, and manage search records
- **Real-time Results**: Display search results with relevance scores
- **Responsive UI**: Modern interface built with shadcn-ui and Tailwind CSS

## API Integration

The application integrates with the **Adverse News Extraction API** (http://localhost:8000/) with the following endpoints:

### Available Endpoints
- `POST /api/v1/adverse-news/search` - Initiate a new adverse news search
- `GET /api/v1/adverse-news/searches` - Retrieve list of searches with pagination
- `GET /api/v1/adverse-news/search/{id}` - Get detailed search results by ID

### API Client
The API integration is implemented in [`src/integrations/adverse-news-api/client.ts`](src/integrations/adverse-news-api/client.ts) with:
- Type-safe request/response interfaces
- Error handling
- Data transformation utilities
- Singleton client instance

## Project Structure

```
src/
├── components/           # Reusable UI components
├── contexts/            # React contexts (Auth, Search)
├── integrations/        # API clients
│   ├── adverse-news-api/ # External API integration
│   └── supabase/        # Supabase integration
├── pages/               # Application pages
├── types/               # TypeScript type definitions
└── lib/                 # Utility functions
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- External Adverse News API running on http://localhost:8000/

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd response-hub

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Environment Variables

Create a `.env` file with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key

# External API (optional - defaults to http://localhost:8000/)
VITE_ADVERSE_NEWS_API_URL=http://localhost:8000
```

## Docker Deployment

The application can be containerized using Docker for consistent deployment across environments.

### Prerequisites
- Docker and Docker Compose installed

### Building and Running with Docker

#### Production Build
```sh
# Build the Docker image
docker build -t response-hub:latest .

# Run the container
docker run -p 8080:80 --env-file .env response-hub:latest
```

#### Using Docker Compose
```sh
# Start production container
docker-compose up -d app

# Start development container with hot reload
docker-compose up dev

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

#### Development with Docker
For development with hot reload:
```sh
docker-compose up dev
```
The application will be available at http://localhost:5173

#### Production with Docker Compose
```sh
docker-compose up -d app
```
The application will be available at http://localhost:8080

### Docker Configuration Files
- [`Dockerfile`](Dockerfile) - Production multi-stage build
- [`Dockerfile.dev`](Dockerfile.dev) - Development build with hot reload
- [`docker-compose.yml`](docker-compose.yml) - Orchestration for development and production
- [`nginx.conf`](nginx.conf) - Nginx configuration for serving static files
- [`.dockerignore`](.dockerignore) - Files to exclude from Docker build context

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Key Components

1. **SearchContext** ([`src/contexts/SearchContext.tsx`](src/contexts/SearchContext.tsx)) - Manages search state and API interactions
2. **SearchTable** ([`src/components/SearchTable.tsx`](src/components/SearchTable.tsx)) - Displays search records with pagination
3. **RecordDetailsSheet** ([`src/components/RecordDetailsSheet.tsx`](src/components/RecordDetailsSheet.tsx)) - Shows detailed search results
4. **AddSearchDialog** ([`src/components/AddSearchDialog.tsx`](src/components/AddSearchDialog.tsx)) - Form for initiating new searches

## API Usage Example

```typescript
import { adverseNewsApi } from '@/integrations/adverse-news-api/client';

// Initiate a search
const response = await adverseNewsApi.searchAdverseNews({
  surname: 'Smith',
  given_name: 'John',
  other_name: 'Doe'
});

// Get search results
const results = await adverseNewsApi.getSearchResultById(response.id);

// List searches with pagination
const searches = await adverseNewsApi.getSearches({
  page: 1,
  limit: 10
});
```

## Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: shadcn-ui, Tailwind CSS
- **State Management**: React Context, React Query
- **API Integration**: Fetch API with TypeScript interfaces
- **Routing**: React Router DOM
- **Authentication**: Supabase Auth

## License

This project is part of the Lovable platform.
