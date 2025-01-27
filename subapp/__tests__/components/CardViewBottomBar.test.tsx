import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CardViewBottomBar } from '../../src/components/CardViewBottomBar';
import { DefaultTheme, Portal, Modal } from 'react-native-paper';
import locale from '../../src/i18n/locale';

// Mock react-native-paper
jest.mock('react-native-paper', () => ({
  ...jest.requireActual('react-native-paper'),
  DefaultTheme: {
    colors: {
      surface: '#ffffff'
    }
  },
  Portal: ({ children }) => children,
  Modal: ({ children, visible, onDismiss, style }) => (
    visible ? <div testID="modal" style={style}>{children}</div> : null
  )
}));

// Mock the Icon component
jest.mock('react-native-vector-icons/FontAwesome', () => 'Icon');

// Mock the ShowProcessWindow component
jest.mock('../../src/components/ShowProcessWindow', () => ({
  ShowProcessWindow: ({ fabActions, setShowWindow }) => (
    <div testID="mock-process-window">Process Window Mock</div>
  ),
}));

describe('CardViewBottomBar', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    
    it('renders icon with correct properties', () => {
      const { UNSAFE_getByType } = render(
        <CardViewBottomBar fabActions={[]} />
      );

      const icon = UNSAFE_getByType('Icon');
      expect(icon.props.name).toBe('cogs');
      expect(icon.props.color).toBe(DefaultTheme.colors.surface);
      expect(icon.props.size).toBe(27);
    });
  });

  describe('interactions', () => {
    it('opens modal on button press when actions are available', () => {
      const mockFabActions = [{ id: 1, name: 'Action 1' }];
      const { getByText, getByTestId } = render(
        <CardViewBottomBar fabActions={mockFabActions} />
      );

      fireEvent.press(getByText(locale.t('Tab:Actions')));
      expect(getByTestId('modal')).toBeTruthy();
    });

    it('does not open modal when button is pressed and disabled', () => {
      const { getByText, queryByTestId } = render(
        <CardViewBottomBar fabActions={[]} />
      );

      fireEvent.press(getByText(locale.t('Tab:Actions')));
      expect(queryByTestId('modal')).toBeNull();
    });

    it('closes modal on dismiss', () => {
      const mockFabActions = [{ id: 1, name: 'Action 1' }];
      const { getByText, getByTestId, queryByTestId } = render(
        <CardViewBottomBar fabActions={mockFabActions} />
      );

      fireEvent.press(getByText(locale.t('Tab:Actions')));
      const modal = getByTestId('modal');
      expect(modal).toBeTruthy();

      fireEvent(modal, 'onDismiss');
      expect(queryByTestId('modal')).toBeNull();
    });
  });

  describe('styling', () => {
 
    it('applies correct styles to modal', () => {
      const mockFabActions = [{ id: 1, name: 'Action 1' }];
      const { getByText, getByTestId } = render(
        <CardViewBottomBar fabActions={mockFabActions} />
      );

      fireEvent.press(getByText(locale.t('Tab:Actions')));
      const modal = getByTestId('modal');
      
      expect(modal.props.style).toEqual({
        backgroundColor: 'transparent',
        margin: 0,
        padding: 0
      });
    });
  });
});
