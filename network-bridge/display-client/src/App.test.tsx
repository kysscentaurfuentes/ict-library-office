// display-client/src/App.test.tsx
import { render, screen } from '@testing-library/react';
import App from './App';
import axios from 'axios';
import { vi } from 'vitest';
import type { Mocked } from 'vitest';


vi.mock('axios');
const mockedAxios = axios as Mocked<typeof axios>;

test('renders scanner heading', async () => {
  mockedAxios.get.mockResolvedValue({ data: { message: 'mocked data' } });

  render(<App />);
  expect(screen.getByText(/Scanner Output/i)).toBeInTheDocument();
});
