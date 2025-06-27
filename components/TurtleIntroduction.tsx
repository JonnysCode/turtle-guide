import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { Mic, Volume2, ArrowRight, VolumeX, Heart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import TurtleAvatar from './TurtleAvatar';

interface TurtleIntroductionProps {
  onComplete: (mood: string | null) => void;
  isStartupScreen?: boolean;
}

interface QuickResponse {
  text: string;
  emoji: string;
  value: string;
  turtleResponse: string;
}

const quickResponses: QuickResponse[] = [
  { 
    text: "Great", 
    emoji: "😊", 
    value: "positive", 
    turtleResponse: "That's wonderful to hear! I'm so happy you're feeling great today! Let's make the most of this positive energy and have an amazing day together." 
  },
  { 
    text: "Okay", 
    emoji: "😐", 
    value: "neutral", 
    turtleResponse: "Thank you for sharing. Some days are just okay, and that's perfectly normal. I'm here to support you through whatever comes our way." 
  },
  { 
    text: "Tired", 
    emoji: "😴", 
    value: "tired", 
    turtleResponse: "I understand completely. Recovery can be exhausting, and it's okay to feel tired. Let's take things nice and easy today, one gentle step at a time." 
  },
  { 
    text: "Frustrated", 
    emoji: "😤", 
    value: "frustrated", 
    turtleResponse: "I hear you, and your feelings are completely valid. Frustration is part of the journey, and I'm here to support you through it. You're stronger than you know." 
  },
  { 
    text: "Hopeful", 
    emoji: "🌟", 
    value: "hopeful", 
    turtleResponse: "That hope in your heart makes me so incredibly proud! Let's build on that beautiful positive energy and make today truly special together." 
  }
];

const startupMessages = [
  "Welcome back, my dear friend! I've been waiting for you with excitement!",
  "Hello there! I'm so happy to see you again today!",
  "Good to see you! I've been thinking about our journey together.",
  "Welcome! I'm here and ready to support you through another day.",
  "Hello, wonderful human! I'm delighted you're here with me today!"
];

export default function TurtleIntroduction({ onComplete, isStartupScreen = false }: TurtleIntroductionProps) {
  const [currentPhase, setCurrentPhase] = useState<'entering' | 'greeting' | 'listening' | 'responding'>('entering');
  const [isPlaying, setIsPlaying] = useState(false);
  const [userResponse, setUserResponse] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(300)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bubbleAnim = useRef(new Animated.Value(0)).current;
  const heartAnim = useRef(new Animated.Value(0)).current;
  
  const { width } = Dimensions.get('window');

  useEffect(() => {
    startIntroSequence();
  }, []);

  const startIntroSequence = () => {
    // Turtle slides in from bottom with heart animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(800),
        Animated.spring(heartAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        })
      ])
    ]).start(() => {
      // Wait a moment, then start greeting
      setTimeout(() => {
        startGreeting();
      }, 800);
    });
  };

  const startGreeting = () => {
    setCurrentPhase('greeting');
    
    // Choose appropriate greeting message
    const greeting = isStartupScreen 
      ? startupMessages[Math.floor(Math.random() * startupMessages.length)]
      : "Hello there, my friend! I'm your recovery companion turtle!";
    
    setCurrentMessage(greeting);
    
    // Animate speech bubble
    Animated.spring(bubbleAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();

    if (!isMuted) {
      const fullGreeting = isStartupScreen 
        ? `${greeting} How are you feeling today?`
        : "Hello there, my friend! I'm your recovery companion turtle! How are you feeling today?";
      speakText(fullGreeting);
    }

    // After greeting, show response options
    setTimeout(() => {
      setCurrentMessage("How are you feeling today?");
      setCurrentPhase('listening');
    }, isStartupScreen ? 4000 : 3000);
  };

  const speakText = async (text: string) => {
    if (Platform.OS === 'web') {
      // Web fallback - use Web Speech API if available
      if ('speechSynthesis' in window) {
        try {
          setIsPlaying(true);
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.8;
          utterance.pitch = 1.1;
          utterance.onend = () => setIsPlaying(false);
          utterance.onerror = () => setIsPlaying(false);
          speechSynthesis.speak(utterance);
        } catch (error) {
          console.error('Web TTS Error:', error);
          setIsPlaying(false);
        }
      } else {
        setIsPlaying(false);
      }
    } else {
      // Mobile - use Expo Speech
      try {
        setIsPlaying(true);
        await Speech.speak(text, {
          rate: 0.8,
          pitch: 1.1,
          onDone: () => setIsPlaying(false),
          onError: () => setIsPlaying(false),
        });
      } catch (error) {
        console.error('TTS Error:', error);
        setIsPlaying(false);
      }
    }
  };

  const handleQuickResponse = (response: QuickResponse) => {
    setUserResponse(response.value);
    setCurrentPhase('responding');
    setCurrentMessage(response.turtleResponse);
    
    // Animate response with heart pulse
    Animated.sequence([
      Animated.parallel([
        Animated.timing(bubbleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(heartAnim, {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: true,
        })
      ]),
      Animated.parallel([
        Animated.timing(bubbleAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(heartAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        })
      ])
    ]).start();

    if (!isMuted) {
      speakText(response.turtleResponse);
    }

    // Complete after response
    setTimeout(() => {
      completeIntroduction(response.value);
    }, 5000);
  };

  const startVoiceRecording = async () => {
    if (Platform.OS === 'web') {
      // Web doesn't support expo-av recording, show message
      Alert.alert(
        'Voice Input', 
        'Voice input is not available on web. Please use the quick response buttons below.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsListening(true);
      
      // Start pulse animation
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { 
            toValue: 1.3, 
            duration: 600, 
            useNativeDriver: true 
          }),
          Animated.timing(pulseAnim, { 
            toValue: 1, 
            duration: 600, 
            useNativeDriver: true 
          })
        ])
      );
      pulseLoop.start();
      
      // Request permissions
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission needed', 'Please allow microphone access to use voice input.');
        setIsListening(false);
        pulseLoop.stop();
        return;
      }
      
      // Simulate voice recording (in real implementation, you'd use expo-av Recording)
      setTimeout(() => {
        stopVoiceRecording(pulseLoop);
      }, 3000);
      
    } catch (error) {
      console.error('Recording error:', error);
      setIsListening(false);
    }
  };

  const stopVoiceRecording = (pulseLoop: Animated.CompositeAnimation) => {
    setIsListening(false);
    pulseLoop.stop();
    pulseAnim.setValue(1);
    
    // Simulate voice processing - randomly select a response
    const responses = ['positive', 'neutral', 'tired', 'hopeful'];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    const responseData = quickResponses.find(r => r.value === randomResponse) || quickResponses[0];
    
    handleQuickResponse(responseData);
  };

  const completeIntroduction = (mood: string | null) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -400,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(heartAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start(() => {
      onComplete(mood);
    });
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (isPlaying) {
      if (Platform.OS === 'web' && 'speechSynthesis' in window) {
        speechSynthesis.cancel();
      } else {
        Speech.stop();
      }
      setIsPlaying(false);
    }
  };

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
      <SafeAreaView className="flex-1">
        <LinearGradient
          colors={['#FEF7ED', '#E6FFFA', '#F0F9FF']}
          className="flex-1"
        >
          <Animated.View 
            className="flex-1 items-center justify-center px-6"
            style={{ opacity: fadeAnim }}
          >
            {/* Skip Button */}
            <TouchableOpacity
              onPress={() => completeIntroduction(null)}
              className="absolute top-12 right-6 bg-white/80 rounded-full p-3 shadow-sm z-10"
            >
              <ArrowRight size={20} color="#64748B" />
            </TouchableOpacity>

            {/* Mute Button */}
            <TouchableOpacity
              onPress={toggleMute}
              className="absolute top-12 left-6 bg-white/80 rounded-full p-3 shadow-sm z-10"
            >
              {isMuted ? (
                <VolumeX size={20} color="#64748B" />
              ) : (
                <Volume2 size={20} color="#64748B" />
              )}
            </TouchableOpacity>

            {/* Logo */}
            <Animated.View 
              className="absolute top-20 items-center"
              style={{ opacity: fadeAnim }}
            >
              <Text className="text-3xl font-inter-bold text-turtle-slate">
                TurtleGuide
              </Text>
              <Text className="text-turtle-slate/70 font-inter text-sm mt-1">
                {isStartupScreen ? 'Welcome Back!' : 'Your Recovery Companion'}
              </Text>
            </Animated.View>

            {/* Floating Hearts */}
            <Animated.View 
              className="absolute top-32 right-8"
              style={{
                transform: [{ scale: heartAnim }],
                opacity: heartAnim
              }}
            >
              <Heart size={24} color="#EC4899" fill="#EC4899" />
            </Animated.View>

            <Animated.View 
              className="absolute top-40 left-12"
              style={{
                transform: [{ scale: heartAnim }],
                opacity: heartAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.6]
                })
              }}
            >
              <Heart size={16} color="#F472B6" fill="#F472B6" />
            </Animated.View>

            {/* Animated Turtle Container */}
            <Animated.View 
              className="items-center mb-8"
              style={{
                transform: [{ translateY: slideAnim }]
              }}
            >
              <TurtleAvatar 
                size={200}
                mood={currentPhase === 'responding' ? 'celebrating' : 'welcoming'}
                animate={true}
              />
              
              {/* Speech Bubble */}
              {(currentPhase === 'greeting' || currentPhase === 'listening' || currentPhase === 'responding') && (
                <Animated.View 
                  className="bg-white rounded-2xl p-6 shadow-lg mt-6 max-w-sm relative"
                  style={{
                    transform: [{ scale: bubbleAnim }],
                    opacity: bubbleAnim
                  }}
                >
                  <Text className="text-turtle-slate text-center text-lg font-inter leading-6">
                    {currentMessage}
                  </Text>
                  {/* Speech bubble tail */}
                  <View className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45" />
                </Animated.View>
              )}
            </Animated.View>

            {/* Response Options */}
            {currentPhase === 'listening' && (
              <Animated.View 
                className="w-full space-y-8"
                style={{ opacity: fadeAnim }}
              >
                
                {/* Voice Input - Only show on mobile */}
                {Platform.OS !== 'web' && (
                  <View className="items-center">
                    <TouchableOpacity
                      onPress={startVoiceRecording}
                      disabled={isListening}
                      className="items-center"
                    >
                      <Animated.View
                        className={`rounded-full p-8 items-center justify-center shadow-lg ${
                          isListening ? 'bg-red-500' : 'bg-turtle-teal'
                        }`}
                        style={{
                          transform: [{ scale: pulseAnim }]
                        }}
                      >
                        <Mic size={40} color="white" />
                      </Animated.View>
                      <Text className="text-turtle-slate font-inter-semibold mt-4 text-lg">
                        {isListening ? 'Listening...' : 'Tap to speak'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Divider - Only show on mobile */}
                {Platform.OS !== 'web' && (
                  <View className="flex-row items-center">
                    <View className="flex-1 h-px bg-turtle-slate/20" />
                    <Text className="text-turtle-slate/60 font-inter mx-4">or choose</Text>
                    <View className="flex-1 h-px bg-turtle-slate/20" />
                  </View>
                )}

                {/* Quick Response Choices */}
                <View className="space-y-4">
                  <Text className="text-turtle-slate/70 font-inter text-center text-lg">
                    How are you feeling today?
                  </Text>
                  <View className="flex-row flex-wrap justify-center gap-3">
                    {quickResponses.map((response, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleQuickResponse(response)}
                        className="bg-white border-2 border-turtle-teal/30 rounded-2xl px-6 py-4 shadow-sm min-w-[120px] items-center"
                        style={{ 
                          width: width < 400 ? (width - 60) / 2 - 6 : 'auto',
                          marginBottom: 12
                        }}
                      >
                        <Text className="text-3xl mb-2">{response.emoji}</Text>
                        <Text className="text-turtle-slate font-inter-semibold text-center">
                          {response.text}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </Animated.View>
            )}

            {/* Processing indicator */}
            {currentPhase === 'responding' && (
              <Animated.View 
                className="absolute bottom-20 items-center"
                style={{ opacity: fadeAnim }}
              >
                <View className="bg-turtle-teal/10 rounded-full px-6 py-3 border border-turtle-teal/20">
                  <Text className="text-turtle-teal font-inter-semibold">
                    Thank you for sharing! 💚
                  </Text>
                </View>
              </Animated.View>
            )}
          </Animated.View>
        </LinearGradient>
      </SafeAreaView>
    </View>
  );
}