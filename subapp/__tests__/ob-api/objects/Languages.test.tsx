import { OBRest, Restrictions } from "etrest";
import Languages from "../../../src/ob-api/objects/Languages";

// Mock the etrest module
jest.mock("etrest", () => ({
  OBRest: {
    getInstance: jest.fn(),
  },
  Restrictions: {
    equals: jest.fn(),
  },
}));

describe("Languages", () => {
  let mockCriteria: any;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create mock criteria object
    mockCriteria = {
      add: jest.fn().mockReturnThis(),
      setMaxResults: jest.fn().mockReturnThis(),
      list: jest.fn().mockResolvedValue([
        { id: "1", language: "en_US", name: "English (USA)", systemLanguage: "true" },
        { id: "2", language: "es_ES", name: "Spanish (Spain)", systemLanguage: "true" },
      ]),
    };

    // Setup OBRest mock
    (OBRest.getInstance as jest.Mock).mockReturnValue({
      createCriteria: jest.fn().mockReturnValue(mockCriteria),
    });

    // Setup Restrictions.equals mock
    (Restrictions.equals as jest.Mock).mockReturnValue("systemLanguage=true");
  });

  describe("getLanguages", () => {
    test("should create criteria for ADLanguage", async () => {
      await Languages.getLanguages();
      
      expect(OBRest.getInstance().createCriteria).toHaveBeenCalledWith("ADLanguage");
    });

    test("should add system language restriction", async () => {
      await Languages.getLanguages();

      expect(Restrictions.equals).toHaveBeenCalledWith("systemLanguage", "true");
      expect(mockCriteria.add).toHaveBeenCalledWith("systemLanguage=true");
    });

    test("should set max results to 100", async () => {
      await Languages.getLanguages();

      expect(mockCriteria.setMaxResults).toHaveBeenCalledWith(100);
    });

    test("should return list of languages", async () => {
      const result = await Languages.getLanguages();

      expect(mockCriteria.list).toHaveBeenCalled();
      expect(result).toEqual([
        { id: "1", language: "en_US", name: "English (USA)", systemLanguage: "true" },
        { id: "2", language: "es_ES", name: "Spanish (Spain)", systemLanguage: "true" },
      ]);
    });

    test("should handle API errors properly", async () => {
      // Setup error case
      mockCriteria.list.mockRejectedValue(new Error("API Error"));

      await expect(Languages.getLanguages()).rejects.toThrow("API Error");
    });
  });
});
