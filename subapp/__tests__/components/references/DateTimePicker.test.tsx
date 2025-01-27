import React from 'react';
import { render } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import DateTimePicker from '../../../src/components/references/DateTimePicker';
import FormContext from '../../../src/contexts/FormContext';
import locale from '../../../src/i18n/locale';
import { References } from '../../../src/constants/References';

const originalConsoleError = global.console.error;
const originalConsoleWarn = global.console.warn;

global.console.error = (...args) => {
  if (args[0]?.includes?.('You are trying to access a property or method of the Jest environment after it has been torn down')) {
    return;
  }
  originalConsoleError.apply(console, args);
};

global.console.warn = (...args) => {
  if (args[0]?.includes?.('You are trying to access a property or method of the Jest environment after it has been torn down')) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
  global.console.error = originalConsoleError;
  global.console.warn = originalConsoleWarn;
});

// Mock del RNDateTimePicker component
jest.mock('@react-native-community/datetimepicker', () => {
  const mockComponent = jest.fn(({ onChange, value }) => {
    return (
      <mock-datetimepicker
        testID="mock-datetimepicker"
        onChange={onChange}
        value={value}
      />
    );
  });
  return mockComponent;
});

jest.mock('../../../src/i18n/locale', () => ({
  formatDate: jest.fn((date) => '2023-10-20'),
  parseISODate: jest.fn((date) => new Date(date)),
  getUIDateFormat: jest.fn(() => 'YYYY-MM-DD'),
  getServerDateFormat: jest.fn(() => 'YYYY-MM-DD'),
  t: jest.fn((key) => key),
}));

describe('DateTimePicker', () => {
  const mockField = {
    id: 'testField',
    name: 'testField',
  };

  const mockContext = {
    onChangeDateTime: jest.fn(),
  };

  const defaultProps = {
    field: mockField,
    dateMode: 'date',
    referenceKey: References.DateTime,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios';
  });

  const renderComponent = (props = {}) => {
    return render(
      <PaperProvider>
        <FormContext.Provider value={mockContext}>
          <DateTimePicker {...defaultProps} {...props} />
        </FormContext.Provider>
      </PaperProvider>
    );
  };

  describe('Initialization', () => {
    it('renders correctly with default props', () => {
      const { getByText } = renderComponent();
      expect(getByText('Reference:Select')).toBeTruthy();
    });

    it('renders with initial date value', () => {
      renderComponent({
        value: '2023-10-20',
      });
      expect(locale.formatDate).toHaveBeenCalled();
    });
  });

  describe('Platform specific behavior', () => {
    it('handles date initialization differently on iOS', () => {
      Platform.OS = 'ios';
      renderComponent({
        value: '2023-10-20',
      });
      expect(locale.formatDate).toHaveBeenCalled();
    });

    it('handles date initialization on Android', () => {
      Platform.OS = 'android';
      renderComponent({
        value: '2023-10-20',
      });
      expect(locale.formatDate).toHaveBeenCalled();
    });
  });

  describe('Time mode', () => {
    it('initializes correctly in time mode', () => {
      renderComponent({
        dateMode: 'time',
        value: '14:30',
      });
      expect(locale.parseISODate).toHaveBeenCalled();
    });
  });

  describe('Value formatting', () => {
    it('renders default label when no value is present', () => {
      const { getByText } = renderComponent();
      expect(getByText('Reference:Select')).toBeTruthy();
    });
  });
});
