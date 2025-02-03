import locale from '../../src/i18n/locale';

jest.mock('../../src/i18n/config', () => ({
  supportedLocales: {
    'en-US': {
      loadTranslations: {
        'Hello': 'Hello',
        'NoSuportedLanguage': 'Language {input} not supported',
      }
    },
    'es-ES': {
      loadTranslations: {
        'Hello': 'Hola',
      }
    }
  }
}));

import { References } from '../../src/constants/References';

describe('Locale Module', () => {
  beforeEach(() => {
    locale.currentDateLocale = 'en-US';
    locale.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize currentDateLocale correctly', () => {
      locale.init();
      expect(locale.currentDateLocale).toBe('en-US');
    });
  });

  describe('Translation Functionality - t()', () => {
    test('should return correct translation for existing key', () => {
      const result = locale.t('Hello');
      expect(result).toBe('Hello');
    });

    test('should perform parameter interpolation correctly', () => {
      const result = locale.t('NoSuportedLanguage', { input: 'fr-FR' });
      expect(result).toBe('Language fr-FR not supported');
    });

    test('should return empty string for non-existent key', () => {
      const result = locale.t('NonExistentKey');
      expect(result).toBe('');
    });
  });

  describe('Language Switching - setCurrentLanguage()', () => {
    test('should set the current language if supported', () => {
      locale.setCurrentLanguage('es-ES');
      expect(locale.currentDateLocale).toBe('es-ES');
    });

  });

  describe('Date Formats', () => {
    test('should return correct server date format', () => {
      expect(locale.getServerDateFormat(References.Date)).toBe('yyyy-MM-dd');
      expect(locale.getServerDateFormat(References.Time)).toBe('HH:mm:ss');
      expect(locale.getServerDateFormat(References.DateTime)).toBe('yyyy-MM-dd\'T\'HH:mm:ssxxx');
    });

    test('should return correct UI date format', () => {
      expect(locale.getUIDateFormat(References.Date)).toBe('yyyy-MM-dd');
      expect(locale.getUIDateFormat(References.Time)).toBe('HH:mm');
      expect(locale.getUIDateFormat(References.DateTime)).toBe('yyyy-MM-dd HH:mm:ss');
    });
  });

  describe('Device Locale', () => {
    test('should return the default device locale', () => {
      expect(locale.getDeviceLocale()).toBe('en-US');
    });

  });
});
