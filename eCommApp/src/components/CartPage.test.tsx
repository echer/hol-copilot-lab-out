import { fireEvent, render, screen } from '@testing-library/react';
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

vi.mock('./CheckoutModal', () => ({
    default: ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) => (
        <div data-testid="checkout-modal">
            <button onClick={onConfirm} data-testid="confirm-checkout">Confirm</button>
            <button onClick={onCancel} data-testid="cancel-checkout">Cancel</button>
        </div>
    )
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

    it('opens checkout and returns to the cart when checkout is canceled', () => {
        renderWithCartContext();

        fireEvent.click(screen.getByRole('button', { name: 'Checkout' }));
        expect(screen.getByTestId('checkout-modal')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('cancel-checkout'));

        expect(screen.queryByTestId('checkout-modal')).not.toBeInTheDocument();
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
        expect(mockCartContext.clearCart).not.toHaveBeenCalled();
    });

    it('clears the cart and displays the processed order after checkout confirmation', () => {
        renderWithCartContext();

        fireEvent.click(screen.getByRole('button', { name: 'Checkout' }));
        fireEvent.click(screen.getByTestId('confirm-checkout'));

        expect(mockCartContext.clearCart).toHaveBeenCalledOnce();
        expect(screen.getByText('Your order has been processed!')).toBeInTheDocument();
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
        expect(screen.getByText('Test Product 2')).toBeInTheDocument();
        expect(screen.queryByTestId('checkout-modal')).not.toBeInTheDocument();
    });
});
