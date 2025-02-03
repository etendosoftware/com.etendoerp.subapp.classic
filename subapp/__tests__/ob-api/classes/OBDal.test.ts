import { OBDal } from "../../../src/ob-api/classes/OBDal";
import { OBRest, Restrictions } from "etrest";
import { ADTab } from "../../../src/ob-api/objects/ADTab";
import { FilterValue } from "../../../src/types";
import locale from "../../../src/i18n/locale";

jest.mock("etrest");
jest.mock("../../../src/i18n/locale", () => ({
  t: jest.fn((key) => key)
}));

// Mock __DEV__ global
(global as any).__DEV__ = false;

describe("OBDal", () => {
  let originalConsoleLog;
  
  beforeAll(() => {
    originalConsoleLog = console.log;
    console.log = jest.fn();
  });

  afterAll(() => {
    console.log = originalConsoleLog;
  });

  const mockCriteria = {
    setShowIdentifiers: jest.fn().mockReturnThis(),
    add: jest.fn().mockReturnThis(),
    setFirstResult: jest.fn().mockReturnThis(),
    setMaxResults: jest.fn().mockReturnThis(),
    setAdditionalParameters: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    list: jest.fn().mockResolvedValue([])
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (OBRest.getInstance as jest.Mock).mockReturnValue({
      createCriteria: jest.fn().mockReturnValue(mockCriteria),
      getOBContext: jest.fn().mockReturnValue({ getClientId: () => "testClient" })
    });
  });

  describe("getOrderByClauses", () => {
    it("should return default order when no hqlOrderByClause provided", () => {
      const entity = { entityName: "test" } as IOBDalEntity;
      const result = OBDal.getOrderByClauses(entity);
      expect(result).toEqual([{ name: "creationDate", asc: false }]);
    });

    it("should parse hqlOrderByClause correctly with multiple orders", () => {
      const entity = {
        entityName: "test",
        hqlOrderByClause: "name asc, date desc, id asc"
      } as IOBDalEntity;

      const result = OBDal.getOrderByClauses(entity);
      expect(result).toEqual([
        { name: "name", asc: true },
        { name: "date", asc: false },
        { name: "id", asc: true }
      ]);
    });

    it("should handle empty parts in order clause", () => {
      const entity = {
        entityName: "test",
        hqlOrderByClause: "name asc,, date desc"
      } as IOBDalEntity;

      const result = OBDal.getOrderByClauses(entity);
      expect(result).toEqual([
        { name: "name", asc: true },
        { name: "date", asc: false }
      ]);
    });

    it("should handle order clause with no direction specified", () => {
      const entity = {
        entityName: "test",
        hqlOrderByClause: "name, date"
      } as IOBDalEntity;

      const result = OBDal.getOrderByClauses(entity);
      expect(result).toEqual([
        { name: "name", asc: true },
        { name: "date", asc: true }
      ]);
    });
  });

  describe("getRestrictions", () => {
    const baseFilters: FilterValue[] = [{
      fieldID: "testField",
      value: "testValue",
      property: "testProperty",
      propertyType: "String",
      isSearchBar: false
    }];

    it("should handle multiple property types", () => {
      const entity = {} as IOBDalEntity;
      const currentTab = { fields: {} } as ADTab;
      const propertyTypes = ["Search", "Table", "TableDir", "String", "Text", "OBUISEL_Selector Reference"];

      propertyTypes.forEach(type => {
        const filters = [{
          ...baseFilters[0],
          propertyType: type,
          isSearchBar: type === "Search"
        }];

        OBDal.getRestrictions(entity, false, currentTab, "", "", filters);

        if (type === "String" || type === "Text") {
          expect(Restrictions.iContains).toHaveBeenCalled();
        } else if (type === "Search" && filters[0].isSearchBar) {
          expect(Restrictions.iContains).toHaveBeenCalled();
        } else {
          expect(Restrictions.equals).toHaveBeenCalled();
        }
      });
    });

    it("should handle multiple filters for same field", () => {
      const entity = {} as IOBDalEntity;
      const currentTab = { fields: {} } as ADTab;
      const filters: FilterValue[] = [
        { ...baseFilters[0], value: "value1" },
        { ...baseFilters[0], value: "value2" }
      ];

      OBDal.getRestrictions(entity, false, currentTab, "", "", filters);
      expect(Restrictions.or).toHaveBeenCalled();
    });

    it("should handle missing locale translation", () => {
      const entity = {} as IOBDalEntity;
      const currentTab = { fields: {} } as ADTab;
      (locale.t as jest.Mock).mockReturnValue("missing_translation");
      
      const filters = [{
        ...baseFilters[0],
        propertyType: "CustomType"
      }];

      OBDal.getRestrictions(entity, false, currentTab, "", "", filters);
      expect(Restrictions.equals).toHaveBeenCalled();
    });
  });

  describe("tabRecords", () => {
    const defaultParams = {
      entity: {} as IOBDalEntity,
      isSalesTransaction: false,
      currentTab: { id: "tab1", fields: {} } as ADTab,
      parentRecordId: "",
      context: { contextKey: "contextValue" },
      currentRecordId: "",
      entityName: "TestEntity",
      filters: [],
      pageOffset: 0,
      pageSize: 10
    };

    it("should merge context with tabId in additional parameters", async () => {
      await OBDal.tabRecords(
        defaultParams.entity,
        defaultParams.isSalesTransaction,
        defaultParams.currentTab,
        defaultParams.parentRecordId,
        defaultParams.context,
        defaultParams.currentRecordId,
        defaultParams.entityName,
        defaultParams.filters,
        defaultParams.pageOffset,
        defaultParams.pageSize
      );

      expect(mockCriteria.setAdditionalParameters).toHaveBeenCalledWith({
        tabId: "tab1",
        contextKey: "contextValue"
      });
    });

    it("should handle development mode logging", async () => {
      const consoleLogSpy = jest.spyOn(console, 'log');
      (global as any).__DEV__ = true;

      await OBDal.tabRecords(
        defaultParams.entity,
        defaultParams.isSalesTransaction,
        defaultParams.currentTab,
        defaultParams.parentRecordId,
        defaultParams.context,
        defaultParams.currentRecordId,
        defaultParams.entityName,
        defaultParams.filters,
        defaultParams.pageOffset,
        defaultParams.pageSize
      );

      expect(consoleLogSpy).toHaveBeenCalled();
      (global as any).__DEV__ = false;
    });
  });
});
