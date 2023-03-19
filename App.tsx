import AsyncStorage from '@react-native-async-storage/async-storage';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React, {createContext, useEffect, useState} from 'react';
import EmailScreen from './src/screens/EmailScreen';
import HomeScreen from './src/screens/HomeScreen';
import MicrosoftLogin from './src/screens/MicrosoftLogin';

const Stack = createStackNavigator();
const TOKEN_KEY = 'accessToken';

// Create AuthContext
const AuthContext = createContext<{
  token: string | null;
  setToken: (token: string | null) => void;
}>({
  token: null,
  setToken: () => {},
});

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

  const handleLogout = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  // Provide token and setToken through AuthContext
  const authContextValue = {
    token,
    setToken,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <NavigationContainer>
        <Stack.Navigator>
          {!token ? (
            <>
              <Stack.Screen name="Login" component={MicrosoftLogin} />
            </>
          ) : (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Email" component={EmailScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
};

// Export AuthContext to be used in other components
export {AuthContext};
export default App;
