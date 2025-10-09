import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from '../BalanceDashboard';

// Mock all hooks from useBalanceData
vi.mock('../api/hooks/useBalanceData', () => {
  return {
    useBalanceData: () => ({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    }),
    useCurrentYearByMonth: () => ({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    }),
    useLastFiveYearsByMonth: () => ({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    }),
    useCurrentYearCategorizedByMonth: () => ({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
    }),
    useCategorizedBalanceData: () => ({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
    }),
    getCurrentYearRange: () => ({ start: '2025-01-01', end: '2025-12-31' }),
  };
});

// Helper to wrap component with QueryClientProvider
const renderWithClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('Dashboard states', () => {
  it('renders header and initial prompt', () => {
    renderWithClient(<Dashboard />);
    // Use getByRole for the header to avoid duplicate text in footer
    expect(screen.getByRole('heading', { name: /Panel de Balance Eléctrico/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Visualización histórica de generación y demanda nacional/i)).toBeInTheDocument();
    expect(screen.getByText(/Selecciona un rango de fechas/i)).toBeInTheDocument();
  });
});


