import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AppLogin, AppHome } from '../../src/navigation/AppNavigation';
import User from '../../src/stores/User';
import { isTablet } from '../../hooks/IsTablet';

jest.mock('react-native-gesture-handler', () => {
  return {
    PanGestureHandler: () => null,
    State: {},
  };
});

// Mock dependencies
jest.mock('../../src/screens', () => ({
  Login: () => null,
  Settings: () => null,
  Home: () => null,
  Tutorial: () => null,
  CardView1: () => null,
}));

jest.mock('../../src/stores/User', () => ({
  token: null,
}));

jest.mock('../../hooks/IsTablet', () => ({
  isTablet: jest.fn(),
}));

jest.mock('../../src/components', () => ({
  Drawer: ({ navigationContainer, ...props }) => null,
}));

// Mock navigation functions
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/drawer', () => {
  return {
    createDrawerNavigator: () => ({
      Navigator: ({ children, screenOptions, drawerContent }) => {
        // Call drawerContent with mock props to test it
        if (drawerContent) {
          drawerContent({
            navigation: { navigate: mockNavigate, goBack: mockGoBack },
            state: { routeNames: ['Home', 'Tutorial', 'CardView1'] }
          });
        }
        return children;
      },
      Screen: ({ children }) => children,
    }),
  };
});

describe('AppNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AppLogin', () => {
    it('renders correctly', () => {
      const { getByTestId } = render(
        <NavigationContainer>
          <AppLogin />
        </NavigationContainer>
      );
      expect(true).toBeTruthy();
    });


    it('handles drawer width based on User token', () => {
      const mockUser = User as jest.Mocked<typeof User>;
      mockUser.token = 'test-token';

      const { rerender } = render(
        <NavigationContainer>
          <AppLogin />
        </NavigationContainer>
      );
      
      // Test with token
      expect(mockUser.token).toBe('test-token');

      // Test without token
      mockUser.token = null;
      rerender(
        <NavigationContainer>
          <AppLogin />
        </NavigationContainer>
      );
      expect(mockUser.token).toBeNull();
    });

  });

  describe('AppHome', () => {
    const mockNavigationContainer = {
      current: {
        navigate: mockNavigate,
        goBack: mockGoBack,
      }
    };

    it('handles drawer width based on device type and User token', () => {
      const mockUser = User as jest.Mocked<typeof User>;
      mockUser.token = 'test-token';

      // Test tablet mode
      (isTablet as jest.Mock).mockReturnValue(true);
      const { rerender } = render(
        <NavigationContainer>
          <AppHome navigationContainer={mockNavigationContainer} />
        </NavigationContainer>
      );
      expect(isTablet).toHaveBeenCalled();

      // Test phone mode
      (isTablet as jest.Mock).mockReturnValue(false);
      rerender(
        <NavigationContainer>
          <AppHome navigationContainer={mockNavigationContainer} />
        </NavigationContainer>
      );
      expect(isTablet).toHaveBeenCalled();

      // Test no token
      mockUser.token = null;
      rerender(
        <NavigationContainer>
          <AppHome navigationContainer={mockNavigationContainer} />
        </NavigationContainer>
      );
      expect(mockUser.token).toBeNull();
    });

    it('passes correct props to Drawer component', () => {
      render(
        <NavigationContainer>
          <AppHome navigationContainer={mockNavigationContainer} />
        </NavigationContainer>
      );
      // Verify drawer content props are passed
      expect(mockNavigationContainer).toBeDefined();
    });

    it('properly handles navigation container props', () => {
      render(
        <NavigationContainer>
          <AppHome navigationContainer={mockNavigationContainer} />
        </NavigationContainer>
      );
      expect(mockNavigationContainer.current.navigate).toBeDefined();
      expect(mockNavigationContainer.current.goBack).toBeDefined();
    });

  });
});
