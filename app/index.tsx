import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  console.log('Index - User:', user ? 'authenticated' : 'not authenticated', 'Loading:', loading, 'Segments:', segments);

  useEffect(() => {
    console.log('Index useEffect - Loading:', loading, 'User:', user ? 'authenticated' : 'not authenticated');
    
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    console.log('In auth group:', inAuthGroup, 'Segments:', segments);

    if (!user && !inAuthGroup) {
      // Redirect to auth if not authenticated
      console.log('Index redirecting to welcome (not authenticated)');
      router.replace('/(auth)/welcome');
    } else if (user && inAuthGroup) {
      // Redirect to main app if authenticated
      console.log('Index redirecting to tabs (authenticated)');
      router.replace('/(tabs)');
    } else if (user && !segments[0]) {
      // If user is authenticated but at root, go to tabs
      console.log('Index redirecting authenticated user to tabs from root');
      router.replace('/(tabs)');
    }
  }, [user, loading, segments, router]);

  // Show loading while determining auth state
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#14B8A6" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF7ED',
  },
});