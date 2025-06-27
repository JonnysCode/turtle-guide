import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Sparkles, ArrowRight } from 'lucide-react-native';
import TurtleAvatar from '@/components/TurtleAvatar';
import TurtleIntroduction from '@/components/TurtleIntroduction';

const { width, height } = Dimensions.get('window');

export default function Welcome() {
  const router = useRouter();
  const [showIntroduction, setShowIntroduction] = useState(false);

  const handleIntroductionComplete = (mood: string | null) => {
    setShowIntroduction(false);
    // You could save the mood to AsyncStorage or pass it along
    // For now, we'll just proceed to login
  };

  const handleGetStarted = () => {
    setShowIntroduction(true);
  };

  if (showIntroduction) {
    return (
      <TurtleIntroduction
        onComplete={handleIntroductionComplete}
      />
    );
  }
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating animation for decorative elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const floatingTransform = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={['#FEF7ED', '#E6FFFA']}
        className="flex-1 px-6 justify-center items-center"
      >
        {/* Background Pattern */}
        <View className="absolute inset-0">
          {/* Floating circles */}
          <Animated.View
            className="absolute top-20 left-8 w-16 h-16 bg-turtle-teal/10 rounded-full"
            style={{
              transform: [{ translateY: floatingTransform }],
            }}
          />
          <Animated.View
            className="absolute top-32 right-12 w-12 h-12 bg-turtle-amber/15 rounded-full"
            style={{
              transform: [{ translateY: floatingTransform }],
            }}
          />
          <Animated.View
            className="absolute bottom-40 left-16 w-20 h-20 bg-turtle-green/10 rounded-full"
            style={{
              transform: [{ translateY: floatingTransform }],
            }}
          />
          <Animated.View
            className="absolute bottom-60 right-8 w-8 h-8 bg-turtle-orange/20 rounded-full"
            style={{
              transform: [{ translateY: floatingTransform }],
            }}
          />
        </View>

        {/* Hero Image Background */}
        <View className="absolute top-0 left-0 right-0 h-80 opacity-20">
          <Image
            source={{ uri: 'https://images.pexels.com/photos/1618606/pexels-photo-1618606.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }}
            className="w-full h-full"
            style={{ resizeMode: 'cover' }}
          />
          <LinearGradient
            colors={['transparent', '#FEF7ED']}
            className="absolute bottom-0 left-0 right-0 h-32"
          />
        </View>

        <View className="flex-1 px-6 justify-center items-center relative">
          {/* Main Content */}
          <Animated.View
            className="items-center mb-12"
            style={{
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ],
            }}
          >
            {/* Turtle Avatar with Glow Effect */}
            <View className="relative mb-8">
              <View className="absolute inset-0 bg-turtle-teal/20 rounded-full blur-xl scale-110" />
              <TurtleAvatar size={180} mood="happy" />

              {/* Sparkle effects */}
              <Animated.View
                className="absolute -top-2 -right-2"
                style={{
                  transform: [{ rotate: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }) }],
                }}
              >
                <Sparkles size={24} color="#F59E0B" />
              </Animated.View>

              <Animated.View
                className="absolute -bottom-4 -left-4"
                style={{
                  transform: [{ translateY: floatingTransform }],
                }}
              >
                <Heart size={20} color="#EC4899" fill="#EC4899" />
              </Animated.View>
            </View>

            {/* Welcome Text */}
            <View className="items-center space-y-4">
              <Text className="text-5xl font-inter-bold text-turtle-slate text-center leading-tight">
                Welcome to{'\n'}
                <Text className="text-turtle-teal">TurtleGuide</Text>
              </Text>

              <View className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-white/50">
                <Text className="text-lg font-inter text-turtle-slate/80 text-center leading-relaxed">
                  Your gentle companion for stroke recovery
                </Text>
                <Text className="text-base font-inter-semibold text-turtle-teal text-center mt-2">
                  Slow, steady, and supportive 🐢
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View
            className="w-full max-w-sm space-y-4"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* Primary CTA */}
            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
              className="bg-turtle-teal rounded-2xl shadow-xl active:scale-95"
              style={{
                shadowColor: '#14B8A6',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <LinearGradient
                colors={['#14B8A6', '#0F766E']}
                className="py-5 px-8 rounded-2xl flex-row items-center justify-center"
              >
                <Text className="text-white text-lg font-inter-bold mr-2">
                  Start Your Journey
                </Text>
                <ArrowRight size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>

          <TouchableOpacity
            onPress={handleGetStarted}
            className="bg-white py-4 px-8 rounded-2xl border-2 border-turtle-teal shadow-lg"
          >
            <Text className="text-turtle-teal text-lg font-inter-semibold text-center">
              Meet Your Companion
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/register')}
            className="bg-turtle-amber/20 py-4 px-8 rounded-2xl border border-turtle-amber shadow-sm"
          >
            <Text className="text-turtle-slate text-lg font-inter-semibold text-center">
              Create Account
            </Text>
          </TouchableOpacity>
        </View>
            {/* Secondary CTA */}
            <TouchableOpacity
              onPress={() => router.push('/(auth)/login')}
              className="bg-white/90 backdrop-blur-sm border-2 border-turtle-teal/30 rounded-2xl shadow-lg active:scale-95"
            >
              <View className="py-5 px-8 flex-row items-center justify-center">
                <Text className="text-turtle-teal text-lg font-inter-semibold">
                  Welcome Back
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Bottom Message */}
          <Animated.View
            className="mt-8 items-center"
            style={{
              opacity: fadeAnim,
            }}
          >
            <View className="bg-turtle-green/10 rounded-full px-6 py-3 border border-turtle-green/20">
              <Text className="text-turtle-slate/70 text-sm font-inter text-center">
                Taking recovery one step at a time
              </Text>
            </View>
          </Animated.View>
        </View>

        {/* Bottom Wave Pattern */}
        <View className="absolute bottom-0 left-0 right-0 h-32">
          <LinearGradient
            colors={['transparent', '#14B8A6']}
            className="h-full opacity-10"
          />
          <View className="absolute bottom-0 left-0 right-0 h-16 bg-turtle-teal/5" />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}