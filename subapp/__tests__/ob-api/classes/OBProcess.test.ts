import { OBRest } from "etrest";
import OBProcess from "../../../src/ob-api/classes/OBProcess";
import DefaultParams from "../../../src/ob-api/constants/parameters";

jest.mock("etrest");

describe("OBProcess", () => {
  const mockAxios = {
    request: jest.fn()
  };

  const processConfig = {
    name: "TestProcess",
    id: "123",
    class: "com.test.Process",
    windowId: "window1"
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (OBRest.getInstance as jest.Mock).mockReturnValue({
      getAxios: () => mockAxios
    });
  });

  describe("constructor", () => {
    it("should initialize process with provided values", () => {
      const process = new OBProcess(
        processConfig.name,
        processConfig.id,
        processConfig.class,
        processConfig.windowId
      );

      expect(process.processName).toBe(processConfig.name);
      expect(process.processId).toBe(processConfig.id);
      expect(process.processClass).toBe(processConfig.class);
      expect(process.windowId).toBe(processConfig.windowId);
    });
  });

  describe("callProcess", () => {
    it("should make request with correct parameters", async () => {
      const process = new OBProcess(
        processConfig.name,
        processConfig.id,
        processConfig.class,
        processConfig.windowId
      );

      const testData = {
        C_Invoice_ID: "123",
        _params: { additionalParam: "value" },
        _entityName: "Invoice"
      };
      mockAxios.request.mockResolvedValue({ data: { success: true } });

      await process.callProcess(testData);

      expect(mockAxios.request).toHaveBeenCalledWith({
        params: {
          [DefaultParams.KERNEL_PROCESS_ID_PARAM]: processConfig.id,
          [DefaultParams.KERNEL_ACTION_PARAM]: processConfig.class,
          [DefaultParams.WINDOW_ID]: processConfig.windowId
        },
        data: {
          recordIds: [testData.C_Invoice_ID],
          _buttonValue: "DONE",
          _params: testData._params,
          _entityName: testData._entityName
        },
        method: "POST",
        url: "com.smf.securewebservices.kernel/org.openbravo.client.kernel"
      });
    });

    it("should return response data on success", async () => {
      const process = new OBProcess(
        processConfig.name,
        processConfig.id,
        processConfig.class,
        processConfig.windowId
      );

      const expectedResponse = { success: true, data: "test" };
      mockAxios.request.mockResolvedValue({ data: expectedResponse });

      const result = await process.callProcess({
        C_Invoice_ID: "123",
        _params: {},
        _entityName: "Invoice"
      });

      expect(result).toEqual(expectedResponse);
    });

    it("should throw error when request fails", async () => {
      const process = new OBProcess(
        processConfig.name,
        processConfig.id,
        processConfig.class,
        processConfig.windowId
      );

      const error = new Error("Request failed");
      mockAxios.request.mockRejectedValue(error);

      await expect(process.callProcess({
        C_Invoice_ID: "123",
        _params: {},
        _entityName: "Invoice"
      })).rejects.toThrow(error);
    });
  });

  describe("callRawProcess", () => {
    it("should call callProcess with same parameters", async () => {
      const process = new OBProcess(
        processConfig.name,
        processConfig.id,
        processConfig.class,
        processConfig.windowId
      );

      const testData = {
        C_Invoice_ID: "123",
        _params: {},
        _entityName: "Invoice"
      };
      mockAxios.request.mockResolvedValue({ data: { success: true } });

      const callProcessSpy = jest.spyOn(process, "callProcess");

      await process.callRawProcess(testData);

      expect(callProcessSpy).toHaveBeenCalledWith(testData);
    });
  });
});
