import { DisplayedIdentifiers } from '../../../src/ob-api/objects/DisplayedIdentifiers';

describe('DisplayedIdentifiers', () => {
  describe('constructor', () => {
    test('should create an instance with all properties correctly initialized', () => {
      // Arrange
      const id = 'test-id';
      const name = 'Test Name';
      const value = 'Test Value';
      const seqno = 1;

      // Act
      const displayedIdentifiers = new DisplayedIdentifiers(id, name, value, seqno);

      // Assert
      expect(displayedIdentifiers).toBeInstanceOf(DisplayedIdentifiers);
      expect(displayedIdentifiers.id).toBe(id);
      expect(displayedIdentifiers.name).toBe(name);
      expect(displayedIdentifiers.value).toBe(value);
      expect(displayedIdentifiers.seqno).toBe(seqno);
    });

    test('should handle different types of values', () => {
      // Arrange
      const testCases = [
        {
          id: 1,
          name: 'Numeric Name',
          value: 100,
          seqno: 1
        },
        {
          id: 'string-id',
          name: null,
          value: undefined,
          seqno: 0
        },
        {
          id: Symbol('id'),
          name: '',
          value: false,
          seqno: -1
        }
      ];

      testCases.forEach(testCase => {
        // Act
        const displayedIdentifiers = new DisplayedIdentifiers(
          testCase.id,
          testCase.name,
          testCase.value,
          testCase.seqno
        );

        // Assert
        expect(displayedIdentifiers.id).toBe(testCase.id);
        expect(displayedIdentifiers.name).toBe(testCase.name);
        expect(displayedIdentifiers.value).toBe(testCase.value);
        expect(displayedIdentifiers.seqno).toBe(testCase.seqno);
      });
    });
  });
});
