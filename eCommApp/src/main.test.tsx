import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createRootMock, renderMock } = vi.hoisted(() => ({
    createRootMock: vi.fn(),
    renderMock: vi.fn()
}));

vi.mock('react-dom/client', () => ({
    default: { createRoot: createRootMock },
    createRoot: createRootMock
}));

describe('application entry point', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        document.body.innerHTML = '<div id="root"></div>';
        createRootMock.mockReturnValue({ render: renderMock });
    });

    it('mounts the React application into the root element', async () => {
        const rootElement = document.getElementById('root');

        await import('./main');

        expect(createRootMock).toHaveBeenCalledWith(rootElement);
        expect(renderMock).toHaveBeenCalledOnce();
        expect(renderMock).toHaveBeenCalledWith(expect.anything());
    });
});
