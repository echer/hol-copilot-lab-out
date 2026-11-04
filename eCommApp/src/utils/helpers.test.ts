import { describe, expect, it } from 'vitest';
import { calculateTotal, formatPrice, validateEmail } from './helpers';

describe('formatPrice', () => {
    it('formats a price as US dollars', () => {
        expect(formatPrice(1234.5)).toBe('$1,234.50');
    });
});

describe('calculateTotal', () => {
    it('calculates the sum of item prices multiplied by quantities', () => {
        expect(calculateTotal([
            { price: 3.5, quantity: 2 },
            { price: 10, quantity: 1 }
        ])).toBe(17);
    });

    it('returns zero for an empty cart', () => {
        expect(calculateTotal([])).toBe(0);
    });
});

describe('validateEmail', () => {
    it('accepts a valid email address', () => {
        expect(validateEmail('person@example.com')).toBe(true);
    });

    it.each(['invalid', 'person@', 'person@example', ' person@example.com'])(
        'rejects malformed email address %s',
        (email) => {
            expect(validateEmail(email)).toBe(false);
        }
    );
});
