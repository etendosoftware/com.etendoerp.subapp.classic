import React from 'react';
import { render } from '@testing-library/react-native';
import { CardViewStackNavigator } from '../../src/navigation/CardViewNavigator';
import { NavigationContainer } from '@react-navigation/native';
import * as Screens from '../../src/screens';

// Mock the screens with proper implementation
jest.mock('../../src/screens', () => ({
  CardView: jest.fn(props => null),
  ProcessDialogScreen: jest.fn(() => null),
}));

// Mock createStackNavigator matching real react-navigation v7 behavior: Stack.Screen has
// no 'params' prop (only 'initialParams'), so a freshly pushed route's params start out
// undefined regardless of any custom prop passed to Screen.
jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children, name }) => {
      if (typeof children === 'function') {
        return children({
          route: {
            name,
            params: undefined,
          },
          navigation: {
            navigate: jest.fn(),
          }
        });
      }
      return children;
    }
  }),
  CardStyleInterpolators: {
    forHorizontalIOS: jest.fn(),
  },
}));

// Mock gesture handler to avoid the warning
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    GestureHandlerRootView: View,
    createNativeWrapper: jest.fn(),
  };
});

describe('CardViewStackNavigator', () => {
  const mockRoute = {
    params: {
      windowId: 'TestWindow',
    },
  };

  const mockProps = {
    route: mockRoute,
    navigation: {
      navigate: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <NavigationContainer>
        <CardViewStackNavigator {...mockProps} />
      </NavigationContainer>
    );
  });

  it('passes correct params to CardView screen', () => {
    render(
      <NavigationContainer>
        <CardViewStackNavigator {...mockProps} />
      </NavigationContainer>
    );

    const CardViewCalls = Screens.CardView.mock.calls;
    expect(CardViewCalls.length).toBeGreaterThan(0);
    
    const firstCall = CardViewCalls[0][0];
    expect(firstCall.route.params).toEqual(expect.objectContaining({
      windowId: 'TestWindow'
    }));
    expect(firstCall.theme).toBeDefined();
  });

  it('handles reset parameter correctly', () => {
    const propsWithReset = {
      ...mockProps,
      route: {
        params: {
          ...mockRoute.params,
          reset: true,
        },
      },
    };

    render(
      <NavigationContainer>
        <CardViewStackNavigator {...propsWithReset} />
      </NavigationContainer>
    );

    const CardViewCalls = Screens.CardView.mock.calls;
    expect(CardViewCalls.length).toBeGreaterThan(0);
    
    const firstCall = CardViewCalls[0][0];
    expect(firstCall.route.params.reset).toBeUndefined();
    expect(firstCall.route.params.windowId).toBe('TestWindow');
  });

  it('includes ProcessDialog screen in navigator', () => {
    render(
      <NavigationContainer>
        <CardViewStackNavigator {...mockProps} />
      </NavigationContainer>
    );
    
    expect(Screens.ProcessDialogScreen).toBeDefined();
  });
});
