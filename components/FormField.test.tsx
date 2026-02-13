import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import FormField from './FormField';

test('renders FormField with label', () => {
  render(<FormField label="Test Label" name="test" type="text" value="" onChange={() => {}} />);
  expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
});