import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image,  } from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
export default function MainPage({route}) {
  // let userId = 'default';
  
  const userId = route.params?.userId;
  // console.log(userId)
  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.navbar}>
        <Text style={styles.navTitle}>ICAIISD2025</Text>
        <Text style={styles.navUser}>{userId}</Text>
      </View>

      {/* Buttons row */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.smallButton}>
          <Text style={styles.buttonText}>Attnd</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.smallButton}>
          <Text style={styles.buttonText}>Morn</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.smallButton}>
          <Text style={styles.buttonText}>After</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.smallButton}>
          <Text style={styles.buttonText}>Even</Text>
        </TouchableOpacity>
      </View>

      {/* Scan button */}
      <TouchableOpacity style={styles.scanButton}>
        <Text style={styles.scanButtonText}>Click to Scan</Text>
      </TouchableOpacity>

      {/* Status Box */}
      <View style={styles.statusBox}>
        <Text style={styles.statusTitle}>Status</Text>
        <Text style={styles.statusText}>Name:</Text>
        <Text style={styles.statusText}>Email:</Text>
        <Text style={styles.statusLog}>Registered/Already Registered</Text>
      </View>

      {/* Footer Logo */}
      {/* <Image
        source={require('./assets/logo.png')} // replace with your logo path
        style={styles.logo}
        resizeMode="contain"
      /> */}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center' },
  
  navbar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#C6285D',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  navTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  navUser: { color: '#fff', fontSize: 16 },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    marginTop: 15,
  },
  smallButton: {
    borderWidth: 1,
    borderColor: '#C6285D',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  buttonText: { color: '#C6285D', fontWeight: 'bold' },

  scanButton: {
    backgroundColor: '#C6285D',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 25,
    marginVertical: '20%',
  },
  scanButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  statusBox: {
    width: '90%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    // alignItems: 'center',
    borderRadius: 8,
    height:"40%",
  },
  statusTitle: { fontWeight: 'bold', fontSize: 22, marginBottom: 10, textAlign:'center' },
  statusText: { fontSize: 20, marginVertical: 5 },
  statusLog:{fontSize:25, marginVertical:50, textAlign:'center'},

  logo: {
    width: '80%',
    height: 60,
    marginTop: 30,
    marginBottom: 10,
  },
});
