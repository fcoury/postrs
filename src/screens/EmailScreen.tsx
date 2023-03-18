import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import RenderHtml from 'react-native-render-html';

type Email = {
  subject: string;
  from_name: string;
  from_addr: string;
  date: string;
  body: string;
  internal_id: string;
};

type EmailScreenProps = {
  route: {
    params: {
      email: Email;
    };
  };
};

const HEADER_MAX_HEIGHT = 100;
const HEADER_MIN_HEIGHT = 60;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const TOKEN_KEY = 'accessToken';
const EmailScreen: React.FC<EmailScreenProps> = ({route}) => {
  const {email} = route.params;
  const [emailBody, setEmailBody] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const formattedDate = new Date(email.date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const scrollY = new Animated.Value(0);

  useEffect(() => {
    const fetchEmailBody = async () => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        const response = await fetch(
          `http://localhost:3001/api/emails/${email.internal_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const body = await response.json();
        setEmailBody(body);
      } catch (error) {
        console.error('Error fetching email body:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmailBody();
  }, [email.internal_id]);

  console.log('emailBody:', emailBody);

  const customImageRenderer = {
    ImageView: Image,
    enableExperimentalPercentWidth: true,
  };

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const subjectFontSize = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [18, 14],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        style={styles.container}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: false},
        )}
        scrollEventThrottle={16}>
        <View style={styles.bodyContainer}>
          {loading ? (
            <ActivityIndicator size="small" color="#6200ee" />
          ) : (
            <RenderHtml
              contentWidth={parseInt(styles.bodyContainer.width, 10)}
              source={{html: emailBody || ''}}
              renderersProps={{img: customImageRenderer}}
            />
          )}
        </View>
      </Animated.ScrollView>
      <Animated.View style={[styles.header, {height: headerHeight}]}>
        <Animated.Text style={[styles.subject, {fontSize: subjectFontSize}]}>
          {email.subject}
        </Animated.Text>
        <Text style={styles.sender}>
          {email.from_name}{' '}
          <Text style={styles.senderAddr}>&lt;{email.from_addr}&gt;</Text>
        </Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  subject: {
    color: '#3a3a3a',
    fontWeight: 'bold',
  },
  sender: {
    fontSize: 14,
    color: '#3a3a3a',
    marginTop: 8,
  },
  senderAddr: {
    color: '#8a8a8a',
  },
  date: {
    fontSize: 12,
    color: '#8a8a8a',
    marginTop: 4,
  },
  bodyContainer: {
    paddingTop: HEADER_MAX_HEIGHT,
    paddingHorizontal: 16,
  },
});

export default EmailScreen;
