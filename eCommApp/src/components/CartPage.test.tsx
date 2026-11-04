import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import CartPage from './CartPage';
import { CartContext, CartItem } from '../context/CartContext';

// Mock components
vi.mock('./Header', () => ({
    default: () => <div data-testid="header">Header</div>
}));

vi.mock('./Footer', () => ({
    default: () => <div data-testid="footer">Footer</div>
}));

const mockCartItems: CartItem[] = [
    {
        id: '1',
        name: 'Test Product 1',
        price: 29.99,
        quantity: 2,
        image: 'test1.jpg',
        reviews: [],
        inStock: true
    },
    {
        id: '2',
        name: 'Test Product 2',
        price: 49.99,
        quantity: 1,
        image: 'test2.jpg',
        reviews: [],
        inStock: true
    }
];

const mockCartContext = {
    cartItems: mockCartItems,
    addToCart: vi.fn(),
    clearCart: vi.fn()
};

const renderWithCartContext = (cartContext = mockCartContext) => {
    return render(
        <CartContext.Provider value={cartContext}>
            <CartPage />
        </CartContext.Provider>
    );
};

describe('CartPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('displays cart items when cart has items', () => {
        renderWithCartContext();
        
        expect(screen.getByText('Your Cart')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Checkout' })).toBeVisible();
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
        expect(screen.getByText('Test Product 2')).toBeInTheDocument();
        expect(screen.getByText('Price: $29.99')).toBeInTheDocument();
        expect(screen.getByText('Price: $49.99')).toBeInTheDocument();
        expect(screen.getByText('Quantity: 2')).toBeInTheDocument();
        expect(screen.getByText('Quantity: 1')).toBeInTheDocument();
    });

    // Verify that an empty cart message is displayed when the cart is empty.
    it('displays an empty cart message when cart is empty', () => {
        renderWithCartContext({ ...mockCartContext, cartItems: [] });

        expect(screen.getByText('Your Cart')).toBeInTheDocument();
        expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
    });

    it('shows the checkout confirmation and closes it when checkout is canceled', async () => {
        const user = userEvent.setup();
        renderWithCartContext();

        await user.click(screen.getByRole('button', { name: 'Checkout' }));

        expect(screen.getByRole('heading', { name: 'Are you sure?' })).toBeInTheDocument();
        expect(screen.getByText('Do you want to proceed with the checkout?')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Continue Checkout' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Return to cart' })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Return to cart' }));

        expect(screen.queryByRole('heading', { name: 'Are you sure?' })).not.toBeInTheDocument();
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
        expect(mockCartContext.clearCart).not.toHaveBeenCalled();
    });

    it('clears the cart and displays the processed order after checkout confirmation', async () => {
        const user = userEvent.setup();
        renderWithCartContext();

        await user.click(screen.getByRole('button', { name: 'Checkout' }));
        await user.click(screen.getByRole('button', { name: 'Continue Checkout' }));

        expect(mockCartContext.clearCart).toHaveBeenCalledOnce();
        expect(screen.getByText('Your order has been processed!')).toBeInTheDocument();
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
        expect(screen.getByText('Test Product 2')).toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: 'Are you sure?' })).not.toBeInTheDocument();
    });
});
