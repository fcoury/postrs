import AsyncStorage from '@react-native-async-storage/async-storage';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Email = {
  id: string;
  subject: string;
  date: string;
  from_name: string;
};

type RootStackParamList = {
  Home: undefined;
  Email: {email: Email};
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

type HomeScreenProps = {
  navigation: HomeScreenNavigationProp;
};

const TOKEN_KEY = 'accessToken';
const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadEmails = async () => {
      const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
      if (storedToken) {
        await fetchEmails(storedToken);
      } else {
        setLoading(false);
      }
    };
    loadEmails();
  }, []);

  const fetchEmails = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/emails', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`HTTP error: ${response.status} - ${body}`);
      }
      const jsonResponse = await response.json();
      setEmails(jsonResponse);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({item}: {item: Email}) => {
    const formattedDate = new Date(item.date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <TouchableOpacity
        style={styles.emailItem}
        onPress={() => navigation.navigate('Email', {email: item})}>
        <Text style={styles.emailFrom}>{item.from_name}</Text>
        <Text style={styles.emailSubject}>{item.subject}</Text>
        <Text style={styles.emailDate}>{formattedDate}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={emails}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.emailList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emailList: {
    padding: 16,
  },
  emailItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  emailFrom: {
    fontSize: 14,
    color: '#3a3a3a',
    fontWeight: 'bold',
  },
  emailSubject: {
    fontSize: 16,
    color: '#3a3a3a',
    marginTop: 4,
  },
  emailDate: {
    fontSize: 12,
    color: '#8a8a8a',
    marginTop: 8,
  },
});

export default HomeScreen;
