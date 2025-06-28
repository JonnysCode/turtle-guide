import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Welcome() {
  console.log('Welcome page rendering...');
  
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-turtle-cream">
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-4xl font-inter-bold text-turtle-slate text-center mb-8">
          Welcome to TurtleGuide
        </Text>
        
        <Text className="text-lg font-inter text-turtle-slate/70 text-center mb-12">
          Your gentle companion for stroke recovery
        </Text>

        <View className="w-full max-w-sm gap-2">
          <TouchableOpacity
            onPress={() => router.push('/(auth)/register')}
            className="bg-turtle-teal py-4 px-8 rounded-2xl"
          >
            <Text className="text-white text-lg font-inter-semibold text-center">
              Get Started
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            className="bg-white py-4 px-8 rounded-2xl border-2 border-turtle-teal"
          >
            <Text className="text-turtle-teal text-lg font-inter-semibold text-center">
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}