import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ProductsPage from './ProductsPage';
import { CartContext } from '../context/CartContext';
import type { Product } from '../types';

const productsByFile: Record<string, Product> = {
    'apple.json': {
        id: 'apple',
        name: 'Apple',
        price: 1.5,
        description: 'Crisp apple',
        image: 'apple.png',
        reviews: [],
        inStock: true
    },
    'grapes.json': {
        id: 'grapes',
        name: 'Grapes',
        price: 4,
        image: 'grapes.png',
        reviews: [],
        inStock: false
    },
    'orange.json': {
        id: 'orange',
        name: 'Orange',
        price: 3.25,
        image: 'orange.png',
        reviews: [{ author: 'Sam', comment: 'Juicy', date: '2025-01-01T00:00:00.000Z' }],
        inStock: true
    },
    'pear.json': {
        name: 'Pear',
        price: 2,
        reviews: [],
        inStock: true
    }
};

const addToCart = vi.fn();
const cartContext = {
    cartItems: [],
    addToCart,
    clearCart: vi.fn()
};

const renderProductsPage = () => render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <CartContext.Provider value={cartContext}>
            <ProductsPage />
        </CartContext.Provider>
    </MemoryRouter>
);

const mockSuccessfulProductFetch = () => vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const fileName = String(input).split('/').pop() ?? '';
    return {
        ok: true,
        json: async () => productsByFile[fileName]
    } as Response;
});

describe('ProductsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('loads and displays products and their optional details', async () => {
        mockSuccessfulProductFetch();
        renderProductsPage();

        expect(screen.getByText('Loading products...')).toBeInTheDocument();
        expect(await screen.findByRole('heading', { name: 'Our Products' })).toBeInTheDocument();
        expect(screen.getByText('Crisp apple')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Pear' })).toBeInTheDocument();
        expect(screen.getAllByRole('img')).toHaveLength(3);
    });

    it('ends loading and logs an error if a product request fails', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => ({
            ok: !String(input).endsWith('apple.json'),
            json: async () => productsByFile[String(input).split('/').pop() ?? '']
        } as Response));
        renderProductsPage();

        expect(await screen.findByRole('heading', { name: 'Our Products' })).toBeInTheDocument();
        expect(screen.queryByText('Loading products...')).not.toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: 'Apple' })).not.toBeInTheDocument();
        expect(console.error).toHaveBeenCalledWith(
            'Error loading products:',
            expect.objectContaining({ message: 'Failed to load apple.json' })
        );
    });

    it('throws a clear error when rendered without a cart provider', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

        try {
            expect(() => render(
                <MemoryRouter>
                    <ProductsPage />
                </MemoryRouter>
            )).toThrow('CartContext must be used within a CartProvider');
        } finally {
            consoleError.mockRestore();
        }
    });

    it('adds an in-stock item to the cart and disables out-of-stock items', async () => {
        const user = userEvent.setup();
        mockSuccessfulProductFetch();
        renderProductsPage();

        await screen.findByRole('heading', { name: 'Our Products' });
        const appleCard = screen.getByRole('heading', { name: 'Apple' }).closest('.product-card');
        if (!(appleCard instanceof HTMLElement)) throw new Error('Apple product card was not rendered');
        const appleButton = within(appleCard).getByRole('button', { name: 'Add to Cart' });
        await user.click(appleButton);

        expect(addToCart).toHaveBeenCalledWith(productsByFile['apple.json']);
        expect(screen.getByRole('button', { name: 'Out of Stock' })).toBeDisabled();
        expect(addToCart).toHaveBeenCalledOnce();
    });

    it('submits a review for the selected product and closes the review dialog', async () => {
        const user = userEvent.setup();
        mockSuccessfulProductFetch();
        renderProductsPage();

        await screen.findByRole('heading', { name: 'Our Products' });
        await user.click(screen.getByRole('img', { name: 'Apple' }));
        expect(screen.getByRole('heading', { name: 'Reviews for Apple' })).toBeInTheDocument();
        expect(screen.getByText('No reviews yet.')).toBeInTheDocument();

        await user.type(screen.getByPlaceholderText('Your name'), 'Alex');
        await user.type(screen.getByPlaceholderText('Your review'), 'Fresh and tasty');
        await user.click(screen.getByRole('button', { name: 'Submit' }));

        expect(screen.getByText('Alex')).toBeInTheDocument();
        expect(screen.getByText('Fresh and tasty')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Close' }));
        expect(screen.queryByRole('heading', { name: 'Reviews for Apple' })).not.toBeInTheDocument();
    });

    it('renders existing reviews and closes the dialog when the backdrop is clicked', async () => {
        mockSuccessfulProductFetch();
        renderProductsPage();

        await screen.findByRole('heading', { name: 'Our Products' });
        fireEvent.click(screen.getByRole('img', { name: 'Orange' }));

        expect(screen.getByRole('heading', { name: 'Reviews for Orange' })).toBeInTheDocument();
        expect(screen.getByText('Juicy')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Reviews for Orange').parentElement!.parentElement!);
        await waitFor(() => {
            expect(screen.queryByRole('heading', { name: 'Reviews for Orange' })).not.toBeInTheDocument();
        });
    });
});
