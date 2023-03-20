import {AuthConfiguration} from 'react-native-app-auth';

export const config: AuthConfiguration = {
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
