import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import withAuthentication from '../../src/withAuthentication';
import { User } from '../../src/stores';

// Mock component to wrap
const MockComponent = () => {
  return <><Text testID="mock-component">Mock Component</Text></>;
};
MockComponent.navigationOptions = {
  title: 'Mock Screen',
};

const WrappedComponent = withAuthentication(MockComponent);

// Mock navigation object
const navigationMock = {
  navigate: jest.fn(),
};

jest.mock('mobx-react', () => ({
  observer: component => component,
}));

jest.mock('../../src/stores', () => ({
  User: {
    token: null,
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('withAuthentication HOC', () => {
  test('renders wrapped component when User.token is present', () => {
    User.token = 'dummyToken';
    const { getByTestId } = render(<WrappedComponent navigation={navigationMock} />);
    expect(getByTestId('mock-component')).toBeTruthy();
  });

  test('navigates to login if User.token is not present', () => {
    User.token = null;
    render(<WrappedComponent navigation={navigationMock} />);
    expect(navigationMock.navigate).toHaveBeenCalledWith('Login');
  });

  test('navigationOptions are set on wrapped component', () => {
    expect(WrappedComponent.navigationOptions).toEqual(MockComponent.navigationOptions);
  });
});
