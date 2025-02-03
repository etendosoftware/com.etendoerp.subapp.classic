import TabContext from '../../src/contexts/TabContext';
import { IRecord } from '../../src/types/Record';
import { ADTab } from '../../src/ob-api/objects/ADTab';
import { FabAction } from '../../src/types/FabAction';

describe('TabContext', () => {
  describe('Context Type Definition', () => {
 
    test('should have default empty context values', () => {
      const defaultContext = TabContext['_currentValue'];

      expect(defaultContext.onSave).toBeUndefined();
      expect(defaultContext.currentRecord).toBeUndefined();
      expect(defaultContext.setCurrentRecord).toBeUndefined();
      expect(defaultContext.currentTab).toBeUndefined();
      expect(defaultContext.fabActions).toBeUndefined();
    });

    test('should be a valid React Context', () => {
      expect(TabContext).toBeDefined();
      expect(TabContext.Provider).toBeDefined();
      expect(TabContext.Consumer).toBeDefined();
    });
  });

  describe('Context Type Validation', () => {
    test('should allow type casting with correct properties', () => {
      const mockTabContext = {
        onSave: jest.fn(),
        currentRecord: {} as IRecord,
        setCurrentRecord: jest.fn(),
        currentTab: {} as ADTab,
        fabActions: [] as FabAction[],
        windowId: 'test-window',
        tabLevel: 0
      };

      const typedContext: typeof TabContext['_currentValue'] = mockTabContext;

      expect(typedContext.onSave).toBeDefined();
      expect(typedContext.currentRecord).toBeDefined();
      expect(typedContext.currentTab).toBeDefined();
    });
  });

  describe('Type Compatibility', () => {
    test('context should allow partial property assignment', () => {
      const partialContext = {
        windowId: 'test-window'
      };

      const mergedContext: typeof TabContext['_currentValue'] = {
        ...TabContext['_currentValue'],
        ...partialContext
      };

      expect(mergedContext.windowId).toBe('test-window');
    });
  });
});
