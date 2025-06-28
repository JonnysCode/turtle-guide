import { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Home, Target, BookOpen, Award, User } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();

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

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FEF7ED',
          borderTopColor: '#14B8A6',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 88,
        },
        tabBarActiveTintColor: '#14B8A6',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Inter-SemiBold',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: 'Exercises',
          tabBarIcon: ({ size, color }) => (
            <Target size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ size, color }) => (
            <BookOpen size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ size, color }) => (
            <Award size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}