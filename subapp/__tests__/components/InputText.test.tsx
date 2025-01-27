import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import InputText from '../../src/components/InputText';

describe('InputText Component', () => {
  const defaultProps = {
    value: '',
    pref: React.createRef(),
    placeholder: 'Enter text',
    textContentType: 'none',
    secureTextEntry: false,
    onChangeText: jest.fn(),
    onSubmitEditing: jest.fn(),
    keyboardType: 'default',
    autoFocus: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders correctly with default props', () => {
      const { getByPlaceholderText } = render(<InputText {...defaultProps} />);
      const input = getByPlaceholderText('Enter text');
      expect(input).toBeTruthy();
    });

    test('renders with custom placeholder', () => {
      const customProps = {
        ...defaultProps,
        placeholder: 'Custom placeholder',
      };
      const { getByPlaceholderText } = render(<InputText {...customProps} />);
      const input = getByPlaceholderText('Custom placeholder');
      expect(input).toBeTruthy();
    });

    test('renders with secure text entry', () => {
      const secureProps = {
        ...defaultProps,
        secureTextEntry: true,
      };
      const { getByPlaceholderText } = render(<InputText {...secureProps} />);
      const input = getByPlaceholderText('Enter text');
      expect(input.props.secureTextEntry).toBe(true);
    });
  });

  describe('Interactions', () => {
    test('handles text changes', () => {
      const { getByPlaceholderText } = render(<InputText {...defaultProps} />);
      const input = getByPlaceholderText('Enter text');
      
      fireEvent.changeText(input, 'new text');
      expect(defaultProps.onChangeText).toHaveBeenCalledWith('new text');
    });

    test('handles submit editing', () => {
      const { getByPlaceholderText } = render(<InputText {...defaultProps} />);
      const input = getByPlaceholderText('Enter text');
      
      fireEvent(input, 'submitEditing');
      expect(defaultProps.onSubmitEditing).toHaveBeenCalled();
    });
  });

  describe('Props', () => {
    test('applies correct keyboard type', () => {
      const numericProps = {
        ...defaultProps,
        keyboardType: 'numeric',
      };
      const { getByPlaceholderText } = render(<InputText {...numericProps} />);
      const input = getByPlaceholderText('Enter text');
      expect(input.props.keyboardType).toBe('numeric');
    });

    test('handles autoFocus prop', () => {
      const autoFocusProps = {
        ...defaultProps,
        autoFocus: true,
      };
      const { getByPlaceholderText } = render(<InputText {...autoFocusProps} />);
      const input = getByPlaceholderText('Enter text');
      expect(input.props.autoFocus).toBe(true);
    });

    test('displays correct value', () => {
      const valueProps = {
        ...defaultProps,
        value: 'test value',
      };
      const { getByDisplayValue } = render(<InputText {...valueProps} />);
      expect(getByDisplayValue('test value')).toBeTruthy();
    });
  });
});
