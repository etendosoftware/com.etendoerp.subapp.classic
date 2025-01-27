import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../../src/components/Button';

describe('Button Component', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly with default props', () => {
    const { getByText } = render(
      <Button 
        title="Test Button" 
        onPress={mockOnPress}
        style={{}}
        uppercase={false}
      />
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  test('renders with uppercase title', () => {
    const { getByText } = render(
      <Button 
        title="Test" 
        onPress={mockOnPress}
        style={{}}
        uppercase={true}
      />
    );

    expect(getByText('TEST')).toBeTruthy();
  });

  test('handles button press correctly', () => {
    const { getByText } = render(
      <Button 
        title="Press Me"
        onPress={mockOnPress}
        style={{}}
        uppercase={false}
      />
    );

    fireEvent.press(getByText('Press Me'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  test('disables correctly', () => {
    const { getByText } = render(
      <Button 
        title="Disabled"
        onPress={mockOnPress}
        style={{}}
        disabled={true}
        uppercase={false}
      />
    );

    const button = getByText('Disabled');
    fireEvent.press(button);
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  test('applies correct size and alignment', () => {
    const { getByText } = render(
      <Button 
        title="Test Alignment"
        onPress={jest.fn()}
        sm="true"
        left="true"
        style={{}}
        uppercase={false}
      />
    );
    const buttonText = getByText('Test Alignment');
    expect(buttonText.props.style.textAlign).toBe('left');
  });
});
