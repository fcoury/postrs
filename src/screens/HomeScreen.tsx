import AsyncStorage from '@react-native-async-storage/async-storage';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useContext, useEffect, useState} from 'react'; // Add useContext to the imports
import {
  ActivityIndicator,
  Button,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Swipeable} from 'react-native-gesture-handler';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {AuthContext} from '../../App'; // Import AuthContext

type Email = {
  internal_id: string;
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
  route: {
    params: {
      token: string;
      onLogout: () => void;
    };
  };
};

const TOKEN_KEY = 'accessToken';
const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const {setToken} = useContext(AuthContext); // Access the setToken function from AuthContext
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null | unknown>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = async () => {
    const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      await fetchEmails(storedToken);
    } else {
      setLoading(false);
    }
  };

  const fetchEmails = async (token: string) => {
    try {
      const response = await fetch(
        'http://postrs.gistia.online:3001/api/emails',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`HTTP error: ${response.status} - ${body}`);
      }
      const jsonResponse = await response.json();
      setEmails(jsonResponse);
    } catch (error: Error | unknown) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button onPress={handleLogout} title="Logout" color="#000" />
      ),
    });
  }, [navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEmails();
    setRefreshing(false);
  };

  const moveEmail = async (email: Email, folder: string) => {
    const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      try {
        const response = await fetch(
          `http://postrs.gistia.online:3001/api/emails/${email.internal_id}/move/${folder}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${storedToken}`,
              'Content-Type': 'application/json',
            },
          },
        );

        if (!response.ok) {
          const body = await response.text();
          throw new Error(`HTTP error: ${response.status} - ${body}`);
        }

        // Remove the email from the list
        setEmails(
          emails.filter(item => item.internal_id !== email.internal_id),
        );
      } catch (error) {
        console.error('Error moving email:', error);
      }
    }
  };

  const renderItem = ({item}: {item: Email}) => {
    const formattedDate = new Date(item.date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const renderRightActions = () => (
      <View style={styles.swipeActions}>
        <TouchableOpacity
          onPress={() => moveEmail(item, 'Archive')}
          style={[styles.swipeButton, styles.archiveButton]}>
          <MaterialCommunityIcons name="archive" size={24} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => moveEmail(item, 'Junk Email')}
          style={[styles.swipeButton, styles.spamButton]}>
          <MaterialCommunityIcons
            name="email-alert"
            size={24}
            color="#ffffff"
          />
        </TouchableOpacity>
      </View>
    );

    return (
      <Swipeable renderRightActions={renderRightActions}>
        <TouchableOpacity
          style={styles.emailItem}
          onPress={() => navigation.navigate('Email', {email: item})}>
          <Text style={styles.emailFrom}>{item.from_name}</Text>
          <Text style={styles.emailSubject}>{item.subject}</Text>
          <Text style={styles.emailDate}>{formattedDate}</Text>
        </TouchableOpacity>
      </Swipeable>
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
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={emails}
        renderItem={renderItem}
        keyExtractor={item => item.internal_id}
        contentContainerStyle={styles.emailList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
  swipeActions: {
    flexDirection: 'row',
  },
  swipeButton: {
    // borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 95,
    opacity: 0.8,
  },
  archiveButton: {
    backgroundColor: '#4caf50',
  },
  spamButton: {
    backgroundColor: '#f44336',
  },
  swipeText: {
    color: '#ffffff',
  },
  logoutButton: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#6200ee',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
});

export default HomeScreen;
