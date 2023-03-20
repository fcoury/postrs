import AsyncStorage from '@react-native-async-storage/async-storage';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createContext, useEffect, useState} from 'react';
import {refresh} from 'react-native-app-auth';
import {config} from './src/authConfig';
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

const Drawer = createDrawerNavigator();

const App = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
      console.log('storedToken', storedToken);
      if (storedToken) {
        await refreshTokenIfNeeded();
        setToken(storedToken);
      }
    };

    loadToken();
  }, []);

  const refreshTokenIfNeeded = async () => {
    const expirationDateString = await AsyncStorage.getItem('expirationDate');
    const refreshToken = await AsyncStorage.getItem('refreshToken');

    if (expirationDateString && refreshToken) {
      const expirationDate = new Date(expirationDateString);
      const now = new Date();

      if (now >= expirationDate) {
        try {
          const result = await refresh(config, {
            refreshToken,
          });

          await AsyncStorage.setItem(TOKEN_KEY, result.accessToken);
          if (result.refreshToken) {
            await AsyncStorage.setItem('refreshToken', result.refreshToken);
          }
          await AsyncStorage.setItem(
            'expirationDate',
            result.accessTokenExpirationDate,
          );

          setToken(result.accessToken);
        } catch (error) {
          console.log('Error refreshing token:', error);
          setToken(null);
        }
      }
    }
  };
  // Provide token and setToken through AuthContext
  const authContextValue = {
    token,
    setToken,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <NavigationContainer key={token ? 'Authenticated' : 'Unauthenticated'}>
        {!token ? (
          <Stack.Navigator>
            <Stack.Screen name="Login" component={MicrosoftLogin} />
          </Stack.Navigator>
        ) : (
          <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Email" component={EmailScreen} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </AuthContext.Provider>
  );
};

// Export AuthContext to be used in other components
export {AuthContext};
export default App;
