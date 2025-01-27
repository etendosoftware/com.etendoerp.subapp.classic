import { OBRest } from "etrest";
import OBDatasource from "../../../src/ob-api/classes/OBDatasource";

describe('OBDatasource', () => {
  let mockCallWebService: jest.Mock;

  beforeEach(() => {
    mockCallWebService = jest.fn().mockResolvedValue({ response: { data: [] } });
    jest.spyOn(OBRest, 'getInstance').mockReturnValue({
      callWebService: mockCallWebService
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetch method - basic functionality', () => {
    it('should make request with minimum required parameters', async () => {
      mockCallWebService.mockResolvedValue({ response: { data: [] } });

      await OBDatasource.fetch({ datasourceName: 'TestDS' });

      expect(mockCallWebService).toHaveBeenCalledWith(
        'com.smf.securewebservices.datasource/org.openbravo.service.datasource/TestDS',
        'POST',
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
        expect.any(String)
      );
    });

    it('should include all provided parameters in request', async () => {
      mockCallWebService.mockResolvedValue({ response: { data: [] } });
      const params = {
        datasourceName: 'TestDS',
        _selectedProperties: 'id,name,description',
        _startRow: 10,
        _endRow: 20,
        _sortBy: 'name'
      };

      await OBDatasource.fetch(params);

      const encodedData = mockCallWebService.mock.calls[0][3];
      expect(encodedData).toContain('_selectedProperties=id%2Cname%2Cdescription');
      expect(encodedData).toContain('_startRow=10');
      expect(encodedData).toContain('_endRow=20');
      expect(encodedData).toContain('_sortBy=name');
    });
  });

  describe('fetch method - criteria handling', () => {
    it('should properly encode multiple criteria', async () => {
      mockCallWebService.mockResolvedValue({ response: { data: [] } });
      const criteria = [
        { fieldName: 'name', value: 'test', operator: 'equals' },
        { fieldName: 'active', value: true, operator: 'equals' }
      ];

      await OBDatasource.fetch({
        datasourceName: 'TestDS',
        criteria
      });

      const encodedData = mockCallWebService.mock.calls[0][3];
      expect(encodedData).toContain('criteria=');
      criteria.forEach(criterion => {
        expect(encodedData).toContain(encodeURIComponent(JSON.stringify(criterion)));
      });
    });

    it('should handle empty criteria array', async () => {
      mockCallWebService.mockResolvedValue({ response: { data: [] } });
      
      await OBDatasource.fetch({
        datasourceName: 'TestDS',
        criteria: []
      });

      const encodedData = mockCallWebService.mock.calls[0][3];
      expect(encodedData).not.toContain('criteria=');
    });
  });

  describe('fetch method - Tree Reference handling', () => {
    it('should set correct parentId for Tree Reference type', async () => {
      mockCallWebService.mockResolvedValue({ response: { data: [] } });
      
      await OBDatasource.fetch({
        datasourceName: 'TestDS',
        treeReferenceId: '123'
      }, 'Tree Reference');

      const encodedData = mockCallWebService.mock.calls[0][3];
      expect(encodedData).toContain('parentId=-1');
      expect(encodedData).toContain('treeReferenceId=123');
    });

    it('should remove tabId for Tree Reference type', async () => {
      mockCallWebService.mockResolvedValue({ response: { data: [] } });
      
      await OBDatasource.fetch({
        datasourceName: 'TestDS',
        treeReferenceId: '123',
        tabId: '456'
      }, 'Tree Reference');

      const encodedData = mockCallWebService.mock.calls[0][3];
      expect(encodedData).not.toContain('tabId');
    });
  });

  describe('fetch method - error handling', () => {
    it('should throw error when response contains error message', async () => {
      const errorMessage = 'Test error message';
      mockCallWebService.mockResolvedValue({
        response: { error: { message: errorMessage } }
      });

      await expect(OBDatasource.fetch({ datasourceName: 'TestDS' }))
        .rejects.toThrow(errorMessage);
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      mockCallWebService.mockRejectedValue(networkError);

      await expect(OBDatasource.fetch({ datasourceName: 'TestDS' }))
        .rejects.toThrow(networkError);
    });
  });

  describe('fetch method - boolean value handling', () => {
    it('should convert boolean input parameters to Y/N', async () => {
      mockCallWebService.mockResolvedValue({ response: { data: [] } });
      
      await OBDatasource.fetch({
        datasourceName: 'TestDS',
        inpActive: true,
        inpProcessed: false,
        context: {
          inpActive: true,
          inpProcessed: false
        }
      });

      const encodedData = mockCallWebService.mock.calls[0][3];
      expect(encodedData).toContain('inpActive=Y');
      expect(encodedData).toContain('inpProcessed=N');
    });
  });

  describe('fetch method - context handling', () => {
    it('should merge context parameters with main parameters', async () => {
      mockCallWebService.mockResolvedValue({ response: { data: [] } });
      const context = {
        customParam1: 'value1',
        customParam2: 'value2'
      };

      await OBDatasource.fetch({
        datasourceName: 'TestDS',
        context
      });

      const encodedData = mockCallWebService.mock.calls[0][3];
      expect(encodedData).toContain('customParam1=value1');
      expect(encodedData).toContain('customParam2=value2');
    });
  });
});
