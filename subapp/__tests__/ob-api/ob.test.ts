import { OBRest } from 'etrest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUrl, formatUrl, setUrl, SUCCESS, NOT_FOUND, FORBIDDEN, ERROR } from '../../src/ob-api/ob';

// Mock dependencies
jest.mock('etrest', () => ({
  OBRest: {
    init: jest.fn()
  }
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn()
}));

describe('OB API Module', () => {
  // Clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Constants Tests
  describe('Constants', () => {
    test('should have correct constant values', () => {
      expect(SUCCESS).toBe(0);
      expect(FORBIDDEN).toBe(1);
      expect(ERROR).toBe(2);
      expect(NOT_FOUND).toBe(3);
    });
  });

  // formatUrl Tests
  describe('formatUrl', () => {
    test('should add http:// prefix if not present', () => {
      expect(formatUrl('example.com')).toBe('http://example.com/');
      expect(formatUrl('https://example.com')).toBe('https://example.com/');
    });

    test('should add trailing slash if not present', () => {
      expect(formatUrl('http://example.com')).toBe('http://example.com/');
    });

    test('should return undefined if no url is provided', () => {
      expect(formatUrl()).toBeUndefined();
    });
  });

  // getUrl Tests
  describe('getUrl', () => {
    test('should call AsyncStorage.getItem with correct key', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('http://test.com/');
      
      const url = await getUrl();
      
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('baseUrl');
      expect(url).toBe('http://test.com/');
    });
  });

  // setUrl Tests
  describe('setUrl', () => {
    test('should set url from parameter', async () => {
      const testUrl = 'http://example.com/';
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(null);
      
      const url = await setUrl(testUrl);
      
      expect(url).toBe(testUrl);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('baseUrl', testUrl);
      expect(OBRest.init).toHaveBeenCalledWith({ href: testUrl });
    });

    test('should retrieve url from AsyncStorage if no parameter provided', async () => {
      const storedUrl = 'http://stored.com/';
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(storedUrl);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(null);
      
      const url = await setUrl();
      
      expect(url).toBe(storedUrl);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('baseUrl');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('baseUrl', storedUrl);
      expect(OBRest.init).toHaveBeenCalledWith({ href: storedUrl });
    });

  });
});
