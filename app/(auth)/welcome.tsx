import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import TurtleAvatar from '@/components/TurtleAvatar';

export default function Welcome() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={['#FEF7ED', '#E6FFFA']}
        className="flex-1 px-6 justify-center items-center"
      >
        <View className="items-center mb-12">
          <TurtleAvatar size={160} mood="happy" />
          <Text className="text-4xl font-inter-bold text-turtle-slate mt-6 text-center">
            Welcome to{'\n'}TurtleGuide
          </Text>
          <Text className="text-lg font-inter text-turtle-slate/70 mt-4 text-center max-w-xs">
            Your gentle companion for stroke recovery - slow, steady, and supportive
          </Text>
        </View>

        <View className="w-full max-w-sm space-y-4">
          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            className="bg-turtle-teal py-4 px-8 rounded-2xl shadow-lg"
          >
            <Text className="text-white text-lg font-inter-semibold text-center">
              Sign In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/register')}
            className="bg-white py-4 px-8 rounded-2xl border-2 border-turtle-teal shadow-lg"
          >
            <Text className="text-turtle-teal text-lg font-inter-semibold text-center">
              Get Started
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-turtle-slate/50 text-sm font-inter mt-8 text-center">
          Taking recovery one step at a time 🐢
        </Text>
      </LinearGradient>
    </SafeAreaView>
  );
}