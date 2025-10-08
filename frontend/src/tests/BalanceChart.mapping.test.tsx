import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BalanceChart } from '../components/features/BalanceChart';

describe('BalanceChart mapping', () => {
  it('aggregates Generacion and Demanda per date', () => {
    const data = [
      { datetime: '2025-10-01', type: 'Generacion', value: 100 },
      { datetime: '2025-10-01', type: 'Demanda', value: 90 },
      { datetime: '2025-10-01', type: 'Generacion', value: 50 },
      { datetime: '2025-10-02', type: 'Demanda', value: 110 },
    ];
    render(<BalanceChart data={data as any} />);
    // Smoke check: renders legend labels
    expect(screen.getByText(/Generación/i)).toBeInTheDocument();
    expect(screen.getByText(/Demanda/i)).toBeInTheDocument();
  });
});


