import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AdminPage from './AdminPage';

const renderAdminPage = () => render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AdminPage />
    </MemoryRouter>
);

describe('AdminPage', () => {
    it('activates a sale for a numeric percentage', async () => {
        const user = userEvent.setup();
        renderAdminPage();

        await user.clear(screen.getByLabelText('Set Sale Percent (% off for all items):'));
        await user.type(screen.getByLabelText('Set Sale Percent (% off for all items):'), '25');
        await user.click(screen.getByRole('button', { name: 'Submit' }));

        expect(screen.getByText('All products are 25% off!')).toBeInTheDocument();
    });

    it('shows validation feedback for non-numeric input without activating a sale', async () => {
        const user = userEvent.setup();
        renderAdminPage();

        await user.clear(screen.getByLabelText('Set Sale Percent (% off for all items):'));
        await user.type(screen.getByLabelText('Set Sale Percent (% off for all items):'), 'invalid');
        await user.click(screen.getByRole('button', { name: 'Submit' }));

        expect(screen.getByText(/Invalid input/)).toBeInTheDocument();
        expect(screen.getByText('No sale active.')).toBeInTheDocument();
    });

    it('ends an active sale and resets the percentage input', async () => {
        const user = userEvent.setup();
        renderAdminPage();

        const saleInput = screen.getByLabelText('Set Sale Percent (% off for all items):');
        await user.clear(saleInput);
        await user.type(saleInput, '15');
        await user.click(screen.getByRole('button', { name: 'Submit' }));
        await user.click(screen.getByRole('button', { name: 'End Sale' }));

        expect(screen.getByText('No sale active.')).toBeInTheDocument();
        expect(saleInput).toHaveValue('0');
    });
});
