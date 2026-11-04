import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useContext } from 'react';
import { CartContext, CartProvider } from './CartContext';
import type { Product } from '../types';

const product: Product = {
    id: 'apple',
    name: 'Apple',
    price: 1.5,
    reviews: [],
    inStock: true
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CartProvider>{children}</CartProvider>
);

describe('CartContext', () => {
    it('starts with an empty cart', () => {
        const { result } = renderHook(() => useContext(CartContext), { wrapper });

        expect(result.current?.cartItems).toEqual([]);
    });

    it('adds a product to the cart with quantity one', () => {
        const { result } = renderHook(() => useContext(CartContext), { wrapper });

        act(() => result.current?.addToCart(product));

        expect(result.current?.cartItems).toEqual([{ ...product, quantity: 1 }]);
    });

    it('increments an existing product quantity instead of adding a duplicate', () => {
        const { result } = renderHook(() => useContext(CartContext), { wrapper });

        act(() => {
            result.current?.addToCart(product);
            result.current?.addToCart(product);
        });

        expect(result.current?.cartItems).toEqual([{ ...product, quantity: 2 }]);
    });

    it('keeps different products as separate cart items', () => {
        const { result } = renderHook(() => useContext(CartContext), { wrapper });
        const secondProduct = { ...product, id: 'pear', name: 'Pear' };

        act(() => {
            result.current?.addToCart(product);
            result.current?.addToCart(secondProduct);
            result.current?.addToCart(secondProduct);
        });

        expect(result.current?.cartItems).toEqual([
            { ...product, quantity: 1 },
            { ...secondProduct, quantity: 2 }
        ]);
    });

    it('clears all products from the cart', () => {
        const { result } = renderHook(() => useContext(CartContext), { wrapper });

        act(() => result.current?.addToCart(product));
        act(() => result.current?.clearCart());

        expect(result.current?.cartItems).toEqual([]);
    });
});
