import { User } from '../../src/stores/User';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OBRest } from 'etrest';
import Windows from '../../src/stores/Windows';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('etrest', () => ({
  OBRest: {
    loginWithToken: jest.fn(),
    loginWithUserAndPassword: jest.fn(),
    getInstance: jest.fn(() => ({
      getOBContext: jest.fn(() => ({
        getUserId: () => 'testUserId',
        getRoleId: () => 'testRoleId',
        getWarehouseId: () => 'testWarehouseId',
        getOrganizationId: () => 'testOrgId',
        getClientId: () => 'testClientId'
      })),
      getAxios: jest.fn(() => ({
        defaults: {
          headers: {
            Authorization: 'Bearer testToken'
          }
        }
      }))
    }))
  }
}));

jest.mock('../../src/stores/Windows', () => ({
  loadWindows: jest.fn()
}));

describe('User Store', () => {
  let userStore: User;

  beforeEach(() => {
    userStore = new User();
    jest.clearAllMocks();
  });

  describe('logout', () => {
    it('should clear user data and remove stored tokens', async () => {
      // Arrange
      userStore.token = 'testToken';
      userStore.user = 'testUser';
      userStore.data = { someData: 'test' };

      // Act
      await userStore.logout();

      // Assert
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('token');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
      expect(userStore.token).toBeUndefined();
      expect(userStore.user).toBeUndefined();
      expect(userStore.data).toBeUndefined();
    });
  });

  describe('saveToken', () => {
    it('should save token and user to AsyncStorage', async () => {
      // Act
      await userStore.saveToken('newToken', 'newUser');

      // Assert
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('token', 'newToken');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('user', 'newUser');
    });

    it('should use existing token and user if not provided', async () => {
      // Arrange
      userStore.token = 'existingToken';
      userStore.user = 'existingUser';

      // Act
      await userStore.saveToken();

      // Assert
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('token', 'existingToken');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('user', 'existingUser');
    });
  });

  describe('login', () => {
    it('should login user and setup store data', async () => {
      // Arrange
      const mockUser = 'testUser';
      const mockPass = 'testPass';
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === 'selectedLanguage') return 'en_US';
        if (key === 'storedEnviromentsUrl') return '["url1", "url2"]';
        return null;
      });

      // Act
      await userStore.login(mockUser, mockPass);

      // Assert
      expect(OBRest.loginWithUserAndPassword).toHaveBeenCalledWith(mockUser, mockPass);
      expect(userStore.token).toBe('testToken');
      expect(userStore.user).toBe(mockUser);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
      expect(Windows.loadWindows).toHaveBeenCalled();
    });
  });

  describe('reloadUserData', () => {
    it('should reload user data with stored token', async () => {
      // Arrange
      const storedToken = 'storedToken';
      const mockUser = 'testUser';
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === 'selectedLanguage') return 'en_US';
        return null;
      });

      // Act
      await userStore.reloadUserData(storedToken, mockUser);

      // Assert
      expect(OBRest.loginWithToken).toHaveBeenCalledWith(storedToken);
      expect(userStore.data).toEqual({
        username: mockUser,
        userId: 'testUserId',
        defaultRoleId: 'testRoleId',
        defaultWarehouseId: 'testWarehouseId',
        roleId: 'testRoleId',
        warehouseId: 'testWarehouseId',
        organization: 'testOrgId',
        client: 'testClientId'
      });
      expect(Windows.loadWindows).toHaveBeenCalled();
    });
  });

  describe('language management', () => {
    it('should save and load language preference', async () => {
      // Arrange
      const mockLanguage = 'es_ES';
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockLanguage);

      // Act
      await userStore.saveLanguage(mockLanguage);

      // Assert
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('selectedLanguage', mockLanguage);
      expect(userStore.selectedLanguage).toBe(mockLanguage);
    });
  });

  describe('environments URL management', () => {
    it('should save and load environments URL list', async () => {
      // Arrange
      const mockUrls = ['url1', 'url2'];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockUrls));

      // Act
      await userStore.saveEnviromentsUrl(mockUrls);
      const loadedUrls = await userStore.loadEnviromentsUrl();

      // Assert
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('storedEnviromentsUrl', JSON.stringify(mockUrls));
      expect(loadedUrls).toEqual(mockUrls);
    });

    it('should handle empty URL list', async () => {
      // Arrange
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      // Act
      const loadedUrls = await userStore.loadEnviromentsUrl();

      // Assert
      expect(loadedUrls).toBeNull();
    });
  });
});
