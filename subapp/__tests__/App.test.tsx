import 'react-native';
import { OBRest } from "etrest";
import { RecordService } from "../src/ob-api/services/RecordService";

// Constants
const TEST_CONFIG = {
  USER: 'admin',
  PASS: 'admin',
  PRODUCT_WINDOW_ID: '140',
  PRODUCT_ID: '7206FAA45A3842659D93F59CCA2B0613',
  PRODUCT_NAME: 'Cola 0,5L'
};

// Mock window data
const mockWindow = {
  tabs: new Array(15).fill({
    id: 'mock-tab-id',
    tabLevel: 0,
    processes: new Array(6).fill({})
  })
};

// Mock implementations
const mockWindows = {
  loadWindows: jest.fn().mockResolvedValue(undefined),
  getWindow: jest.fn().mockReturnValue(mockWindow),
  getTabById: jest.fn().mockReturnValue({ id: 'mock-tab-id' }),
  getTabProcessesById: jest.fn().mockReturnValue(new Array(6).fill({})),
  getTabs: jest.fn().mockReturnValue(new Array(2).fill({})),
  getTabProcesses: jest.fn().mockReturnValue(new Array(3).fill({})),
  getWindowEntities: jest.fn().mockReturnValue([
    [{
      level: 0,
      sequenceNumber: 10,
      entityName: 'Product',
      criteria: null,
      hqlOrderByClause: null,
      parentColumns: []
    }]
  ])
};

// Mocks
jest.mock('../src/stores', () => ({
  Windows: mockWindows
}));

jest.mock('etrest', () => ({
  OBRest: {
    init: jest.fn().mockResolvedValue(undefined),
    loginWithUserAndPassword: jest.fn().mockResolvedValue(undefined),
    getInstance: jest.fn().mockReturnValue({
      createCriteria: jest.fn().mockReturnValue({
        setShowIdentifiers: jest.fn().mockReturnThis(),
        list: jest.fn().mockResolvedValue([])
      }),
      getAxios: jest.fn()
    })
  }
}));

jest.mock('../src/ob-api/services/RecordService', () => ({
  RecordService: {
    onSave: jest.fn()
  }
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native-orientation-locker', () => ({
  lockToLandscape: jest.fn(),
  lockToPortrait: jest.fn()
}));

describe('App Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Windows Store Unit Tests', () => {
    test('getWindow returns correct window structure', () => {
      const window = mockWindows.getWindow(TEST_CONFIG.PRODUCT_WINDOW_ID);
      expect(window).toBeDefined();
      expect(window).toEqual(mockWindow);
      expect(mockWindows.getWindow).toHaveBeenCalledWith(TEST_CONFIG.PRODUCT_WINDOW_ID);
    });

    test('getTabById returns correct tab', () => {
      const tab = mockWindows.getTabById(TEST_CONFIG.PRODUCT_WINDOW_ID, TEST_CONFIG.TAB_PRODUCT_ID);
      expect(tab).toBeDefined();
      expect(tab.id).toBe('mock-tab-id');
      expect(mockWindows.getTabById).toHaveBeenCalledWith(
        TEST_CONFIG.PRODUCT_WINDOW_ID,
        TEST_CONFIG.TAB_PRODUCT_ID
      );
    });

    test('getTabProcessesById returns correct processes', () => {
      const processes = mockWindows.getTabProcessesById(
        TEST_CONFIG.PRODUCT_WINDOW_ID,
        TEST_CONFIG.TAB_PRODUCT_ID
      );
      expect(processes).toHaveLength(6);
      expect(mockWindows.getTabProcessesById).toHaveBeenCalled();
    });

    test('getWindowEntities returns correct entity structure', () => {
      const entities = mockWindows.getWindowEntities(TEST_CONFIG.PRODUCT_WINDOW_ID);
      expect(entities[0][0].entityName).toBe('Product');
      expect(mockWindows.getWindowEntities).toHaveBeenCalledWith(TEST_CONFIG.PRODUCT_WINDOW_ID);
    });
  });

  describe('Authentication Tests', () => {
    test('initializes and authenticates successfully', async () => {
      await OBRest.init({ href: TEST_CONFIG.URL });
      expect(OBRest.init).toHaveBeenCalledWith({ href: TEST_CONFIG.URL });

      await OBRest.loginWithUserAndPassword(TEST_CONFIG.USER, TEST_CONFIG.PASS);
      expect(OBRest.loginWithUserAndPassword).toHaveBeenCalledWith(
        TEST_CONFIG.USER,
        TEST_CONFIG.PASS
      );
    });

    test('loads windows after authentication', async () => {
      await mockWindows.loadWindows('en_US');
      expect(mockWindows.loadWindows).toHaveBeenCalledWith('en_US');

      const window = mockWindows.getWindow(TEST_CONFIG.PRODUCT_WINDOW_ID);
      expect(window).toBeDefined();
      expect(window.tabs).toBeDefined();
    });
  });

  describe('Product Operations Tests', () => {
    const mockProduct = {
      id: TEST_CONFIG.PRODUCT_ID,
      name: TEST_CONFIG.PRODUCT_NAME,
      updated: new Date().toISOString(),
      _entityName: 'Product'
    };

    test('handles product updates successfully', async () => {
      const updatedName = `${TEST_CONFIG.PRODUCT_NAME} updated`;
      const updatedProduct = { ...mockProduct, name: updatedName };
      
      (RecordService.onSave as jest.Mock).mockResolvedValueOnce(updatedProduct);
      const result = await RecordService.onSave(updatedProduct);
      
      expect(result.name).toBe(updatedName);
      expect(RecordService.onSave).toHaveBeenCalledWith(updatedProduct);
    });

    test('handles optimistic locking errors', async () => {
      const errorMessage = 'The record you are saving has already been changed by another user or process.';
      (RecordService.onSave as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));
      
      await expect(RecordService.onSave(mockProduct)).rejects.toThrow(errorMessage);
      expect(RecordService.onSave).toHaveBeenCalledWith(mockProduct);
    });
  });

  describe('Error Handling Tests', () => {
    test('handles initialization failures', async () => {
      const errorMessage = 'Network error';
      (OBRest.init as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));
      
      await expect(OBRest.init({ href: TEST_CONFIG.URL }))
        .rejects
        .toThrow(errorMessage);
    });

    test('handles authentication failures', async () => {
      const errorMessage = 'Invalid credentials';
      (OBRest.loginWithUserAndPassword as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));
      
      await expect(OBRest.loginWithUserAndPassword(TEST_CONFIG.USER, TEST_CONFIG.PASS))
        .rejects
        .toThrow(errorMessage);
    });
  });
});
