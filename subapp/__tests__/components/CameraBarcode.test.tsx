import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import CameraBarCode from '../../src/components/CameraBarCode';
import { useCameraPermission, useCameraDevice, useCodeScanner, Camera } from 'react-native-vision-camera';

// Mock the Camera component
jest.mock('react-native-vision-camera', () => ({
  useCameraPermission: jest.fn(),
  useCameraDevice: jest.fn(),
  useCodeScanner: jest.fn(),
  Camera: jest.fn().mockImplementation(({ style, device, isActive, codeScanner }) => (
    <mock-camera 
      testID="camera-component"
      style={style}
      device={device}
      isActive={isActive}
      codeScanner={codeScanner}
    />
  ))
}));

describe('CameraBarCode Component', () => {
  const defaultProps = {
    onReadCode: jest.fn(),
    disableReading: jest.fn(),
    ableToRead: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    (useCameraPermission as jest.Mock).mockReturnValue({
      hasPermission: true,
      requestPermission: jest.fn().mockResolvedValue(true),
    });

    (useCameraDevice as jest.Mock).mockReturnValue({
      id: 'mock-device',
      name: 'Mock Camera',
      position: 'back'
    });

    (useCodeScanner as jest.Mock).mockReturnValue({
      codeTypes: ['qr', 'ean-13'],
      onCodeScanned: jest.fn()
    });
  });

  it('requests camera permission if not granted', async () => {
    const mockRequestPermission = jest.fn().mockResolvedValue(true);
    (useCameraPermission as jest.Mock).mockReturnValue({
      hasPermission: false,
      requestPermission: mockRequestPermission,
    });

    render(<CameraBarCode {...defaultProps} />);
    
    await waitFor(() => {
      expect(mockRequestPermission).toHaveBeenCalled();
    });
  });

  it('renders camera when permission granted', async () => {
    const { getByTestId } = render(<CameraBarCode {...defaultProps} />);
    
    await waitFor(() => {
      const camera = getByTestId('camera-component');
      expect(camera).toBeTruthy();
      expect(camera.props.isActive).toBe(true);
    });
  });

  it('calls onReadCode with correct data when code is scanned', async () => {
    let scannerCallback: any;
    
    // Capture the callback when useCodeScanner is called
    (useCodeScanner as jest.Mock).mockImplementation((config) => {
      scannerCallback = config.onCodeScanned;
      return {
        codeTypes: ['qr', 'ean-13'],
        onCodeScanned: config.onCodeScanned
      };
    });

    render(<CameraBarCode {...defaultProps} />);

    // Simulate a code being scanned
    await waitFor(() => {
      scannerCallback([{ value: 'test-code' }]);
    });

    expect(defaultProps.onReadCode).toHaveBeenCalledWith('test-code');
    expect(defaultProps.disableReading).toHaveBeenCalled();
  });

  it('does not call onReadCode when ableToRead is false', async () => {
    let scannerCallback: any;
    
    (useCodeScanner as jest.Mock).mockImplementation((config) => {
      scannerCallback = config.onCodeScanned;
      return {
        codeTypes: ['qr', 'ean-13'],
        onCodeScanned: config.onCodeScanned
      };
    });

    render(<CameraBarCode {...defaultProps} ableToRead={false} />);

    await waitFor(() => {
      scannerCallback([{ value: 'test-code' }]);
    });

    expect(defaultProps.onReadCode).not.toHaveBeenCalled();
    expect(defaultProps.disableReading).not.toHaveBeenCalled();
  });
});
