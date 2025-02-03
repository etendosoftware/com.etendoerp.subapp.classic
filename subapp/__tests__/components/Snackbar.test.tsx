// Mock modules before imports
jest.mock('react-native-paper', () => {
  const Colors = {
    black: '#000000',
    white: '#FFFFFF',
    red500: '#FF0000'
  };

  const SnackbarComponent = ({ children, visible, onDismiss, action, theme, style, duration }) => (
    visible ? (
      <div data-testid="mock-snackbar" {...{ visible, onDismiss, action, theme, style, duration }}>
        {children}
      </div>
    ) : null
  );

  return {
    Snackbar: SnackbarComponent,
    Colors,
    withTheme: (Component) => Component,
    SHORT_DURATION: 2000,
    LONG_DURATION: 3500,
  };
});

jest.mock('../../src/themes', () => ({
  defaultTheme: {
    colors: {
      onSurface: '#000000',
      accent: '#fad614',
      text: '#000000',
      error: '#B00020',
    }
  }
}));

jest.mock('../../src/i18n/locale', () => ({
  t: (key) => key,
}));

import React from 'react';
import { render, act } from '@testing-library/react-native';
import Snackbar from '../../src/components/Snackbar';

describe('Snackbar Component', () => {
  const mockProps = {
    onDismiss: jest.fn(),
    theme: {
      colors: {
        onSurface: '#000000',
        accent: '#fad614',
        text: '#000000',
        error: '#B00020',
      }
    },
    color: '#333333',
    actionColor: '#FFFFFF',
    errorColor: '#FF0000',
    errorActionColor: '#000000',
    width: '100%',
    marginBottom: 30,
    action: undefined
  };

  let snackbarRef;

  beforeEach(() => {
    jest.clearAllMocks();
    snackbarRef = React.createRef();
  });


  it('calls onDismiss callback when snackbar is dismissed', () => {
    const { getByTestId } = render(<Snackbar {...mockProps} ref={snackbarRef} />);
    
    act(() => {
      snackbarRef.current.show('Test Message');
    });

    act(() => {
      snackbarRef.current.onDismiss();
    });

    expect(mockProps.onDismiss).toHaveBeenCalled();
    expect(snackbarRef.current.state.show).toBe(false);
  });

  it('handles hide method', () => {
    const { getByTestId } = render(<Snackbar {...mockProps} ref={snackbarRef} />);
    
    act(() => {
      snackbarRef.current.show('Test Message');
    });

    act(() => {
      snackbarRef.current.hide();
    });

    expect(snackbarRef.current.state.show).toBe(false);
  });

});
