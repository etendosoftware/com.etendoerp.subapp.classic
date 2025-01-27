import React from 'react';
import { render } from '@testing-library/react-native';
import CardInfoField from '../../../src/components/cardContent/CardInfoField';

jest.mock('../../../hooks/IsTablet', () => ({
  isTablet: jest.fn(() => false)
}));

jest.mock('../../../src/i18n/locale', () => ({
  t: jest.fn((key) => {
    const translations = {
      'Yes': 'Sí',
      'No': 'No'
    };
    return translations[key] || key;
  })
}));

describe('CardInfoField Component', () => {
  test('renders string value correctly', () => {
    const { getByText } = render(
      <CardInfoField 
        name="Test Field" 
        value="Test Value" 
      />
    );

    expect(getByText('Test Field:')).toBeTruthy();
    expect(getByText('Test Value')).toBeTruthy();
  });

  test('renders boolean true value correctly', () => {
    const { getByText } = render(
      <CardInfoField 
        name="Active" 
        value={true} 
      />
    );

    expect(getByText('Active:')).toBeTruthy();
    expect(getByText('Sí')).toBeTruthy();
  });

  test('renders boolean false value correctly', () => {
    const { getByText } = render(
      <CardInfoField 
        name="Active" 
        value={false} 
      />
    );

    expect(getByText('Active:')).toBeTruthy();
    expect(getByText('No')).toBeTruthy();
  });

  test('supports optional id prop', () => {
    const { getByText } = render(
      <CardInfoField 
        id="testId"
        name="Test Field" 
        value="Test Value" 
      />
    );

    expect(getByText('Test Field:')).toBeTruthy();
    expect(getByText('Test Value')).toBeTruthy();
  });

  test('handles null or undefined values gracefully', () => {
    const { getByText } = render(
      <CardInfoField 
        name="Nullable Field" 
        value="" 
      />
    );

    expect(getByText('Nullable Field:')).toBeTruthy();
    expect(getByText('')).toBeTruthy();
  });
});
