import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import TurtleCompanion from '@/components/TurtleCompanion';

export default function Welcome() {
  console.log('Welcome page rendering...');
  
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-chalk">
      <View className="flex-1 justify-center items-center px-6">
        <View className="items-center mb-8">
          <TurtleCompanion 
            size={160}
            mood="wave-left"
            message="Hello! I'm Shelly, your AI-powered stroke recovery companion. I'm here to support you with gentle guidance, personalized exercises, and encouraging conversations every step of the way."
            showMessage={true}
            animate={true}
            className="mb-6"
            voiceAsset={require('@/assets/audio/shelly/shelly-welcome.mp3')}
            autoPlayVoice={true}
          />
        </View>
        
        <Text className="text-4xl font-inter-bold text-earie-black text-center mb-4">
          Meet Shelly
        </Text>
        
        <Text className="text-lg font-inter text-royal-palm text-center mb-12">
          Your AI-powered stroke recovery companion
        </Text>

        <View className="w-full max-w-sm gap-4">
          <TouchableOpacity
            onPress={() => router.push('/(auth)/register')}
            className="bg-royal-palm py-4 px-8 rounded-2xl shadow-lg shadow-turtle-teal-300/50"
          >
            <Text className="text-chalk text-lg font-inter-semibold text-center">
              Get Started
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            className="bg-turtle-cream-100 py-4 px-8 rounded-2xl border border-turtle-teal-300 shadow-lg shadow-turtle-teal-300/50"
          >
            <Text className="text-royal-palm text-lg font-inter-semibold text-center">
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}