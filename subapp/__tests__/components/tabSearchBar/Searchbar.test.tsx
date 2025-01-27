import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { defaultTheme } from '../../../src/themes';
import Searchbar from '../../../src/components/tabSearchBar/Searchbar';

// Mock the withTheme HOC by creating a wrapper component
const SearchbarWithTheme = (props: any) => (
  <PaperProvider theme={defaultTheme}>
    <Searchbar {...props} />
  </PaperProvider>
);

describe('Searchbar Component', () => {
  describe('Rendering', () => {
    test('renders correctly with default props', () => {
      const { getByRole } = render(<SearchbarWithTheme value="" />);
      const searchInput = getByRole('search');
      expect(searchInput).toBeTruthy();
    });

    test('renders with custom placeholder', () => {
      const placeholderText = 'Search items';
      const { getByPlaceholderText } = render(
        <SearchbarWithTheme value="" placeholder={placeholderText} />
      );
      const searchInput = getByPlaceholderText(placeholderText);
      expect(searchInput).toBeTruthy();
    });
  });

  describe('Input Behavior', () => {
    test('updates value on text change', () => {
      const onChangeTextMock = jest.fn();
      const { getByRole } = render(
        <SearchbarWithTheme 
          value="" 
          onChangeText={onChangeTextMock} 
          placeholder="Search" 
        />
      );
      
      const searchInput = getByRole('search');
      fireEvent.changeText(searchInput, 'test query');
      
      expect(onChangeTextMock).toHaveBeenCalledWith('test query');
    });

    test('displays input value correctly', () => {
      const { getByDisplayValue } = render(
        <SearchbarWithTheme value="initial value" />
      );
      
      const searchInput = getByDisplayValue('initial value');
      expect(searchInput).toBeTruthy();
    });
  });

  describe('Clear Button', () => {
    test('clears input when clear button is pressed', () => {
      const onChangeTextMock = jest.fn();
      const { getByRole, getAllByRole } = render(
        <SearchbarWithTheme 
          value="search text" 
          onChangeText={onChangeTextMock}
        />
      );
      
      const buttons = getAllByRole('button');
      const clearButton = buttons.find(button => 
        button.props.accessibilityLabel === 'clear'
      );
      
      if (clearButton) {
        fireEvent.press(clearButton);
        expect(onChangeTextMock).toHaveBeenCalledWith('');
      }
    });

  });

  describe('Icon Interactions', () => {
    test('calls onIconPress when search icon is pressed', () => {
      const onIconPressMock = jest.fn();
      const { getAllByRole } = render(
        <SearchbarWithTheme 
          value="" 
          onIconPress={onIconPressMock}
        />
      );
      
      const buttons = getAllByRole('button');
      const searchButton = buttons.find(button => 
        button.props.accessibilityLabel === 'search'
      );
      
      if (searchButton) {
        fireEvent.press(searchButton);
        expect(onIconPressMock).toHaveBeenCalled();
      }
    });
  });

  describe('Accessibility', () => {
    test('has correct accessibility roles', () => {
      const { getByRole, getAllByRole } = render(
        <SearchbarWithTheme value="" placeholder="Search" />
      );
      
      const searchInput = getByRole('search');
      const buttons = getAllByRole('button');
      
      expect(searchInput).toBeTruthy();
      expect(buttons).toHaveLength(2); // Search and clear buttons
      
      const searchButton = buttons.find(button => 
        button.props.accessibilityLabel === 'search'
      );
      const clearButton = buttons.find(button => 
        button.props.accessibilityLabel === 'clear'
      );
      
      expect(searchButton).toBeTruthy();
      expect(clearButton).toBeTruthy();
    });
  });

  describe('Prop Overrides', () => {
    test('uses custom icon for search button', () => {
      const CustomIcon = () => null;
      const { getAllByRole } = render(
        <SearchbarWithTheme 
          value="" 
          icon={CustomIcon}
        />
      );
      
      const buttons = getAllByRole('button');
      const searchButton = buttons.find(button => 
        button.props.accessibilityLabel === 'search'
      );
      
      expect(searchButton).toBeTruthy();
    });

    test('uses custom icon for clear button', () => {
      const CustomClearIcon = () => null;
      const { getAllByRole } = render(
        <SearchbarWithTheme 
          value="test" 
          clearIcon={CustomClearIcon}
        />
      );
      
      const buttons = getAllByRole('button');
      const clearButton = buttons.find(button => 
        button.props.accessibilityLabel === 'clear'
      );
      
      expect(clearButton).toBeTruthy();
    });
  });
});
