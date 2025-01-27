const defaultTheme = {
    dark: false,
    mode: 'exact',
    roundness: 4,
    colors: {
      primary: '#202452',
      accent: '#fad614',
      background: '#ffffff',
      surface: '#ffffff',
      text: '#000000',
      error: '#B00020',
      disabled: '#000000',
      placeholder: '#000000',
      backdrop: '#000000',
      onSurface: '#000000',
      notification: '#000000',
      card: '#ffffff',
      border: '#000000',
    },
    fonts: {},
    animation: {
      scale: 1,
    },
  };
  
  const mockTabContext = {
    showSnackbar: jest.fn(),
    windowId: 'test-window',
    currentTab: {
      uIPattern: 'standard',
    },
  };
  
  jest.mock('../../../src/contexts/TabContext', () => ({
    __esModule: true,
    default: {
      Consumer: jest.fn(),
      Provider: jest.fn(),
      _currentValue: mockTabContext,
    },
  }));
  
  jest.mock('react-native-paper', () => ({
    DefaultTheme: defaultTheme,
    Chip: 'Chip',
    configureFonts: jest.fn(),
  }));
  
  jest.mock('../../../src/themes', () => ({ 
    __esModule: true,
    default: defaultTheme,
  }));
  
  // Mock AsyncStorage
  jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
  }));
  
  // Mock react-native-vision-camera
  jest.mock('react-native-vision-camera', () => ({
    Camera: 'Camera',
    useCodeScanner: jest.fn(),
    useCameraPermission: jest.fn(() => ({ hasPermission: true })),
    useCameraDevice: jest.fn(() => ({ device: 'back' })),
  }));
  
  // Mock mobx
  jest.mock('mobx', () => ({
    observable: jest.fn(),
    action: jest.fn(),
    reaction: jest.fn(),
    configure: jest.fn(),
    decorate: jest.fn(),
    computed: jest.fn(),
    isObservableProp: jest.fn(),
    toJS: jest.fn(),
    spy: jest.fn(),
    version: '5.15.4',
  }));
  
  // Mock mobx-react
  jest.mock('mobx-react', () => ({
    observer: component => component,
    inject: () => component => component,
  }));
  
  // Mock mobx-persist
  jest.mock('mobx-persist', () => ({
    hydrate: jest.fn(() => Promise.resolve()),
    create: jest.fn(),
    persist: jest.fn(),
  }));
  
  // Mock react-native-gesture-handler
  jest.mock('react-native-gesture-handler', () => ({
    ScrollView: 'ScrollView',
  }));
  
  // Mock components
  jest.mock('../../../src/components/Reference', () => 'Reference');
  jest.mock('../../../src/components/tabSearchBar/Searchbar', () => 'Searchbar');
  jest.mock('../../../src/components/tabSearchBar/Banner', () => 'Banner');
  jest.mock('../../../src/components/CameraBarCode', () => 'CameraBarCode'); 
  jest.mock('../../../src/components/ScanDialog', () => 'ScanDialog');
  jest.mock('../../../src/components/Field', () => 'Field');
  jest.mock('../../../src/components/record/RecordOptions', () => 'RecordOptions');
  jest.mock('../../../src/components/record/RecordTabView', () => 'RecordTabView');
  jest.mock('../../../src/components/Tab', () => 'Tab');
  
  // Mock i18n locale
  jest.mock('../../../src/i18n/locale', () => ({
    t: (key: string) => key,
  }));
  
  // Mock stores
  jest.mock('../../../src/stores', () => ({
    stores: {
      user: {
        currentWindow: null,
        currentTab: null,
      },
      windows: {
        hydrated: true,
      },
    },
  }));
  
  // Mock FormContext
  jest.mock('../../../src/contexts/FormContext', () => ({
    __esModule: true,
    default: {
      Provider: ({ children }) => children,
    },
  }));
  
  import React from 'react';
  import { render } from '@testing-library/react-native';
  import TabSearchBar from '../../../src/components/tabSearchBar/TabSearchBar';
  import TabContext from '../../../src/contexts/TabContext';
  
  describe('TabSearchBar - Basic Tests', () => {
    const mockProps = {
      filters: [],
      onChangeFilters: jest.fn(),
      tabId: 'test-tab',
      fields: {},
      identifiers: [],
    };
  
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('renders correctly', () => {
      const component = render(
        <TabContext.Provider value={mockTabContext}>
          <TabSearchBar {...mockProps} />
        </TabContext.Provider>
      );
      expect(component).toBeTruthy();
    });
  });
  