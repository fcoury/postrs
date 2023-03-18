import React, {useEffect} from 'react';
import {Linking, Text} from 'react-native';

const TestRedirect = () => {
  useEffect(() => {
    const handleUrl = event => {
      console.log('URL received:', event.url);
    };

    Linking.addEventListener('url', handleUrl);
    Linking.getInitialURL().then(url => {
      if (url) {
        handleUrl({url});
      }
    });

    return () => {
      Linking.removeEventListener('url', handleUrl);
    };
  }, []);

  return <Text>Test Redirect</Text>;
};

export default TestRedirect;
