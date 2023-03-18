import AsyncStorage from '@react-native-async-storage/async-storage';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import EmailScreen from './src/screens/EmailScreen';
import HomeScreen from './src/screens/HomeScreen';
import MicrosoftLogin from './src/screens/MicrosoftLogin';

const Stack = createStackNavigator();
const TOKEN_KEY = 'accessToken';

const App = () => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
      console.log('storedToken', storedToken);
      if (storedToken) {
        setToken(storedToken);
      }
    };

    loadToken();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!token ? (
          <>
            <Stack.Screen
              name="Login"
              // options={{headerShown: false}}
              // initialParams={{onTokenFetched: handleTokenFetched}}
              component={MicrosoftLogin}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              initialParams={{token}}
            />
            <Stack.Screen name="Email" component={EmailScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
