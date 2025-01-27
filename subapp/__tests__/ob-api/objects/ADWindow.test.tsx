import { OBRest } from "etrest";
import ADWindow from "../../../src/ob-api/objects/ADWindow";

// Mock the OBRest module
jest.mock("etrest", () => ({
  OBRest: {
    getInstance: jest.fn().mockReturnValue({
      callWebService: jest.fn(),
    }),
  },
}));

describe("ADWindow", () => {
  const mockInstance = OBRest.getInstance();

  beforeEach(() => {
    // Clear mock calls before each test
    jest.clearAllMocks();
  });

  describe("getWindow", () => {
    const windowId = "123";
    const language = "en_US";

    test("should call the webservice with correct parameters for a single window", async () => {
      // Call the method
      await ADWindow.getWindow(windowId, language);

      // Check if the webservice was called with correct parameters
      expect(mockInstance.callWebService).toHaveBeenCalledWith(
        `com.smf.mobile.utils.Window?windowId=${windowId}&language=${language}`,
        "GET",
        [],
        null
      );
      expect(mockInstance.callWebService).toHaveBeenCalledTimes(1);
    });

    test("should return the webservice response for a single window", async () => {
      const mockResponse = { windowData: "test data" };
      mockInstance.callWebService.mockResolvedValueOnce(mockResponse);

      const result = await ADWindow.getWindow(windowId, language);

      expect(result).toEqual(mockResponse);
    });

    test("should handle webservice errors for a single window", async () => {
      const mockError = new Error("API Error");
      mockInstance.callWebService.mockRejectedValueOnce(mockError);

      await expect(ADWindow.getWindow(windowId, language)).rejects.toThrow("API Error");
    });
  });

  describe("getWindows", () => {
    const language = "en_US";

    test("should call the webservice with correct parameters for all windows", async () => {
      // Call the method
      await ADWindow.getWindows(language);

      // Check if the webservice was called with correct parameters
      expect(mockInstance.callWebService).toHaveBeenCalledWith(
        `com.smf.mobile.utils.Window?language=${language}`,
        "GET",
        [],
        null
      );
      expect(mockInstance.callWebService).toHaveBeenCalledTimes(1);
    });

    test("should return the webservice response for all windows", async () => {
      const mockResponse = { windows: ["window1", "window2"] };
      mockInstance.callWebService.mockResolvedValueOnce(mockResponse);

      const result = await ADWindow.getWindows(language);

      expect(result).toEqual(mockResponse);
    });

    test("should handle webservice errors for all windows", async () => {
      const mockError = new Error("API Error");
      mockInstance.callWebService.mockRejectedValueOnce(mockError);

      await expect(ADWindow.getWindows(language)).rejects.toThrow("API Error");
    });
  });
});
