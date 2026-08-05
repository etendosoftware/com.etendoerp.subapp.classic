import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Drawer from '../../src/components/Drawer';
import { Windows, User } from '../../src/stores';

const initialMetrics = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 }
};

const renderDrawer = props =>
  render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <Drawer navigation={mockNavigation} navigationContainer={{}} {...props} />
    </SafeAreaProvider>
  );

jest.mock('../../src/components/ShowProfilePicture', () => {
  return function MockShowProfilePicture() {
    return null;
  };
});

jest.mock('../../src/i18n/locale', () => ({
  t: (key: string) => key
}));

jest.mock('etrest', () => ({
  OBRest: {
    getInstance: jest.fn().mockReturnValue({
      createCriteria: jest.fn().mockReturnValue({
        add: jest.fn().mockReturnThis(),
        uniqueResult: jest.fn().mockResolvedValue({ name: 'Test Organization' })
      })
    })
  },
  Restrictions: {
    equals: jest.fn()
  }
}));

const mockMenuItem = {
  key: '100',
  label: 'Sales Order',
  windowId: '100',
  windowName: 'Sales Order',
  isSalesTransaction: true
};

jest.mock('../../src/stores', () => {
  const { observable } = require('mobx');
  return {
    User: {
      data: { username: 'admin', organization: 'org1' },
      token: 'test-token',
      loading: false
    },
    // mobx's observe() requires a real observable administration, not a plain object.
    Windows: observable({ menuItems: [], loading: false }),
    logout: jest.fn()
  };
});

const mockNavigation = {
  navigate: jest.fn(),
  closeDrawer: jest.fn(),
  toggleDrawer: jest.fn()
};

describe('Drawer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Windows.menuItems = [];
    Windows.loading = false;
  });

  // Regression test: Drawer's constructor used to always start with menuItems: [],
  // relying solely on mobx's observe() to pick up the store later. observe() only fires
  // on *future* changes, so if Windows.menuItems is already populated by the time Drawer
  // mounts (e.g. after the loading-gate fix in App.tsx), the drawer got stuck showing the
  // loading placeholder forever, since no "change" event was ever going to fire.
  it('shows already-loaded menu items immediately, without waiting for a store change event', () => {
    Windows.menuItems = [mockMenuItem];

    const { getByText } = renderDrawer();

    expect(getByText('Sales Order')).toBeTruthy();
  });

  it('shows the loading placeholder when the store has no menu items yet', () => {
    Windows.menuItems = [];

    const { queryByText } = renderDrawer();

    expect(queryByText('Sales Order')).toBeNull();
  });

  it('seeds the username from the store at construction time', () => {
    Windows.menuItems = [mockMenuItem];

    const { getByText } = renderDrawer();

    expect(getByText('admin')).toBeTruthy();
  });

  // Regression test: tapping a menu item used to call the module-level `Etendo.closeDrawer()`
  // bridge, which is wired to the host app's own top-level navigation object and can never
  // reach this remote bundle's own (NavigationIndependentTree-isolated) drawer. The drawer
  // never closed. The fix calls navigation.closeDrawer() directly on the navigation object
  // this component already owns.
  it('closes the drawer via navigation.closeDrawer() before navigating to the tapped window', () => {
    Windows.menuItems = [mockMenuItem];

    const { getByText } = renderDrawer();

    fireEvent.press(getByText('Sales Order'));

    expect(mockNavigation.closeDrawer).toHaveBeenCalled();
    expect(mockNavigation.navigate).toHaveBeenCalledWith(
      'CardView1',
      expect.objectContaining({ windowId: '100', reset: true })
    );

    const closeOrder = mockNavigation.closeDrawer.mock.invocationCallOrder[0];
    const navigateOrder = mockNavigation.navigate.mock.invocationCallOrder[0];
    expect(closeOrder).toBeLessThan(navigateOrder);
  });
});
