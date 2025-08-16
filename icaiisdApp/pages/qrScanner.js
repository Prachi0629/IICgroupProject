import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button } from "react-native";
import { CameraView, Camera } from "expo-camera";
import { useNavigation } from "@react-navigation/native";


export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const navigation = useNavigation();
  const [BarData, setBarData] = useState('');
  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);
    useEffect(() => {
    if (scanned && BarData) {
      navigation.navigate('main', { newData: BarData });
    }
  }, [scanned, BarData]);
  const handleBarcodeScanned = ({ type, data }) => {
    setScanned(true);
    setBarData(data);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  const doa = () => {
    navigation.navigate('main', {newData : BarData})
  }
  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "pdf417"],
        }}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && (
        // alert("hello")
        
        <Button title="Done" onPress={() => setScanned(false)} />
        
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
});

