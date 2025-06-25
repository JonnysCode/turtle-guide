import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import TurtleAvatar from '@/components/TurtleAvatar';

export default function Register() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    <SafeAreaView className="flex-1 bg-turtle-cream">
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 mb-8 w-12 h-12 bg-white rounded-full items-center justify-center shadow-sm"
        >
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>

        <View className="items-center mb-8">
          <TurtleAvatar size={120} mood="welcoming" />
          <Text className="text-2xl font-inter-bold text-turtle-slate mt-4">
            Join Our Family
          </Text>
          <Text className="text-turtle-slate/70 font-inter mt-2 text-center max-w-sm">
            I'm excited to be your companion on this recovery journey. Let's get started together!
          </Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-turtle-slate font-inter-semibold mb-2">Email Address</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-white py-4 px-4 rounded-xl border border-turtle-teal/20 text-turtle-slate font-inter text-lg"
            />
          </View>

          <View>
            <Text className="text-turtle-slate font-inter-semibold mb-2">Password</Text>
            <View className="relative">
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Create a secure password"
                secureTextEntry={!showPassword}
                className="bg-white py-4 px-4 pr-12 rounded-xl border border-turtle-teal/20 text-turtle-slate font-inter text-lg"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4"
              >
                {showPassword ? (
                  <EyeOff size={24} color="#64748B" />
                ) : (
                  <Eye size={24} color="#64748B" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View>
            <Text className="text-turtle-slate font-inter-semibold mb-2">Confirm Password</Text>
            <View className="relative">
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                secureTextEntry={!showConfirmPassword}
                className="bg-white py-4 px-4 pr-12 rounded-xl border border-turtle-teal/20 text-turtle-slate font-inter text-lg"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-4"
              >
                {showConfirmPassword ? (
                  <EyeOff size={24} color="#64748B" />
                ) : (
                  <Eye size={24} color="#64748B" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading}
          className="bg-turtle-teal py-4 px-8 rounded-2xl mt-8 shadow-lg disabled:opacity-50"
        >
          <Text className="text-white text-lg font-inter-semibold text-center">
            {loading ? 'Creating Account...' : 'Create Account'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')}
          className="mt-6 mb-8"
        >
          <Text className="text-turtle-teal font-inter text-center">
            Already have an account? <Text className="font-inter-semibold">Sign In</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}