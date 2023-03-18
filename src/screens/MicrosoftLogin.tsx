import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import {Button} from 'react-native';
import {AuthConfiguration, authorize} from 'react-native-app-auth';

const TOKEN_KEY = 'accessToken';
const config: AuthConfiguration = {
  issuer:
    'https://login.microsoftonline.com/cec049b2-7cc6-4549-84ef-53539e7694f5/v2.0',
  clientId: '8b21c9ab-05d8-400a-9311-3f0481fce248',
  redirectUrl: 'msauth.org.reactjs.native.example.postrs://auth/',
  scopes: [
    'openid',
    'profile',
    'email',
    'offline_access',
    'https://outlook.office.com/IMAP.AccessAsUser.All',
  ],
};

const MicrosoftLogin = () => {
  console.log('render');

  return (
    <Button
      title="Sign in with Microsoft"
      onPress={async () => {
        const result = await authorize(config);
        console.log('Authentication successful:', result);
        await AsyncStorage.setItem(TOKEN_KEY, result.accessToken);
      }}
    />
  );
};

export default MicrosoftLogin;
