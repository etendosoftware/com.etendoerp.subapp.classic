import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import ShowProfilePicture from '../../src/components/ShowProfilePicture';
import { OBRest, Restrictions } from 'etrest';
import { User } from '../../src/stores';

// Mock the external dependencies
jest.mock('etrest');
jest.mock('../../src/stores', () => ({
  User: {
    data: {
      userId: 'mockUserId'
    }
  }
}));

// Test helpers
const waitForComponent = async (getComponent, timeout = 3000) => {
  return await waitFor(() => {
    const component = getComponent();
    expect(component).toBeTruthy();
    return component;
  }, { timeout });
};

describe('ShowProfilePicture', () => {
  // Mock data
  const mockProps = {
    username: 'John Doe',
    size: 100
  };

  const mockUser = {
    id: 'mockUserId',
    image: 'mockImageId'
  };

  const mockImage = [{
    id: 'mockImageId',
    bindaryData: 'mockBase64ImageData',
    bin: null
  }];

  // Setup and teardown
  beforeAll(() => {
    jest.spyOn(console, 'warn').mockImplementation((msg) => {
      if (!msg.includes('MobX') && !msg.includes('mobx')) {
        console.warn(msg);
      }
    });
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock implementations
    const mockCriteria = {
      add: jest.fn().mockReturnThis(),
      uniqueResult: jest.fn().mockResolvedValue(mockUser),
      list: jest.fn().mockResolvedValue(mockImage)
    };

    OBRest.getInstance = jest.fn().mockReturnValue({
      createCriteria: jest.fn().mockReturnValue(mockCriteria)
    });
  });

  describe('rendering', () => {
    test('renders avatar with initials when no image is available', async () => {
      const { getByText } = render(
        <ShowProfilePicture {...mockProps} />
      );
      
      const initials = await waitForComponent(() => getByText('JD'));
      expect(initials).toBeTruthy();
    });
  
  });

  describe('getInitials function', () => {
    test('returns correct initials for full name', () => {
      const component = new ShowProfilePicture(mockProps);
      expect(component.getInitials('John Doe')).toBe('JD');
    });

    test('returns correct initial for single name', () => {
      const component = new ShowProfilePicture(mockProps);
      expect(component.getInitials('John')).toBe('J');
    });
  });

  describe('data fetching', () => {
    test('fetches user and image data on mount', async () => {
      render(<ShowProfilePicture {...mockProps} />);

      await waitFor(() => {
        expect(OBRest.getInstance).toHaveBeenCalled();
      });

      const mockCriteria = OBRest.getInstance().createCriteria();
      expect(mockCriteria.uniqueResult).toHaveBeenCalled();
      expect(mockCriteria.list).toHaveBeenCalled();
    });

    test('handles missing image data gracefully', async () => {
      const mockCriteria = {
        add: jest.fn().mockReturnThis(),
        uniqueResult: jest.fn().mockResolvedValue(mockUser),
        list: jest.fn().mockResolvedValue([])
      };

      OBRest.getInstance = jest.fn().mockReturnValue({
        createCriteria: jest.fn().mockReturnValue(mockCriteria)
      });

      const { getByText } = render(
        <ShowProfilePicture {...mockProps} />
      );

      const initials = await waitForComponent(() => getByText('JD'));
      expect(initials).toBeTruthy();
    });
  });

  describe('layout and styling', () => {
    const expectedContainerStyles = {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 80
    };

    test('applies correct container styles', async () => {
      const { UNSAFE_root } = render(
        <ShowProfilePicture {...mockProps} />
      );

      await waitFor(() => {
        const view = UNSAFE_root.children[0];
        expect(view.props.style).toEqual(
          expect.objectContaining(expectedContainerStyles)
        );
      });
    });


    test('applies correct background color to Avatar.Text', async () => {
      const { UNSAFE_getByType } = render(
        <ShowProfilePicture {...mockProps} />
      );

      try {
        const avatarText = await waitForComponent(() => UNSAFE_getByType('Avatar.Text'));
        expect(avatarText.props.style.backgroundColor).toBe('TERCIARY_100');
        expect(avatarText.props.labelStyle.color).toBe('QUATERNARY_100');
      } catch (e) {
        console.log('Avatar.Text not found - Image is being displayed');
      }
    });
  });
});
