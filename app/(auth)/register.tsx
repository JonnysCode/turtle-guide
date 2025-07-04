import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import TurtleCompanion from '@/components/TurtleCompanion';
import Input from '@/components/Input';
import Button from '@/components/Button';

export default function Register() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      router.replace('/(auth)/onboarding');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-chalk" edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 mb-8 w-12 h-12 bg-turtle-cream-100 border border-turtle-teal-300 rounded-full items-center justify-center shadow-lg shadow-turtle-teal-300/50"
          >
            <ArrowLeft size={24} color="#1A1F16" />
          </TouchableOpacity>

          <View className="items-center mb-8">
            <TurtleCompanion
              size={140}
              mood="excited"
              message="I'm so excited to meet you and be your companion on this recovery journey! Let's take the first step together."
              showMessage={true}
              animate={true}
              voiceAsset={require('@/assets/audio/shelly/shelly-register-1.mp3')}
              autoPlayVoice={true}
            />
            <Text className="text-2xl font-inter-bold text-earie-black mt-4">
              Join Our Family
            </Text>
            <Text className="text-royal-palm font-inter mt-2 text-center max-w-xs">
              Together, we'll make every step count
            </Text>
          </View>

          <View
            className="bg-turtle-cream-100 border border-turtle-teal-300 rounded-2xl p-6 mb-6 shadow-lg shadow-turtle-teal-300/50">
            <View className="gap-4">
              <Input
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Create a secure password"
                isPassword
              />

              <Input
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                isPassword
              />
            </View>
          </View>

          <Button
            onPress={handleRegister}
            loading={loading}
            size="lg"
            variant="primary"
            className="mb-6"
          >
            Create Account
          </Button>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            className="items-center py-4 mb-8"
          >
            <Text className="text-royal-palm font-inter text-center">
              Already have an account? <Text className="font-inter-semibold">Sign In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}