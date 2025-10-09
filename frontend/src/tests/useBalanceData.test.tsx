/**
 * Test Suite: useBalanceData Hook
 * 
 * Tests the React Query custom hook for fetching balance data.
 * Uses MSW (Mock Service Worker) pattern to simulate API responses.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBalanceData } from '../api/hooks/useBalanceData';
import type { ReactNode } from 'react';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Create a wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, 
      },
    },
  });
  
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useBalanceData Hook', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('returns loading state initially', () => {
    mockFetch.mockImplementation(() => 
      new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(
      () => useBalanceData('2024-01-01', '2024-01-31'),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('successfully fetches and transforms data (HTTP 200)', async () => {
    const mockResponse = [
      {
        id: 1,
        date: '2024-01-01T00:00:00.000Z',
        type: 'GENERATION',
        subtype: 'SOLAR',
        value: 1500.5,
      },
      {
        id: 2,
        date: '2024-01-02T00:00:00.000Z',
        type: 'DEMAND',
        subtype: 'DEMAND_TOTAL',
        value: 2000.0,
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(
      () => useBalanceData('2024-01-01', '2024-01-31'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0]).toEqual({
      datetime: '2024-01-01',
      type: 'GENERATION',
      subtype: 'SOLAR',
      value: 1500.5,
    });
    expect(result.current.isError).toBe(false);
  });

  it('handles empty data response (HTTP 200 with empty array)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const { result } = renderHook(
      () => useBalanceData('2024-01-01', '2024-01-31'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
    expect(result.current.isError).toBe(false);
  });

  it.skip('handles server error (HTTP 500)', async () => {
   
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
      json: async () => { throw new Error('Not JSON'); },
    } as any);

    const { result } = renderHook(
      () => useBalanceData('2024-01-01', '2024-01-31'),
      { wrapper: createWrapper() }
    );

    await waitFor(
      () => {
        expect(result.current.isError).toBe(true);
      },
      { timeout: 3000 }
    );

    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toContain('500');
    expect(result.current.data).toBeUndefined();
  });

  it('does not fetch when dates are empty (disabled query)', () => {
    const { result } = renderHook(
      () => useBalanceData('', ''),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('transforms aggregated data correctly (with time_grouping)', async () => {
    const mockAggregatedResponse = [
      {
        timeGroup: '2024-01',
        type: 'GENERATION',
        subtype: 'SOLAR',
        totalValue: 45000,
      },
      {
        timeGroup: '2024-02',
        type: 'GENERATION',
        subtype: 'SOLAR',
        totalValue: 48000,
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAggregatedResponse,
    });

    const { result } = renderHook(
      () => useBalanceData('2024-01-01', '2024-12-31', { time_grouping: 'month' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0]).toEqual({
      datetime: '2024-01-01', // Should append '-01' for monthly data
      type: 'GENERATION',
      subtype: 'SOLAR',
      value: 45000,
    });
  });

  it('includes query parameters in the fetch URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderHook(
      () => useBalanceData('2024-01-01', '2024-01-31', { 
        type: 'GENERATION' as any,
        subtype: 'SOLAR' as any,
        time_grouping: 'month' 
      }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(mockFetch).toHaveBeenCalled());

    const calledUrl = mockFetch.mock.calls[0][0];
    expect(calledUrl).toContain('start_date=2024-01-01');
    expect(calledUrl).toContain('end_date=2024-01-31');
    expect(calledUrl).toContain('type=GENERATION');
    expect(calledUrl).toContain('subtype=SOLAR');
    expect(calledUrl).toContain('time_grouping=month');
  });
});
