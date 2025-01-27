// Mock modules before imports
jest.mock('react-native-paper', () => ({
  Button: 'Button',
  withTheme: (Component) => Component,
  DefaultTheme: {
    colors: {
      primary: '#202452',
      accent: '#fad614',
      background: '#ffffff',
      surface: '#ffffff',
      error: '#B00020',
      text: '#000000',
      disabled: '#000000',
      placeholder: '#000000',
      backdrop: '#000000',
      onSurface: '#000000',
      notification: '#000000'
    }
  }
}));

jest.mock('../../src/themes', () => ({
  defaultTheme: {
    colors: {
      primary: '#202452',
      accent: '#fad614',
      background: '#ffffff',
      surface: '#ffffff',
      error: '#B00020',
      text: '#000000',
      disabled: '#000000',
      placeholder: '#000000',
      backdrop: '#000000',
      onSurface: '#000000',
      notification: '#000000'
    }
  }
}));

jest.mock('react-native-swipeable-item', () => 'SwipeableItem');

jest.mock('../../src/i18n/locale', () => ({
  t: (key) => key,
}));

jest.mock('../../src/components/Card', () => 'Card');

import React from 'react';
import { render } from '@testing-library/react-native';
import SwipeableCard from '../../src/components/SwipeableCard';
import { UI_PATTERNS } from '../../src/ob-api/constants/uiPatterns';
import TabContext from '../../src/contexts/TabContext';

describe('SwipeableCard Component', () => {
  const mockProps = {
    title: 'Test Title',
    subtitle: 'Test Subtitle',
    currentRecordId: '123',
    tabUIPattern: UI_PATTERNS.STD,
    onDeleteRecord: jest.fn(),
    snapPointsRight: [100],
    snapPointsLeft: [100],
    onCardNavigate: jest.fn(),
    theme: {
      colors: {
        error: 'red',
        primary: '#202452',
        accent: '#fad614',
        background: '#ffffff',
        surface: '#ffffff',
        text: '#000000',
        disabled: '#000000',
        placeholder: '#000000',
        backdrop: '#000000',
        onSurface: '#000000',
        notification: '#000000'
      }
    },
  };

  const mockContextValue = {
    currentRecord: { id: '123', name: 'Test Record' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders SwipeableItem when tabUIPattern is STD', () => {
    const { UNSAFE_getByType } = render(
      <TabContext.Provider value={mockContextValue}>
        <SwipeableCard {...mockProps} />
      </TabContext.Provider>
    );

    expect(UNSAFE_getByType('SwipeableItem')).toBeTruthy();
    expect(UNSAFE_getByType('Card')).toBeTruthy();
  });

  it('renders only Card when tabUIPattern is not STD or ED', () => {
    const props = {
      ...mockProps,
      tabUIPattern: 'OTHER',
    };

    const { UNSAFE_getByType, UNSAFE_queryByType } = render(
      <TabContext.Provider value={mockContextValue}>
        <SwipeableCard {...props} />
      </TabContext.Provider>
    );

    expect(UNSAFE_queryByType('SwipeableItem')).toBeFalsy();
    expect(UNSAFE_getByType('Card')).toBeTruthy();
  });

  it('renders with ED pattern', () => {
    const props = {
      ...mockProps,
      tabUIPattern: UI_PATTERNS.ED,
    };

    const { UNSAFE_getByType } = render(
      <TabContext.Provider value={mockContextValue}>
        <SwipeableCard {...props} />
      </TabContext.Provider>
    );

    expect(UNSAFE_getByType('SwipeableItem')).toBeTruthy();
    expect(UNSAFE_getByType('Card')).toBeTruthy();
  });

  it('uses custom renderUnderlayLeft when provided', () => {
    const customUnderlay = () => 'CustomUnderlay';
    const props = {
      ...mockProps,
      renderUnderlayLeft: customUnderlay,
    };

    const { UNSAFE_getByType } = render(
      <TabContext.Provider value={mockContextValue}>
        <SwipeableCard {...props} />
      </TabContext.Provider>
    );

    expect(UNSAFE_getByType('SwipeableItem').props.renderUnderlayLeft).toBe(customUnderlay);
  });

  it('updates when title changes', () => {
    const { rerender, UNSAFE_getByType } = render(
      <TabContext.Provider value={mockContextValue}>
        <SwipeableCard {...mockProps} />
      </TabContext.Provider>
    );

    const newProps = {
      ...mockProps,
      title: 'New Title',
    };

    rerender(
      <TabContext.Provider value={mockContextValue}>
        <SwipeableCard {...newProps} />
      </TabContext.Provider>
    );

    expect(UNSAFE_getByType('Card').props.title).toBe('New Title');
  });

  it('updates when multipleSelectionMode changes', () => {
    const { rerender, UNSAFE_getByType } = render(
      <TabContext.Provider value={mockContextValue}>
        <SwipeableCard {...mockProps} multipleSelectionMode={false} />
      </TabContext.Provider>
    );

    const newProps = {
      ...mockProps,
      multipleSelectionMode: true,
    };

    rerender(
      <TabContext.Provider value={mockContextValue}>
        <SwipeableCard {...newProps} />
      </TabContext.Provider>
    );

    expect(UNSAFE_getByType('Card').props.multipleSelectionMode).toBe(true);
  });

  it('passes all props to Card component', () => {
    const { UNSAFE_getByType } = render(
      <TabContext.Provider value={mockContextValue}>
        <SwipeableCard {...mockProps} />
      </TabContext.Provider>
    );

    const cardProps = UNSAFE_getByType('Card').props;
    Object.keys(mockProps).forEach(key => {
      expect(cardProps[key]).toBe(mockProps[key]);
    });
  });

  it('initializes with correct singleView value', () => {
    const { UNSAFE_getByType } = render(
      <TabContext.Provider value={mockContextValue}>
        <SwipeableCard {...mockProps} currentRecordId="123" />
      </TabContext.Provider>
    );

    const cardProps = UNSAFE_getByType('Card').props;
    expect(cardProps.currentRecordId).toBe('123');
  });
});
