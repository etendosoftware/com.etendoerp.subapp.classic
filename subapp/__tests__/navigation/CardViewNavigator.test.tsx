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
// The Screen's children render-prop is stashed so tests can invoke it again with a
// different route, simulating navigation.push() onto the same route name.
let lastScreenChildren = null;
jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children, name }) => {
      if (typeof children === 'function') {
        lastScreenChildren = children;
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

  it('uses the pushed record params instead of re-using the stale parent params', () => {
    // Reproduces the real flow: Drawer.tsx always sets reset:true on the initial
    // navigate("CardView1", ...) call. Tapping a record then does
    // navigation.push(windowId, cardData), mounting a new Stack.Screen instance for
    // the same route name, with its OWN route.params.
    const propsWithReset = {
      ...mockProps,
      route: { params: { ...mockRoute.params, reset: true } }
    };
    render(
      <NavigationContainer>
        <CardViewStackNavigator {...propsWithReset} />
      </NavigationContainer>
    );

    const pushedCardData = {
      windowId: 'TestWindow',
      currentRecordId: 'record-123',
      label: 'Some Record'
    };
    // Calling the render-prop function directly (bypassing React reconciliation)
    // returns the <Screens.CardView /> element without invoking the mock, so we
    // assert on the element's props directly instead of Screens.CardView.mock.calls.
    const element = lastScreenChildren({
      route: { name: 'TestWindow', params: pushedCardData },
      navigation: { navigate: jest.fn() }
    });

    expect(element.props.route.params.currentRecordId).toBe('record-123');
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
