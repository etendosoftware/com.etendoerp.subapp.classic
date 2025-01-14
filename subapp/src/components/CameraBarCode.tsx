import React, { useEffect, useState } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import { Camera, useCodeScanner, useCameraPermission, useCameraDevice, CameraDevice } from "react-native-vision-camera";

const CameraBarCode = ({ onReadCode, ableToRead = true, disableReading }: any) => {
  const [deviceSelected, setDeviceSelected] = useState<CameraDevice>();
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("back");

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    async function handlePermission() {
      if (!hasPermission) {
        await requestPermission();
      }
    }
    handlePermission();
  }, [hasPermission, requestPermission]);

  useEffect(() => {
    if (hasPermission && device) {
      setDeviceSelected(device);
    } else if (hasPermission) {
    }
  }, [hasPermission, device]);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: (codes) => {
      if (codes.length && ableToRead) {
        onReadCode(codes[0].value);
        disableReading();
      }
    }
  });

  const styles = StyleSheet.create({
    fullScreen: {
      width: screenWidth,
      height: screenHeight,
    },
  });

  return (
    <View style={styles.fullScreen}>
      {deviceSelected && hasPermission && (
        <Camera
          style={styles.fullScreen}
          device={deviceSelected}
          isActive={true}
          codeScanner={codeScanner}
        />
      )}
    </View>
  );
};

export default CameraBarCode;
