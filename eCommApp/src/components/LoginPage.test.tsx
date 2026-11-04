import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import LoginPage from './LoginPage';

const CurrentPath = () => {
    const location = useLocation();
    return <output aria-label="Current path">{location.pathname}</output>;
};

const renderLoginPage = () => render(
    <MemoryRouter
        initialEntries={['/login']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
        <CurrentPath />
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<h2>Admin portal destination</h2>} />
        </Routes>
    </MemoryRouter>
);

describe('LoginPage', () => {
    it('shows an error for invalid credentials and remains on the login page', async () => {
        const user = userEvent.setup();
        renderLoginPage();

        await user.type(screen.getByPlaceholderText('Username'), 'wrong');
        await user.type(screen.getByPlaceholderText('Password'), 'credentials');
        await user.click(screen.getByRole('button', { name: 'Login' }));

        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        expect(screen.getByLabelText('Current path')).toHaveTextContent('/login');
    });

    it('navigates to the admin page for valid credentials', async () => {
        const user = userEvent.setup();
        renderLoginPage();

        await user.type(screen.getByPlaceholderText('Username'), 'admin');
        await user.type(screen.getByPlaceholderText('Password'), 'admin');
        await user.click(screen.getByRole('button', { name: 'Login' }));

        expect(screen.getByRole('heading', { name: 'Admin portal destination' })).toBeInTheDocument();
        expect(screen.getByLabelText('Current path')).toHaveTextContent('/admin');
    });
});
