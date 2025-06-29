import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import TurtleCompanion from '@/components/TurtleCompanion';
import Input from '@/components/Input';
import Button from '@/components/Button';

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      // Navigation will be handled by the auth state change
      // The turtle intro will show automatically
      router.replace('/(tabs)');
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
          className="flex-1 px-6 pb-2"
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
            mood="hi"
            message="Welcome back! I'm so happy to see you again. Ready to continue our journey together?"
            showMessage={true}
            animate={true}
          />
          <Text className="text-2xl font-inter-bold text-earie-black mt-4">
            Welcome Back!
          </Text>
          <Text className="text-royal-palm font-inter mt-2 text-center">
            Let's continue your recovery journey
          </Text>
        </View>

        <View
          className="bg-turtle-cream-100 border border-turtle-teal-300 rounded-2xl p-6 mb-6 shadow-lg shadow-turtle-teal-300/50">
          <View className="gap-4">
            <Input
              label="Email"
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
              placeholder="Enter your password"
              isPassword
            />
          </View>
        </View>

        <Button
          onPress={handleLogin}
          loading={loading}
          size="lg"
          variant="primary"
          className="mb-6"
        >
          Sign In
        </Button>

        <TouchableOpacity
          onPress={() => router.push('/(auth)/register')}
          className="items-center py-4"
        >
          <Text className="text-royal-palm font-inter text-center">
            Don't have an account? <Text className="font-inter-semibold">Sign Up</Text>
          </Text>
        </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}