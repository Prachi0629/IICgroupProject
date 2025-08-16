// App.js
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import loginScreen from './pages/loginScreen';
import mainScreen from './pages/mainScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="login" screenOptions={{headerShown:false}}>
        <Stack.Screen name="login" component={loginScreen} />
        <Stack.Screen name="main" component={mainScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
