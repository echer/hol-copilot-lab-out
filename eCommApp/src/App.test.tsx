import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

const renderAppAt = (path: string) => render(
    <MemoryRouter
        initialEntries={[path]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
        <App />
    </MemoryRouter>
);

describe('App routes', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders the home route with primary navigation and footer', () => {
        renderAppAt('/');

        expect(screen.getByRole('heading', { name: 'The Daily Harvest' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Welcome to the The Daily Harvest!' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
        expect(screen.getByRole('link', { name: 'Products' })).toHaveAttribute('href', '/products');
        expect(screen.getByRole('link', { name: 'Cart' })).toHaveAttribute('href', '/cart');
        expect(screen.getByText(/All rights reserved/)).toBeInTheDocument();
    });

    it('routes to the products page', async () => {
        vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => ({
            ok: true,
            json: async () => ({
                id: String(input).split('/').pop(),
                name: String(input).split('/').pop(),
                price: 1,
                reviews: [],
                inStock: true
            })
        } as Response));
        renderAppAt('/products');

        expect(await screen.findByRole('heading', { name: 'Our Products' })).toBeInTheDocument();
    });

    it('routes to the login page', () => {
        renderAppAt('/login');

        expect(screen.getByRole('heading', { name: 'Admin Login' })).toBeInTheDocument();
    });

    it('routes to the admin page', () => {
        renderAppAt('/admin');

        expect(screen.getByRole('heading', { name: 'Welcome to the admin portal.' })).toBeInTheDocument();
    });

    it('routes to the cart page', () => {
        renderAppAt('/cart');

        expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
    });
});
