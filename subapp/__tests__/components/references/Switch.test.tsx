import React from 'react';
import { render } from '@testing-library/react-native';
import Switch from '../../../src/components/references/Switch';
import { FieldMode } from '../../../src/components/Field';
import { UI_PATTERNS } from '../../../src/ob-api/constants/uiPatterns';
import FormContext from '../../../src/contexts/FormContext';

// Mock themes
jest.mock('../../../src/themes', () => ({
  defaultTheme: {
    colors: {
      primary: '#202452',
      accent: '#fad614',
      background: '#ffffff',
      surface: '#ffffff',
      text: '#000000',
      disabled: '#cccccc',
      placeholder: '#666666',
      backdrop: 'rgba(0, 0, 0, 0.5)',
      notification: '#f50057'
    }
  }
}));

// Mock react-native-paper
jest.mock('react-native-paper', () => ({
  withTheme: (Component) => (props) => (
    <Component
      {...props}
      theme={{
        colors: {
          primary: '#202452',
          accent: '#fad614'
        }
      }}
    />
  ),
  Switch: 'PaperSwitch',
  RadioButton: 'RadioButton',
  Button: 'Button',
  Dialog: {
    Title: 'Dialog.Title',
    Content: 'Dialog.Content',
    Actions: 'Dialog.Actions'
  },
  Subheading: 'Subheading'
}));

// Mock locale
jest.mock('../../../src/i18n/locale', () => ({
  t: (key: string, params?: any) => {
    if (key === 'Reference:SelectName' && params) {
      return `Select ${params.name}`;
    }
    return key;
  }
}));

describe('Switch Component', () => {
  const defaultProps = {
    field: {
      id: 'test-field',
      name: 'Test Field',
      readOnly: false
    },
    theme: {
      colors: {
        primary: '#202452',
        accent: '#fad614'
      }
    },
    value: false,
    mode: FieldMode.horizontal
  };

  const mockContext = {
    onChangeSwitch: jest.fn(),
    onHideSwitchModal: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly in horizontal mode', () => {
    const { UNSAFE_getByType } = render(
      <FormContext.Provider value={mockContext}>
        <Switch {...defaultProps} />
      </FormContext.Provider>
    );

    expect(UNSAFE_getByType('PaperSwitch')).toBeTruthy();
  });

  it('handles switch value change in horizontal mode', () => {
    const { UNSAFE_getByType } = render(
      <FormContext.Provider value={mockContext}>
        <Switch {...defaultProps} />
      </FormContext.Provider>
    );

    const paperSwitch = UNSAFE_getByType('PaperSwitch');
    paperSwitch.props.onValueChange(true);

    expect(mockContext.onChangeSwitch).toHaveBeenCalledWith(
      defaultProps.field,
      true
    );
  });

  it('disables switch when field is readonly', () => {
    const props = {
      ...defaultProps,
      field: {
        ...defaultProps.field,
        readOnly: true
      }
    };

    const { UNSAFE_getByType } = render(
      <FormContext.Provider value={mockContext}>
        <Switch {...props} />
      </FormContext.Provider>
    );

    const paperSwitch = UNSAFE_getByType('PaperSwitch');
    expect(paperSwitch.props.disabled).toBe(true);
  });

  it('disables switch when UI pattern is read-only', () => {
    const props = {
      ...defaultProps,
      tabUIPattern: UI_PATTERNS.RO
    };

    const { UNSAFE_getByType } = render(
      <FormContext.Provider value={mockContext}>
        <Switch {...props} />
      </FormContext.Provider>
    );

    const paperSwitch = UNSAFE_getByType('PaperSwitch');
    expect(paperSwitch.props.disabled).toBe(true);
  });
});
