import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/contexts/AuthContext';
import { UserProvider } from '@/contexts/UserContext';
import '../global.css';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  console.log('RootLayout rendering...');

  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold
  });

  console.log('Fonts loaded:', fontsLoaded, 'Font error:', fontError);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      console.log('Hiding splash screen...');
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    console.log('Waiting for fonts...');
    return null;
  }

  console.log('Rendering providers and components...');

  return (
    <AuthProvider>
      <UserProvider>
        {/* <TurtleStartupScreen /> */}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="dark" />
      </UserProvider>
    </AuthProvider>
  );
}
