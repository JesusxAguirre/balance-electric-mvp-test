import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BalanceChart } from '../components/charts/BalanceChart';
import { EnergyType, EnergySubtype } from '../types/energy.enums';
import { describe, it, expect } from 'vitest';

describe('BalanceChart mapping', () => {
  it('renders chart with valid data', () => {
    const data = [
      { datetime: '2025-10-01', type: EnergyType.RENEWABLE, subtype: EnergySubtype.SOLAR_PHOTOVOLTAIC, value: 100 },
      { datetime: '2025-10-01', type: EnergyType.DEMAND, subtype: EnergySubtype.BC_DEMAND, value: 90 },
      { datetime: '2025-10-02', type: EnergyType.RENEWABLE, subtype: EnergySubtype.WIND, value: 50 },
      { datetime: '2025-10-02', type: EnergyType.DEMAND, subtype: EnergySubtype.BC_DEMAND, value: 110 },
    ];
    
    const { container } = render(<BalanceChart data={data} />);
    
    // Check that the card renders
    expect(container.querySelector('[data-slot="card"]')).toBeInTheDocument();
    
    // Check that it's not showing the empty state
    expect(screen.queryByText(/No hay datos/i)).not.toBeInTheDocument();
  });
  
  it('shows empty state when no data', () => {
    render(<BalanceChart data={[]} />);
    expect(screen.getByText(/No hay datos de energía para mostrar/i)).toBeInTheDocument();
  });
});


