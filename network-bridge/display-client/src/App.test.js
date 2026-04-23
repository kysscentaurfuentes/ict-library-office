import { jsx as _jsx } from "react/jsx-runtime";
// display-client/src/App.test.tsx
import { render, screen } from '@testing-library/react';
import App from './App';
import axios from 'axios';
import { vi } from 'vitest';
vi.mock('axios');
const mockedAxios = axios;
test('renders scanner heading', async () => {
    mockedAxios.get.mockResolvedValue({ data: { message: 'mocked data' } });
    render(_jsx(App, {}));
    expect(screen.getByText(/Scanner Output/i)).toBeInTheDocument();
});
