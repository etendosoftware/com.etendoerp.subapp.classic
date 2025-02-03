import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import Profile from '../../src/screens/Profile';
import { OBRest } from 'etrest';
import * as IsTablet from '../../hooks/IsTablet';

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

// Mock animated components from react-native
jest.mock('react-native/Libraries/Animated/createAnimatedComponent', () => (Component) => Component);
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock ShowProfilePicture component
jest.mock('../../src/components/ShowProfilePicture', () => {
  return function MockShowProfilePicture() {
    return null;
  };
});

// Mock the required dependencies
jest.mock('etrest');
jest.mock('../../src/stores', () => ({
  User: {
    data: {
      username: 'testUser',
      organization: 'org123',
      client: 'client123',
      warehouseId: 'warehouse123',
      roleId: 'role123'
    },
    token: 'test-token'
  }
}));

jest.mock('../../hooks/IsTablet', () => ({
  isTablet: jest.fn()
}));

jest.mock('../../src/i18n/locale', () => ({
  t: (key: string) => key
}));

jest.mock('../../src/withAuthentication', () => (Component: React.ComponentType) => Component);

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn()
};

describe('Profile Screen', () => {
  let mockCriteria;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Setup mock criteria
    mockCriteria = {
      add: jest.fn().mockReturnThis(),
      uniqueResult: jest.fn()
    };
    
    (OBRest.getInstance as jest.Mock).mockReturnValue({
      createCriteria: jest.fn().mockReturnValue(mockCriteria)
    });

    mockCriteria.uniqueResult
      .mockResolvedValueOnce({ name: 'Test Organization' })
      .mockResolvedValueOnce({ name: 'Test Role' })
      .mockResolvedValueOnce({ name: 'Test Warehouse' })
      .mockResolvedValueOnce({ name: 'Test Client' });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders correctly with initial state', () => {
    const { getByText } = render(
      <Profile navigation={mockNavigation} />
    );
    
    expect(getByText('Profile:Title')).toBeTruthy();
    expect(getByText('testUser')).toBeTruthy();
  });

  it('loads user data correctly on mount', async () => {
    const { findByText } = render(
      <Profile navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(mockCriteria.uniqueResult).toHaveBeenCalled();
    });

    const roleText = await findByText('Test Role');
    expect(roleText).toBeTruthy();
  });

  it('handles tablet layout correctly', () => {
    (IsTablet.isTablet as jest.Mock).mockReturnValue(true);
    
    const { getByText } = render(
      <Profile navigation={mockNavigation} />
    );

    expect(getByText('Profile:Title')).toBeTruthy();
    expect(IsTablet.isTablet).toHaveBeenCalled();
  });

  it('handles mobile layout correctly', () => {
    (IsTablet.isTablet as jest.Mock).mockReturnValue(false);
    
    const { getByText } = render(
      <Profile navigation={mockNavigation} />
    );

    expect(getByText('Profile:Title')).toBeTruthy();
    expect(IsTablet.isTablet).toHaveBeenCalled();
  });
});
