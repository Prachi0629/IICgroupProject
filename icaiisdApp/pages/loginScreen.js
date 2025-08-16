import React, { useState } from 'react';
import {  View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
const LoginScreen = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  let unId;
  const handleLogin = () => {
    // handle login logic
    console.log('ID:', id, 'Password:', password);

  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>ICAIISD2025</Text>
      </View>

      {/* Login Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Member Login</Text>

        <Text style={styles.label}>ID:</Text>
        <TextInput
          style={styles.input}
          value={id}
          onChangeText={setId}
          placeholder="Enter ID"
        />

        <Text style={styles.label}>Password :</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter Password"
          secureTextEntry
        />
    
        <TouchableOpacity style={styles.button} onPress={() => navigation.replace("main", {userId : id})}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          NOTE :{"\n"}
          Remember your Password.{"\n"}
          Login Carefully.
        </Text>
      </View>

      {/* Footer Logo */}
      {/* <Image
        source={require('./path_to_your_image.png')} // replace with your logo file
        style={styles.logo}
        resizeMode="contain"
      /> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    backgroundColor: '#D32F5B',
    paddingVertical: 15,
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  card: {
    width: '85%',
    backgroundColor: '#fff',
    marginTop: '40%',
    padding: 20,
    borderRadius: 5,
    elevation: 5, // shadow for Android
    shadowColor: '#000', // shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  cardTitle: {
    color: '#D32F5B',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  input: {
    backgroundColor: '#e0e0e0',
    height: 40,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginTop: 5,
  },
  button: {
    backgroundColor: '#D32F5B',
    marginTop: 20,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  note: {
    fontSize: 12,
    color: '#000',
    textAlign: 'center',
    marginTop: 15,
  },
  logo: {
    width: 250,
    height: 60,
    marginTop: 30,
  },
});

export default LoginScreen;
