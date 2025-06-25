import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import TurtleAvatar from '@/components/TurtleAvatar';

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-turtle-cream">
      <View className="flex-1 px-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 mb-8 w-12 h-12 bg-white rounded-full items-center justify-center shadow-sm"
        >
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>

        <View className="items-center mb-8">
          <TurtleAvatar size={120} mood="welcoming" />
          <Text className="text-2xl font-inter-bold text-turtle-slate mt-4">
            Welcome Back!
          </Text>
          <Text className="text-turtle-slate/70 font-inter mt-2 text-center">
            I'm so happy to see you again
          </Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-turtle-slate font-inter-semibold mb-2">Email</Text>
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
                placeholder="Enter your password"
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
        </View>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          className="bg-turtle-teal py-4 px-8 rounded-2xl mt-8 shadow-lg disabled:opacity-50"
        >
          <Text className="text-white text-lg font-inter-semibold text-center">
            {loading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(auth)/register')}
          className="mt-6"
        >
          <Text className="text-turtle-teal font-inter text-center">
            Don't have an account? <Text className="font-inter-semibold">Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}