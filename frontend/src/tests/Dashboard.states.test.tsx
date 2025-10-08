import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../BalanceDashboard';

vi.mock('../api/hooks/useBalanceData', () => {
  return {
    useBalanceData: () => ({
      data: undefined,
      isLoading: false,
      isError: false,
      error: new Error('')
    })
  };
});

describe('Dashboard states', () => {
  it('renders header and initial prompt', () => {
    render(<App />);
    expect(screen.getByText(/Panel de Balance Eléctrico/i)).toBeInTheDocument();
    expect(screen.getByText(/Selecciona un rango de fechas/i)).toBeInTheDocument();
  });
});


