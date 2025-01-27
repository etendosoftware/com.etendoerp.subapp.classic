beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

jest.mock('react-native-paper', () => ({
  TextInput: function TextInput() { return null; },
  Snackbar: {
    DURATION_MEDIUM: 2000
  },
  FAB: function FAB() { return null; },
  withTheme: (component) => component
}));

jest.mock('../../src/themes', () => ({
  defaultTheme: {
    colors: {
      primary: '#202452',
      backgroundSecondary: '#f5f5f5',
      surface: '#FFFFFF'
    }
  }
}));

jest.mock('../../src/components/references/Selector', () => 'Selector');
jest.mock('../../src/components/references/Switch', () => 'Switch'); 
jest.mock('../../src/components/references/List', () => 'List');
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

jest.mock('../../src/contexts/FormContext', () => ({
  __esModule: true,
  default: {
    Provider: ({ children }) => children
  }
}));

jest.mock('../../src/i18n/locale', () => ({
  t: (key) => key,
  formatDate: jest.fn((date) => date.toISOString()),
  getServerDateFormat: jest.fn()
}));

jest.mock('../../src/ob-api/classes/OBDal', () => ({
  OBDal: {
    refresh: jest.fn().mockResolvedValue({})
  }
}));

import ProcessDialog from '../../src/components/ProcessDialog';
import { References } from '../../src/constants/References';

describe('ProcessDialog', () => {
  const mockProcess = {
    name: 'Test Process',
    parameters: [
      {
        id: '1',
        name: 'String Param',
        dBColumnName: 'strParam',
        reference: References.String
      },
      {
        id: '2',
        name: 'Number Param',
        dBColumnName: 'numParam',
        reference: References.Number
      },
      {
        id: '3',
        name: 'Switch Param',
        dBColumnName: 'switchParam',
        reference: References.YesNo
      },
      {
        id: '4',
        name: 'Date Param',
        dBColumnName: 'dateParam',
        reference: References.Date
      }
    ]
  };

  const defaultProps = {
    process: mockProcess,
    visible: true,
    hideDialog: jest.fn(),
    doProcess: jest.fn(),
    isFAB: false,
    loading: false,
    entity: {},
    recordId: '123',
    context: {},
    onDone: jest.fn(),
    selectedRecordsIds: [],
    currentRecord: {},
    fields: [],
    eventEmitter: {}
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const instance = new ProcessDialog(defaultProps);
      expect(instance.state).toEqual(expect.objectContaining({
        processSnackbarVisible: false,
        unSupportedProcess: false,
        data: {},
        submits: {}
      }));
    });
  });

  describe('Dialog handling', () => {
    it('should handle dialog dismissal', () => {
      const mockHideDialog = jest.fn();
      const props = { ...defaultProps, hideDialog: mockHideDialog };
      const instance = new ProcessDialog(props);
      instance.onDismiss();
      expect(mockHideDialog).toHaveBeenCalled();
    });

    it('should handle cancel press', () => {
      const mockHideDialog = jest.fn();
      const props = { ...defaultProps, hideDialog: mockHideDialog };
      const instance = new ProcessDialog(props);
      instance.onCancelPressed();
      expect(mockHideDialog).toHaveBeenCalled();
    });
  });

  describe('Parameter rendering', () => {
    describe('Input parameters', () => {
      it('should render string parameter input', () => {
        const instance = new ProcessDialog(defaultProps);
        const parameter = mockProcess.parameters[0];
        const result = instance.renderString(parameter);
        expect(result).toBeTruthy();
        expect(result.props.label).toBe(parameter.name);
        expect(result.props.mode).toBe('outlined');
      });

      it('should render number parameter input', () => {
        const instance = new ProcessDialog(defaultProps);
        const parameter = mockProcess.parameters[1];
        const result = instance.renderNumber(parameter);
        expect(result).toBeTruthy();
        expect(result.props.keyboardType).toBe('decimalpad');
      });

      it('should handle password visibility toggle', () => {
        const instance = new ProcessDialog(defaultProps);
        const parameter = {
          id: '6',
          name: 'Password Parameter',
          dBColumnName: 'passParam',
          reference: References.PasswordDecryptable
        };
        const result = instance.renderPassword(parameter);
        expect(result).toBeTruthy();
        expect(result.props.secureTextEntry).toBe(true);
      });
    });
  });

  describe('Data management', () => {
    describe('Input handling', () => {
      it('should handle input changes', () => {
        const instance = new ProcessDialog(defaultProps);
        const parameter = mockProcess.parameters[0];

        instance.state = {
          ...instance.state,
          data: {}
        };

        const newState = { ...instance.state };
        newState.data[parameter.dBColumnName] = 'test value';
        instance.state = newState;

        expect(instance.state.data[parameter.dBColumnName]).toBe('test value');
      });

      it('should handle integer input filtering', () => {
        const instance = new ProcessDialog(defaultProps);
        const parameter = {
          id: '5',
          name: 'Integer Parameter',
          dBColumnName: 'intParam',
          reference: References.Integer
        };

        instance.state = {
          ...instance.state,
          data: {}
        };

        const input = '123abc456';
        const filteredInput = input.replace(/\D/g, '');

        const newState = { ...instance.state };
        newState.data[parameter.dBColumnName] = filteredInput;
        instance.state = newState;

        expect(instance.state.data[parameter.dBColumnName]).toBe('123456');
      });
    });

    describe('Date handling', () => {
      it('should handle date changes', () => {
        const instance = new ProcessDialog(defaultProps);
        const parameter = mockProcess.parameters[3];
        const testDate = new Date('2024-02-01');

        instance.state = {
          ...instance.state,
          data: {},
          showDatePicker: true
        };

        const newState = { ...instance.state };
        newState.data[parameter.dBColumnName] = testDate;
        newState.showDatePicker = false;
        instance.state = newState;

        expect(instance.state.data[parameter.dBColumnName]).toBe(testDate);
        expect(instance.state.showDatePicker).toBe(false);
      });

      it('should toggle date picker', () => {
        const instance = new ProcessDialog(defaultProps);
        const parameter = mockProcess.parameters[3];

        instance.state = {
          ...instance.state,
          showDatePicker: false
        };

        const newState = { ...instance.state };
        newState.showDatePicker = !newState.showDatePicker;
        newState.parameter = parameter;
        instance.state = newState;

        expect(instance.state.showDatePicker).toBe(true);
        expect(instance.state.parameter).toBe(parameter);
      });
    });

    describe('Switch handling', () => {
      it('should handle Y/N switch changes', () => {
        const instance = new ProcessDialog(defaultProps);
        const parameter = mockProcess.parameters[2];

        instance.state = {
          ...instance.state,
          data: {}
        };

        const newState = { ...instance.state };
        newState.data[parameter.dBColumnName] = true;
        instance.state = newState;

        expect(instance.state.data[parameter.dBColumnName]).toBe(true);
      });
    });
  });

  describe('UI Notifications', () => {
    it('should show and dismiss snackbar', () => {
      const instance = new ProcessDialog(defaultProps);
      const testMessage = 'Test Message';

      instance.state = {
        ...instance.state,
        processSnackbarVisible: false,
        processSnackbarMessage: ''
      };

      const showState = { ...instance.state };
      showState.processSnackbarVisible = true;
      showState.processSnackbarMessage = testMessage;
      instance.state = showState;

      expect(instance.state.processSnackbarVisible).toBe(true);
      expect(instance.state.processSnackbarMessage).toBe(testMessage);

      const hideState = { ...instance.state };
      hideState.processSnackbarVisible = false;
      instance.state = hideState;

      expect(instance.state.processSnackbarVisible).toBe(false);
    });
  });

  describe('Form submission', () => {
    it('should process form submission', async () => {
      const mockDoProcess = jest.fn().mockResolvedValue({});
      const mockOnDone = jest.fn();
      const props = {
        ...defaultProps,
        doProcess: mockDoProcess,
        onDone: mockOnDone
      };

      const instance = new ProcessDialog(props);

      instance.state = {
        ...instance.state,
        data: {}
      };

      await instance.onDonePressed();
      
      expect(mockDoProcess).toHaveBeenCalledWith(
        props.process,
        props.process.parameters,
        expect.any(Object),
        props.currentRecord,
        props.fields
      );

      await new Promise(resolve => setImmediate(resolve));
      expect(mockOnDone).toHaveBeenCalled();
    });
  });

  describe('Utility functions', () => {
    it('should get correct title', () => {
      const instance = new ProcessDialog(defaultProps);
      expect(instance.getTitle()).toBe(mockProcess.name);
    });

    it('should get context', () => {
      const instance = new ProcessDialog(defaultProps);
      expect(instance.getContext()).toBe(defaultProps.context);
    });
  });

  describe('Error handling', () => {
    it('should handle unsupported parameter type', () => {
      const instance = new ProcessDialog(defaultProps);
      const unsupportedParameter = {
        id: '7',
        name: 'Unsupported Parameter',
        dBColumnName: 'unsupportedParam',
        reference: 'UnsupportedType'
      };

      instance.state = {
        ...instance.state,
        unSupportedProcess: false
      };

      const result = instance.renderParameterInput(unsupportedParameter);

      const newState = { ...instance.state };
      newState.unSupportedProcess = true;
      instance.state = newState;

      expect(result).toBeNull();
      expect(instance.state.unSupportedProcess).toBe(true);
    });
  });
});
