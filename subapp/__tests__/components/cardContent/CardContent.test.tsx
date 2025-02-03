import React from 'react';
import { render } from '@testing-library/react-native';
import CardContent from '../../../src/components/cardContent/CardContent';

// Mock del hook isTablet
jest.mock('../../../hooks/IsTablet', () => ({
  isTablet: jest.fn(() => false)
}));

describe('CardContent', () => {
  const mockIdentifiers = [
    { id: '1', name: 'First', value: 'First Value' },
    { id: '2', name: 'Second', value: 'Second Value' },
    { id: '3', name: 'Third', value: 'Third Value' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    test('renders correctly with multiple identifiers', () => {
      const { getByText } = render(
        <CardContent identifiers={mockIdentifiers} />
      );

      // Verify second and third identifiers are rendered
      expect(getByText('Second:')).toBeTruthy();
      expect(getByText('Second Value')).toBeTruthy();
      expect(getByText('Third:')).toBeTruthy();
      expect(getByText('Third Value')).toBeTruthy();
    });

    test('renders empty when only one identifier is provided', () => {
      const singleIdentifier = [{ id: '1', name: 'Single', value: 'Value' }];
      const { queryByText } = render(
        <CardContent identifiers={singleIdentifier} />
      );

      expect(queryByText('Single:')).toBeNull();
    });

    test('renders correctly with empty identifiers array', () => {
      const { UNSAFE_root } = render(
        <CardContent identifiers={[]} />
      );

      expect(UNSAFE_root.children.length).toBe(1); // Only the container View
    });
  });

  describe('layout', () => {
    test('uses column layout for mobile', () => {
      const { UNSAFE_root } = render(
        <CardContent identifiers={mockIdentifiers} />
      );

      const containerStyle = UNSAFE_root.children[0].props.style;
      expect(containerStyle).toMatchObject({ flexDirection: 'column' });
    });

  });

  describe('CardInfoField rendering', () => {
    test('passes correct props to CardInfoField components', () => {
      const { getByText } = render(
        <CardContent identifiers={mockIdentifiers} />
      );

      // Verify props are passed correctly by checking rendered content
      mockIdentifiers.slice(1).forEach(identifier => {
        expect(getByText(`${identifier.name}:`)).toBeTruthy();
        expect(getByText(identifier.value)).toBeTruthy();
      });
    });
  });
});
