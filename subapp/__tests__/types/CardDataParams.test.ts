import { CardDataParams, ICardDataParams } from '../../src/types/CardDataParams';
import { IOBDalEntity } from '../../src/ob-api/classes/OBDal';
import { IRecord } from '../../src/types/Record';
import { IField } from '../../src/components/Field';

describe('CardDataParams', () => {
  // Mock data
  const mockField: IField = {
    name: 'testField',
    value: 'testValue',
    type: 'string'
  };

  const mockEntity: IOBDalEntity = {
    _entityName: 'TestEntity',
    id: 'test-id'
  };

  const mockRecord: IRecord = {
    id: 'record-1',
    entityName: 'TestEntity'
  };

  const mockProps: ICardDataParams = {
    label: 'Test Label',
    isSalesTransaction: true,
    windowId: 'window-1',
    windowName: 'Test Window',
    entitiesByLevel: [mockEntity],
    tabLevel: 1,
    tabIndex: '1',
    currentRecordId: 'record-1',
    parentRecordId: 'parent-1',
    parentEntity: 'ParentEntity',
    currentRecord: mockRecord,
    fields: [mockField]
  };

  describe('constructor', () => {
    it('should create an instance with all properties correctly set', () => {
      const cardData = new CardDataParams(mockProps);

      expect(cardData.label).toBe(mockProps.label);
      expect(cardData.isSalesTransaction).toBe(mockProps.isSalesTransaction);
      expect(cardData.windowId).toBe(mockProps.windowId);
      expect(cardData.windowName).toBe(mockProps.windowName);
      expect(cardData.entitiesByLevel).toEqual(mockProps.entitiesByLevel);
      expect(cardData.tabLevel).toBe(mockProps.tabLevel);
      expect(cardData.tabIndex).toBe(mockProps.tabIndex);
      expect(cardData.currentRecordId).toBe(mockProps.currentRecordId);
      expect(cardData.parentRecordId).toBe(mockProps.parentRecordId);
      expect(cardData.parentEntity).toBe(mockProps.parentEntity);
      expect(cardData.currentRecord).toEqual(mockProps.currentRecord);
    });

    it('should handle optional properties being undefined', () => {
      const minimalProps: ICardDataParams = {
        label: 'Test Label',
        isSalesTransaction: false,
        windowId: 'window-1',
        windowName: 'Test Window',
        entitiesByLevel: [],
        tabLevel: 0,
        fields: []
      };

      const cardData = new CardDataParams(minimalProps);

      expect(cardData.tabIndex).toBeUndefined();
      expect(cardData.currentRecordId).toBeUndefined();
      expect(cardData.parentRecordId).toBeUndefined();
      expect(cardData.parentEntity).toBeUndefined();
      expect(cardData.currentRecord).toBeUndefined();
    });
  });

  describe('route method', () => {
    it('should update tabIndex and label when route is called', () => {
      const cardData = new CardDataParams(mockProps);
      const newRouteKey = '2';
      const newRouteTitle = 'New Route';

      const result = cardData.route(newRouteKey, newRouteTitle);

      expect(result.tabIndex).toBe(newRouteKey);
      expect(result.label).toBe(newRouteTitle);
      expect(result).toBe(cardData); // Should return the same instance
    });

    it('should maintain other properties when route is called', () => {
      const cardData = new CardDataParams(mockProps);
      const initialWindowId = cardData.windowId;
      const initialEntities = [...cardData.entitiesByLevel];

      cardData.route('new-key', 'new-title');

      expect(cardData.windowId).toBe(initialWindowId);
      expect(cardData.entitiesByLevel).toEqual(initialEntities);
    });
  });

  describe('type safety', () => {
    it('should not allow undefined required properties', () => {
      // @ts-expect-error - Testing type safety for required properties
      const invalidProps: ICardDataParams = {
        label: 'Test'
        // Missing required properties should cause TypeScript error
      };
    });

    it('should allow optional properties to be undefined', () => {
      const validProps: ICardDataParams = {
        label: 'Test Label',
        isSalesTransaction: false,
        windowId: 'window-1',
        windowName: 'Test Window',
        entitiesByLevel: [],
        tabLevel: 0,
        fields: []
        // Optional properties not included
      };

      const cardData = new CardDataParams(validProps);
      expect(cardData).toBeInstanceOf(CardDataParams);
    });
  });
});
