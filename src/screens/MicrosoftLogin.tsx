import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useContext} from 'react';
import {Button} from 'react-native';
import {authorize} from 'react-native-app-auth';
import {AuthContext} from '../../App';
import {config} from '../authConfig';

const TOKEN_KEY = 'accessToken';

const MicrosoftLogin: React.FC = () => {
  const {setToken} = useContext(AuthContext);

  return (
    <Button
      title="Sign in with Microsoft"
      onPress={async () => {
        const result = await authorize(config);
        console.log('Authentication successful:', result);
        await AsyncStorage.setItem(TOKEN_KEY, result.accessToken);
        await AsyncStorage.setItem('refreshToken', result.refreshToken);
        await AsyncStorage.setItem(
          'expirationDate',
          result.accessTokenExpirationDate,
        );
        setToken(result.accessToken);
      }}
    />
  );
};

export default MicrosoftLogin;
