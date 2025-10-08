import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DateRangePicker } from '../components/features/DateRangePicker';

describe('DateRangePicker', () => {
  it('shows error when applying without both dates', () => {
    const onDateChange = vi.fn();
    render(<DateRangePicker onDateChange={onDateChange} />);
    const apply = screen.getByRole('button', { name: /aplicar rango/i });
    fireEvent.click(apply);
    expect(screen.getByText(/Debes seleccionar ambas fechas/i)).toBeInTheDocument();
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
});


