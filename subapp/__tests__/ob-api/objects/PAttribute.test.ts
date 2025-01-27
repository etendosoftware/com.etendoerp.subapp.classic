const mockCallWebService = jest.fn();
jest.mock('etrest', () => ({
  OBRest: {
    getInstance: () => ({
      callWebService: mockCallWebService
    })
  }
}));

import { OBRest } from 'etrest';
import PAttribute from '../../../src/ob-api/objects/PAttribute';

describe('PAttribute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAttributes', () => {
    it('should call webservice with correct parameters without optional params', async () => {
      await PAttribute.getAttributes(
        undefined,
        'testWindow',
        'testTab',
        'testProduct'
      );

      expect(mockCallWebService).toHaveBeenCalledWith(
        'com.smf.mobile.utils.ProductAttributes?&windowId=testWindow&tabId=testTab&productId=testProduct&',
        'GET',
        [],
        null
      );
    });

    it('should call webservice with id parameter when provided', async () => {
      await PAttribute.getAttributes(
        'testId',
        'testWindow',
        'testTab',
        'testProduct'
      );

      expect(mockCallWebService).toHaveBeenCalledWith(
        'com.smf.mobile.utils.ProductAttributes?id=testId&windowId=testWindow&tabId=testTab&productId=testProduct&',
        'GET',
        [],
        null
      );
    });

    it('should call webservice with description parameter when provided', async () => {
      await PAttribute.getAttributes(
        undefined,
        'testWindow',
        'testTab',
        'testProduct',
        'Test Description'
      );

      expect(mockCallWebService).toHaveBeenCalledWith(
        'com.smf.mobile.utils.ProductAttributes?&windowId=testWindow&tabId=testTab&productId=testProduct&description=Test%20Description',
        'GET',
        [],
        null
      );
    });

    it('should call webservice with both id and description when provided', async () => {
      await PAttribute.getAttributes(
        'testId',
        'testWindow',
        'testTab',
        'testProduct',
        'Test Description'
      );

      expect(mockCallWebService).toHaveBeenCalledWith(
        'com.smf.mobile.utils.ProductAttributes?id=testId&windowId=testWindow&tabId=testTab&productId=testProduct&description=Test%20Description',
        'GET',
        [],
        null
      );
    });
  });

  describe('saveAttribute', () => {
    it('should call webservice with correct parameters', async () => {
      const pAttribute = new PAttribute();
      const mockData = {
        id: 'testId',
        value: 'testValue'
      };

      await pAttribute.saveAttribute(mockData);

      expect(mockCallWebService).toHaveBeenCalledWith(
        'com.smf.mobile.utils.ProductAttributes',
        'POST',
        [],
        mockData
      );
    });

    it('should pass through the response from the webservice', async () => {
      const pAttribute = new PAttribute();
      const mockData = { id: 'testId' };
      const mockResponse = { success: true };
      
      mockCallWebService.mockResolvedValueOnce(mockResponse);

      const result = await pAttribute.saveAttribute(mockData);

      expect(result).toBe(mockResponse);
    });
  });
});
