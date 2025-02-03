import { BreadCrumbs, NEW_RECORD } from "../../src/types/RouteParams";
import { IRecord } from "../../src/types/Record";

describe('RouteParams', () => {
  describe('BreadCrumbs', () => {
    test('should create BreadCrumbs with record id', () => {
      // Arrange
      const mockRecord: IRecord = {
        id: 'test-id',
        _entityName: 'TestEntity',
        $ref: 'test-ref'
      };

      // Act
      const breadCrumbs = new BreadCrumbs(mockRecord);

      // Assert
      expect(breadCrumbs.label).toBe('test-id');
    });
  });

  describe('NEW_RECORD', () => {
    test('should have the correct value', () => {
      expect(NEW_RECORD).toBe('-1');
    });
  });
});
