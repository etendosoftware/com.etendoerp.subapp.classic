import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import Prompt from '../../src/components/Prompt';

describe('Prompt Component', () => {
  const mockProps = {
    title: 'Test Title',
    placeholder: 'Test Placeholder',
    defaultValue: '',
    visible: true,
    onCancel: jest.fn(),
    onSubmit: jest.fn(),
    onChangeText: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    const { getByText, getByPlaceholderText } = render(<Prompt {...mockProps} />);
    
    expect(getByText('Test Title')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
    expect(getByText('OK')).toBeTruthy();
    expect(getByPlaceholderText('Test Placeholder')).toBeTruthy();
  });

  it('calls onCancel when cancel button is pressed', () => {
    const { getByText } = render(<Prompt {...mockProps} />);
    
    fireEvent.press(getByText('Cancel'));
    expect(mockProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onSubmit with input value when submit button is pressed', () => {
    const { getByText, getByPlaceholderText } = render(<Prompt {...mockProps} />);
    const input = getByPlaceholderText('Test Placeholder');
    
    fireEvent.changeText(input, 'test input');
    fireEvent.press(getByText('OK'));
    
    expect(mockProps.onSubmit).toHaveBeenCalledWith('test input');
  });

  it('calls onChangeText when input value changes', () => {
    const { getByPlaceholderText } = render(<Prompt {...mockProps} />);
    const input = getByPlaceholderText('Test Placeholder');
    
    fireEvent.changeText(input, 'test input');
    
    expect(mockProps.onChangeText).toHaveBeenCalledWith('test input');
  });

  it('updates value when defaultValue prop changes', () => {
    const { rerender, getByPlaceholderText } = render(<Prompt {...mockProps} />);
    
    const newProps = {
      ...mockProps,
      defaultValue: 'new default value'
    };
    
    rerender(<Prompt {...newProps} />);
    
    const input = getByPlaceholderText('Test Placeholder');
    expect(input.props.defaultValue).toBe('new default value');
  });


  it('has autoFocus enabled on the TextInput', () => {
    const { getByPlaceholderText } = render(<Prompt {...mockProps} />);
    const input = getByPlaceholderText('Test Placeholder');
    
    expect(input.props.autoFocus).toBe(true);
  });

  it('passes through textInputProps correctly', () => {
    const textInputProps = {
      maxLength: 50,
      keyboardType: 'numeric',
    };
    
    const { getByPlaceholderText } = render(
      <Prompt {...mockProps} textInputProps={textInputProps} />
    );
    
    const input = getByPlaceholderText('Test Placeholder');
    expect(input.props.maxLength).toBe(50);
    expect(input.props.keyboardType).toBe('numeric');
  });
});
