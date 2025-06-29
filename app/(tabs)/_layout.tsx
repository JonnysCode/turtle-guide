import { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Award, BookOpen, Chrome as Home, Target, User } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    console.log('TabLayout - User:', user ? 'authenticated' : 'not authenticated', 'Loading:', loading);

    if (!loading && !user) {
      console.log('TabLayout redirecting to welcome - no user');
      router.replace('/(auth)/welcome');
    }
  }, [user, loading, router]);

  // Don't render anything while loading
  if (loading) {
    console.log('TabLayout is loading...');
    return null;
  }

  // Don't render if no user (will redirect)
  if (!user) {
    console.log('TabLayout - no user, should redirect');
    return null;
  }

  console.log('TabLayout rendering tabs for authenticated user');

  // Calculate proper tab bar height with safe area
  const tabBarHeight = Platform.OS === 'android' 
    ? Math.max(80, 60 + insets.bottom) 
    : 88;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FEF7ED',
          borderTopColor: '#14B8A6',
          borderTopWidth: 1,
          paddingBottom: Platform.select({
            ios: 8,
            android: Math.max(8, insets.bottom + 8),
            default: 8
          }),
          paddingTop: 8,
          height: tabBarHeight,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 8, // Android shadow
          shadowColor: '#000', // iOS shadow
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarActiveTintColor: '#418D84',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Inter-SemiBold',
          marginTop: 4,
          marginBottom: Platform.OS === 'android' ? 4 : 0,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: 'Exercises',
          tabBarIcon: ({ size, color }) => (
            <Target size={size} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ size, color }) => (
            <BookOpen size={size} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ size, color }) => (
            <Award size={size} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          )
        }}
      />
    </Tabs>
  );
}