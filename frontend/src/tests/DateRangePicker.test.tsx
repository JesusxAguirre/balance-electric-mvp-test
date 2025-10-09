import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DateRangePicker } from '../components/features/DateRangePicker';

describe('DateRangePicker', () => {
  it('button is disabled when dates are empty', () => {
    const onDateChange = vi.fn();
    render(<DateRangePicker onDateChange={onDateChange} />);
    const apply = screen.getByRole('button', { name: /aplicar rango/i });
    
    // Button should be disabled when no dates are selected
    expect(apply).toBeDisabled();
    expect(onDateChange).not.toHaveBeenCalled();
  });

  it('shows error when startDate is after endDate', () => {
    const onDateChange = vi.fn();
    render(<DateRangePicker onDateChange={onDateChange} />);
    const startInput = screen.getByLabelText(/Fecha de Inicio/i);
    const endInput = screen.getByLabelText(/Fecha de Fin/i);
    
    fireEvent.change(startInput, { target: { value: '2025-10-10' } });
    fireEvent.change(endInput, { target: { value: '2025-10-01' } });
    
    const apply = screen.getByRole('button', { name: /aplicar rango/i });
    fireEvent.click(apply);
    
    expect(screen.getByText(/no puede ser posterior/i)).toBeInTheDocument();
    expect(onDateChange).not.toHaveBeenCalled();
  });

  it('calls onDateChange with valid dates', () => {
    const onDateChange = vi.fn();
    render(<DateRangePicker onDateChange={onDateChange} />);
    const startInput = screen.getByLabelText(/Fecha de Inicio/i);
    const endInput = screen.getByLabelText(/Fecha de Fin/i);
    
    fireEvent.change(startInput, { target: { value: '2025-01-01' } });
    fireEvent.change(endInput, { target: { value: '2025-01-31' } });
    
    const apply = screen.getByRole('button', { name: /aplicar rango/i });
    fireEvent.click(apply);
    
    expect(onDateChange).toHaveBeenCalledWith('2025-01-01', '2025-01-31');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});


