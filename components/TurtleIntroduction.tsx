import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { Mic, Volume2, ArrowRight, VolumeX } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import TurtleAvatar from './TurtleAvatar';

interface TurtleIntroductionProps {
  onComplete: (mood: string | null) => void;
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
    turtleResponse: "That's wonderful to hear! I'm so happy you're feeling great today! Let's make the most of this positive energy." 
  },
  { 
    text: "Okay", 
    emoji: "😐", 
    value: "neutral", 
    turtleResponse: "Thank you for sharing. Some days are just okay, and that's perfectly normal. I'm here to support you." 
  },
  { 
    text: "Tired", 
    emoji: "😴", 
    value: "tired", 
    turtleResponse: "I understand. Recovery can be exhausting. Let's take things nice and easy today, one small step at a time." 
  },
  { 
    text: "Frustrated", 
    emoji: "😤", 
    value: "frustrated", 
    turtleResponse: "I hear you. Frustration is part of the journey, and I'm here to support you through it. You're stronger than you know." 
  },
  { 
    text: "Hopeful", 
    emoji: "🌟", 
    value: "hopeful", 
    turtleResponse: "That hope in your heart makes me so proud! Let's build on that positive energy and make today amazing." 
  }
];

export default function TurtleIntroduction({ onComplete }: TurtleIntroductionProps) {
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
  
  const { width } = Dimensions.get('window');

  useEffect(() => {
    startIntroSequence();
  }, []);

  const startIntroSequence = () => {
    // Turtle slides in from bottom
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start(() => {
      // Wait a moment, then start greeting
      setTimeout(() => {
        startGreeting();
      }, 500);
    });
  };

  const startGreeting = () => {
    setCurrentPhase('greeting');
    setCurrentMessage("Hello there, my friend! I'm your recovery companion turtle!");
    
    // Animate speech bubble
    Animated.spring(bubbleAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();

    if (!isMuted) {
      speakText("Hello there, my friend! I'm your recovery companion turtle! How are you feeling today?");
    }

    // After greeting, show response options
    setTimeout(() => {
      setCurrentMessage("How are you feeling today?");
      setCurrentPhase('listening');
    }, 3000);
  };

  const speakText = async (text: string) => {
    try {
      setIsPlaying(true);
      
      // Use Expo Speech as primary TTS (Eleven Labs would require API key)
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
  };

  const handleQuickResponse = (response: QuickResponse) => {
    setUserResponse(response.value);
    setCurrentPhase('responding');
    setCurrentMessage(response.turtleResponse);
    
    // Animate response
    Animated.sequence([
      Animated.timing(bubbleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(bubbleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();

    if (!isMuted) {
      speakText(response.turtleResponse);
    }

    // Complete after response
    setTimeout(() => {
      completeIntroduction(response.value);
    }, 4000);
  };

  const startVoiceRecording = async () => {
    try {
      setIsListening(true);
      
      // Start pulse animation
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { 
            toValue: 1.2, 
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
    
    // Simulate voice processing
    const responses = ['positive', 'neutral', 'tired'];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    const responseData = quickResponses.find(r => r.value === randomResponse) || quickResponses[0];
    
    handleQuickResponse(responseData);
  };

  const completeIntroduction = (mood: string | null) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start(() => {
      onComplete(mood);
    });
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
    }
  };

  return (
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
              Your Recovery Companion
            </Text>
          </Animated.View>

          {/* Animated Turtle Container */}
          <Animated.View 
            className="items-center mb-8"
            style={{
              transform: [{ translateY: slideAnim }]
            }}
          >
            <TurtleAvatar 
              size={180}
              mood={currentPhase === 'responding' ? 'happy' : 'welcoming'}
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
              
              {/* Voice Input */}
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

              {/* Divider */}
              <View className="flex-row items-center">
                <View className="flex-1 h-px bg-turtle-slate/20" />
                <Text className="text-turtle-slate/60 font-inter mx-4">or choose</Text>
                <View className="flex-1 h-px bg-turtle-slate/20" />
              </View>

              {/* Quick Response Choices */}
              <View className="space-y-4">
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
                      <Text className="text-2xl mb-1">{response.emoji}</Text>
                      <Text className="text-turtle-slate font-inter-semibold text-center">
                        {response.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Animated.View>
          )}

          {/* Loading indicator for voice processing */}
          {currentPhase === 'responding' && (
            <View className="absolute bottom-20 items-center">
              <View className="bg-turtle-teal/10 rounded-full px-6 py-3">
                <Text className="text-turtle-teal font-inter-semibold">
                  Processing your response...
                </Text>
              </View>
            </View>
          )}
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}