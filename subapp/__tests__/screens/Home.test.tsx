import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Dimensions } from 'react-native';
import Home from '../../src/screens/Home';
import { defaultTheme } from '../../src/themes';
import * as IsTablet from '../../hooks/IsTablet';

// Mock the images
jest.mock('../../src/img/home2.png', () => 'mock-home-image');
jest.mock('../../src/img/etendo-logo-1.png', () => 'mock-etendo-logo');
jest.mock('../../src/img/etendo_boy_back.png', () => 'mock-etendo-boy-back');

// Mock the locale
jest.mock('../../src/i18n/locale', () => ({
  t: jest.fn(key => key)
}));

describe('Home Screen', () => {
  const mockNavigation = {
    toggleDrawer: jest.fn(),
    navigate: jest.fn(),
    goBack: jest.fn(),
    addListener: jest.fn()
  };

  const defaultProps = {
    navigation: mockNavigation,
    appMinCoreVersion: '1.0.0',
    coreVersion: '1.0.0'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(IsTablet, 'isTablet').mockReturnValue(false);
  });

  describe('rendering', () => {
    test('renders correctly with default props', () => {
      const { getByText } = render(<Home {...defaultProps} />);
      expect(getByText('Home:Title')).toBeTruthy();
      expect(getByText('Welcome!')).toBeTruthy();
    });

    test('renders all required images', () => {
      const { UNSAFE_getAllByType } = render(<Home {...defaultProps} />);
      const images = UNSAFE_getAllByType('Image');
      expect(images).toHaveLength(3);
    });

    test('renders app bar with menu button', () => {
      const { getByRole } = render(<Home {...defaultProps} />);
      const menuButton = getByRole('button');
      expect(menuButton).toBeTruthy();
    });
  });

  describe('interactions', () => {
    test('calls toggleDrawer when menu button is pressed', () => {
      const { getByRole } = render(<Home {...defaultProps} />);
      const menuButton = getByRole('button');
      fireEvent.press(menuButton);
      expect(mockNavigation.toggleDrawer).toHaveBeenCalledTimes(1);
    });
  });

  describe('responsive behavior', () => {
    test('applies correct styles when on tablet', () => {
      jest.spyOn(IsTablet, 'isTablet').mockReturnValue(true);
      const { getByText } = render(<Home {...defaultProps} />);
      const welcomeText = getByText('Welcome!');
      expect(welcomeText.props.style).toMatchObject({
        paddingRight: 40
      });
    });

    test('applies correct styles when on phone', () => {
      const { getByText } = render(<Home {...defaultProps} />);
      const welcomeText = getByText('Welcome!');
      expect(welcomeText.props.style).toMatchObject({
        paddingRight: 40,
        fontSize: 20,
        color: defaultTheme.colors.textSecondary,
        alignSelf: 'flex-end'
      });
    });
  });

});
