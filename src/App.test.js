import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Mystic Realms title', () => {
  render(<App />);
  const titleElement = screen.getByRole('heading', { name: /Mystic Realms/i });
  expect(titleElement).toBeInTheDocument();
});
