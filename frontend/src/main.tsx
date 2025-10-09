// Example: src/main.tsx or src/App.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
// 1. Import the necessary components
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './BalanceDashboard';
import './index.css';

// 2. Create a client instance outside the component tree
const queryClient = new QueryClient({
  defaultOptions: {
    
    queries: {
      retry : 5,
      // Optional: Good default setting for better UX
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  </React.StrictMode>,
);