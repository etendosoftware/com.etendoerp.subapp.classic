import { RecordService } from '../../../src/ob-api/services/RecordService';
import { OBRest } from 'etrest';
import { OBDal } from '../../../src/ob-api/classes/OBDal';
import { IRecord } from '../../../src/types/Record';

jest.mock('etrest', () => ({
  OBRest: {
    getInstance: jest.fn()
  }
}));

jest.mock('../../../src/ob-api/classes/OBDal', () => ({
  OBDal: {
    refresh: jest.fn()
  }
}));

describe('RecordService', () => {
  const mockRecord: IRecord = {
    id: '123',
    name: 'Test Record',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('onSave method', () => {
    test('should successfully save a record', async () => {
      const mockSavedRecord: IRecord = {
        ...mockRecord,
        id: '456'
      };

      (OBRest.getInstance as jest.Mock).mockReturnValue({
        save: jest.fn().mockResolvedValue(mockSavedRecord)
      });

      const result = await RecordService.onSave(mockRecord);
      expect(result).toEqual(mockSavedRecord);
      expect(OBRest.getInstance().save).toHaveBeenCalledWith(mockRecord);
    });

    test('should throw error when save fails', async () => {
      const mockError = new Error('Save failed');

      (OBRest.getInstance as jest.Mock).mockReturnValue({
        save: jest.fn().mockRejectedValue(mockError)
      });

      await expect(RecordService.onSave(mockRecord)).rejects.toThrow('Save failed');
    });
  });

  describe('get method', () => {
    test('should successfully refresh a record', async () => {
      const mockRefreshedRecord: IRecord = {
        ...mockRecord,
        name: 'Updated Record Name'
      };

      (OBDal.refresh as jest.Mock).mockResolvedValue(mockRefreshedRecord);

      const result = await RecordService.get(mockRecord);
      expect(result).toEqual(mockRefreshedRecord);
      expect(OBDal.refresh).toHaveBeenCalledWith(mockRecord);
    });

    test('should throw error when refresh fails', async () => {
      const mockError = new Error('Refresh failed');
      (OBDal.refresh as jest.Mock).mockRejectedValue(mockError);

      await expect(RecordService.get(mockRecord)).rejects.toThrow('Refresh failed');
    });
  });
});
