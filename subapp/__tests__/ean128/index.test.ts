import EANParser, { SMFEAN } from '../../src/ean128';

describe('EANParser', () => {
  let eanParser: EANParser;
  
  const mockConfig = [
    {
      id: 'test-config-1',
      eanTypeName: 'GS1-128',
      isdefault: true,
      ai: '01',
      contentLength: 14,
      isFixedLength: true,
      dataType: SMFEAN.EANDataTypes.String
    },
    {
      id: 'test-config-2',
      eanTypeName: 'GS1-128',
      ai: '15',
      contentLength: 6,
      isFixedLength: true,
      dataType: SMFEAN.EANDataTypes.Date
    },
    {
      id: 'test-config-3',
      eanTypeName: 'GS1-128',
      ai: '3100',
      contentLength: 6,
      isFixedLength: true,
      dataType: SMFEAN.EANDataTypes.Decimal
    }
  ];

  beforeEach(() => {
    eanParser = new EANParser(mockConfig);
  });

  describe('Constructor and Initialization', () => {
    test('initializes with config', () => {
      expect(eanParser.config).toEqual(mockConfig);
      expect(eanParser.fncChar).toBe(String.fromCharCode(29));
    });
  });

  describe('setConfig method', () => {
    test('updates configuration', () => {
      const newConfig = [{ 
        id: 'new-config', 
        ai: '02', 
        contentLength: 10,
        isFixedLength: true 
      }];
      
      eanParser.setConfig(newConfig);
      expect(eanParser.config).toEqual(newConfig);
    });
  });

  describe('handleFormat method', () => {
    test('handles Integer type', () => {
      const result = eanParser.handleFormat('123', null, SMFEAN.EANDataTypes.Integer);
      expect(result).toBe(123);
    });

    test('handles Decimal type', () => {
      const result = eanParser.handleFormat('1234', '2', SMFEAN.EANDataTypes.Decimal);
      expect(result).toBe('12.34');
    });

    test('handles String type', () => {
      const result = eanParser.handleFormat('test', null, SMFEAN.EANDataTypes.String);
      expect(result).toBe('test');
    });

    test('handles Date type', () => {
      const result = eanParser.handleFormat('230630', null, SMFEAN.EANDataTypes.Date);
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(5); // 0-indexed
      expect(result.getDate()).toBe(30);
    });

    test('handles invalid decimal format', () => {
      const result = eanParser.handleFormat('1234', 'invalid', SMFEAN.EANDataTypes.Decimal);
      expect(result).toBe('1234');
    });
  });

  describe('parse method', () => {
    test('parses single AI correctly', () => {
      const eanCode = '0112345678901234';
      const result = eanParser.parse(eanCode);
      
      expect(result).toHaveProperty('AIs');
      expect(result.AIs['01']).toBe('12345678901234');
      expect(result.originalBarcode).toBe(eanCode);
    });

    test('handles decimal AI correctly', () => {
      const eanCode = '3100123456';
      const result = eanParser.parse(eanCode);
      
      expect(result).toHaveProperty('AIs');
      expect(result.AIs['3100']).toBe('123456');
      expect(result.originalBarcode).toBe(eanCode);
    });

    test('returns error when no config is set', () => {
      const parserWithoutConfig = new EANParser(null);
      const result = parserWithoutConfig.parse('01234567890123');
      
      expect(result).toEqual({
        error: true,
        errorMessage: 'No configuration was supplied'
      });
    });

    test('handles parsing with max loop protection', () => {
      const longEanCode = '0'.repeat(1000);
      const result = eanParser.parse(longEanCode);

      expect(result).toEqual({
        error: true,
        errorMessage: `${longEanCode} was scanned without any result`
      });
    });
  });

  describe('SMFEAN Constants', () => {
    test('constants are defined correctly', () => {
      expect(SMFEAN.EANDataTypes).toEqual({
        Integer: 'Integer',
        Decimal: 'Decimal',
        Date: 'Date',
        String: 'String'
      });

      expect(SMFEAN.Constants.EAN_DATE_FORMAT).toBe('yyMMdd');
      expect(SMFEAN.Constants.MAX_EAN_PARSE_LOOPS).toBe(10);
    });
  });
});
