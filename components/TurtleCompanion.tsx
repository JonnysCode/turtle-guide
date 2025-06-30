import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, ImageSourcePropType, Text, TouchableOpacity, View } from 'react-native';
import { MessageCircle, Volume2, VolumeX } from 'lucide-react-native';
import { useAudioPlayer } from 'expo-audio';

interface TurtleCompanionProps {
  size?: number;
  mood?: TurtleMood;
  message?: string;
  onTap?: () => void;
  onSpeech?: (text: string) => void;
  animate?: boolean;
  showMessage?: boolean;
  enableSpeech?: boolean;
  className?: string;
  minimal?: boolean; // New prop to display only the turtle without interactive elements
  voiceAsset?: any; // Audio asset to play when speech bubble appears
  autoPlayVoice?: boolean; // Whether to automatically play voice when speech bubble shows
}

export type TurtleMood =
  | 'main'
  | 'excited'
  | 'great'
  | 'hi'
  | 'idea'
  | 'love'
  | 'meditation'
  | 'questioning'
  | 'sad'
  | 'speech'
  | 'wave-left'
  | 'wave-right'
  | 'writing';

// Map moods to image sources
const turtleImages: Record<TurtleMood, ImageSourcePropType> = {
  main: require('@/assets/images/turtle/turtle-main.png'),
  excited: require('@/assets/images/turtle/turtle-excited.png'),
  great: require('@/assets/images/turtle/turtle-great.png'),
  hi: require('@/assets/images/turtle/turtle-hi.png'),
  idea: require('@/assets/images/turtle/turtle-idea.png'),
  love: require('@/assets/images/turtle/turtle-love.png'),
  meditation: require('@/assets/images/turtle/turtle-meditation.png'),
  questioning: require('@/assets/images/turtle/turtle-questioning.png'),
  sad: require('@/assets/images/turtle/turtle-sad.png'),
  speech: require('@/assets/images/turtle/turtle-speech.png'),
  'wave-left': require('@/assets/images/turtle/turtle-wave-left.png'),
  'wave-right': require('@/assets/images/turtle/turtle-wave-right.png'),
  writing: require('@/assets/images/turtle/turtle-writing.png')
};

// Default messages for different moods
const defaultMessages: Record<TurtleMood, string> = {
  main: 'Hello! I\'m your turtle companion. How can I help you today?',
  excited: 'This is so exciting! You\'re doing amazing!',
  great: 'Great job! I\'m so proud of your progress!',
  hi: 'Hi there! Ready for another wonderful day together?',
  idea: 'I have an idea! Want to try something new?',
  love: 'I love spending time with you on this journey!',
  meditation: 'Let\'s take a moment to breathe and relax together.',
  questioning: 'I\'m curious... how are you feeling today?',
  sad: 'I understand this can be challenging. I\'m here for you.',
  speech: 'Let\'s practice some words together!',
  'wave-left': 'Hello! Welcome to your recovery journey!',
  'wave-right': 'Goodbye for now! See you soon!',
  writing: 'Let me share some wisdom with you...'
};

export default function TurtleCompanion({
                                          size = 120,
                                          mood = 'main',
                                          message,
                                          onTap,
                                          onSpeech,
                                          animate = true,
                                          showMessage = false,
                                          enableSpeech = false,
                                          className = '',
                                          minimal = false,
                                          voiceAsset,
                                          autoPlayVoice = false
                                        }: TurtleCompanionProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messageVisible, setMessageVisible] = useState(showMessage);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [hasManuallyStoppedVoice, setHasManuallyStoppedVoice] = useState(false);

  // Create audio player for voice asset
  const audioPlayer = useAudioPlayer(voiceAsset || null);

  // Animation refs
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const messageAnim = useRef(new Animated.Value(0)).current;
  const speechAnim = useRef(new Animated.Value(0)).current;

  // Calculate image dimensions maintaining aspect ratio (vertical images)
  const imageHeight = size;
  const imageWidth = Math.round(size * 0.75); // Assuming 4:3 aspect ratio for vertical images

  useEffect(() => {
    if (!animate) return;

    // Gentle floating animation
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        })
      ])
    );

    // Gentle pulse for attention
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true
        })
      ])
    );

    floatAnimation.start();
    pulseAnimation.start();

    return () => {
      floatAnimation.stop();
      pulseAnimation.stop();
    };
  }, [animate, bounceAnim, pulseAnim]);

  // Handle message visibility
  useEffect(() => {
    if (showMessage || messageVisible) {
      setMessageVisible(true);
      Animated.spring(messageAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true
      }).start();
    } else {
      // Reset manual stop flag when message is hidden
      setHasManuallyStoppedVoice(false);
      Animated.spring(messageAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true
      }).start(() => setMessageVisible(false));
    }
  }, [showMessage, messageVisible, messageAnim]);

  // Handle speech animation
  useEffect(() => {
    if (isSpeaking) {
      const speechAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(speechAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
          }),
          Animated.timing(speechAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true
          })
        ])
      );
      speechAnimation.start();
      return () => speechAnimation.stop();
    }
  }, [isSpeaking, speechAnim]);

  // Monitor audio player playing state
  useEffect(() => {
    setIsPlayingVoice(audioPlayer.playing);
    
    // Additional check for web compatibility
    const checkPlayingState = () => {
      if (audioPlayer) {
        setIsPlayingVoice(audioPlayer.playing);
      }
    };
    
    // Check state periodically for web compatibility
    const interval = setInterval(checkPlayingState, 100);
    
    return () => clearInterval(interval);
  }, [audioPlayer.playing, audioPlayer]);

  const playVoiceAsset = useCallback(() => {
    if (!voiceAsset || !audioPlayer) return;

    try {
      // Reset manual stop flag when manually playing
      setHasManuallyStoppedVoice(false);
      // Reset to beginning and play
      audioPlayer.seekTo(0);
      audioPlayer.play();
    } catch (error) {
      console.error('Error playing voice asset:', error);
    }
  }, [voiceAsset, audioPlayer]);

  const stopVoiceAsset = useCallback(async () => {
    if (audioPlayer) {
      try {
        // Mark as manually stopped to prevent auto-restart
        setHasManuallyStoppedVoice(true);
        
        // For web compatibility, try multiple methods to stop audio
        if (audioPlayer.playing) {
          audioPlayer.pause();
        }
        // Reset to beginning to ensure it stops completely
        await audioPlayer.seekTo(0);
        // Force update the state for web compatibility
        setIsPlayingVoice(false);
      } catch (error) {
        console.error('Error stopping voice asset:', error);
        // Fallback: try to recreate the audio player to force stop
        try {
          if (audioPlayer.playing) {
            audioPlayer.remove();
          }
        } catch (fallbackError) {
          console.error('Fallback stop method failed:', fallbackError);
        }
        // Ensure state is updated even if stop fails
        setIsPlayingVoice(false);
      }
    }
  }, [audioPlayer]);

  // Handle voice asset playback - must be after playVoiceAsset is defined
  useEffect(() => {
    if (autoPlayVoice && voiceAsset && showMessage && !isPlayingVoice && !hasManuallyStoppedVoice) {
      playVoiceAsset();
    }
  }, [showMessage, autoPlayVoice, voiceAsset, isPlayingVoice, hasManuallyStoppedVoice, playVoiceAsset]);

  const handlePress = () => {
    if (minimal) return; // Don't handle press in minimal mode

    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);

    // Trigger haptic feedback if available
    // if (Platform.OS !== 'web' && Haptics) {
    //   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // }

    // Toggle message visibility
    setMessageVisible(!messageVisible);

    if (onTap) {
      onTap();
    }
  };

  const handleSpeech = () => {
    if (!enableSpeech) return;

    const textToSpeak = message || defaultMessages[mood];
    setIsSpeaking(!isSpeaking);

    if (onSpeech) {
      onSpeech(textToSpeak);
    }
  };

  const bounceTransform = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8]
  });

  const messageOpacity = messageAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });

  const messageScale = messageAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1]
  });

  const speechIconOpacity = speechAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1]
  });

  const currentMessage = message || defaultMessages[mood];

  // If minimal mode, just return the turtle image without any interactive elements
  if (minimal) {
    return (
      <View className={`items-center ${className}`}>
        <Animated.View
          style={{
            transform: [
              { translateY: animate ? bounceTransform : 0 },
              { scale: animate ? pulseAnim : 1 }
            ]
          }}
        >
          <Image
            source={turtleImages[mood]}
            style={{
              width: imageWidth,
              height: imageHeight
            }}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    );
  }

  return (
    <View className={`items-center ${className}`}>
      {/* Speech bubble */}
      {messageVisible && (
        <Animated.View
          style={{
            opacity: messageOpacity,
            transform: [{ scale: messageScale }],
            elevation: 8
          }}
          className="mb-4 max-w-xs"
        >
          <View className="bg-chalk border-2 border-royal-palm rounded-2xl px-4 py-3 shadow-lg"
                style={{
                  elevation: 8
                }}>
            <Text className="text-earie-black font-inter text-base leading-relaxed text-center">
              {currentMessage}
            </Text>
            {/* Speech bubble tail */}
            <View className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <View className="w-4 h-4 bg-chalk border-b-2 border-r-2 border-royal-palm rotate-45" />
            </View>
          </View>
        </Animated.View>
      )}

      {/* Turtle character */}
      <View className="relative">
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.8}
          className="items-center justify-center"
        >
          <Animated.View
            style={{
              transform: [
                { translateY: bounceTransform },
                { scale: pulseAnim },
                { scale: isPressed ? 0.95 : 1 }
              ]
            }}
          >
            <View className="relative">
              {/* Subtle glow effect behind the turtle */}
              <View
                className="absolute inset-0 rounded-full opacity-15"
                style={{
                  backgroundColor: '#418D84',
                  width: imageWidth,
                  height: imageHeight,
                  shadowColor: '#418D84',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.4,
                  shadowRadius: 15,
                  elevation: 5,
                  zIndex: -1
                }}
              />

              <Image
                source={turtleImages[mood]}
                style={{
                  width: imageWidth,
                  height: imageHeight,
                  zIndex: 1
                }}
                resizeMode="contain"
              />
            </View>
          </Animated.View>
        </TouchableOpacity>

        {/* Speech control button */}
        {enableSpeech && (
          <TouchableOpacity
            onPress={handleSpeech}
            className="absolute -top-2 -right-2 w-8 h-8 bg-royal-palm rounded-full items-center justify-center shadow-lg"
          >
            <Animated.View style={{ opacity: speechIconOpacity }}>
              {isSpeaking ? (
                <VolumeX size={16} color="#F6F4F1" />
              ) : (
                <Volume2 size={16} color="#F6F4F1" />
              )}
            </Animated.View>
          </TouchableOpacity>
        )}

        {/* Voice asset control button */}
        {voiceAsset && (
          <TouchableOpacity
            onPress={isPlayingVoice ? stopVoiceAsset : playVoiceAsset}
            className="absolute -bottom-2 -left-2 w-8 h-8 bg-turtle-indigo-500 rounded-full items-center justify-center shadow-lg"
          >
            {isPlayingVoice ? (
              <VolumeX size={16} color="#F6F4F1" />
            ) : (
              <Volume2 size={16} color="#F6F4F1" />
            )}
          </TouchableOpacity>
        )}

        {/* Message indicator */}
        {!messageVisible && (
          <TouchableOpacity
            onPress={() => setMessageVisible(true)}
            className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-glass rounded-full items-center justify-center shadow-lg border-2 border-royal-palm"
          >
            <MessageCircle size={16} color="#418D84" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// Helper function to get appropriate mood for context
export const getTurtleMoodForContext = (context: string): TurtleMood => {
  switch (context.toLowerCase()) {
    case 'welcome':
    case 'greeting':
      return 'hi';
    case 'exercise':
    case 'workout':
      return 'excited';
    case 'celebration':
    case 'success':
    case 'complete':
      return 'great';
    case 'learning':
    case 'education':
      return 'idea';
    case 'meditation':
    case 'calm':
    case 'breathing':
      return 'meditation';
    case 'support':
    case 'encouragement':
      return 'love';
    case 'question':
    case 'help':
      return 'questioning';
    case 'difficulty':
    case 'struggle':
      return 'sad';
    case 'speech':
    case 'communication':
      return 'speech';
    case 'progress':
    case 'writing':
      return 'writing';
    case 'goodbye':
    case 'farewell':
      return 'wave-right';
    default:
      return 'main';
  }
};

// Predefined companion configurations for common scenarios
export const TurtleCompanionPresets = {
  welcome: {
    mood: 'wave-left' as TurtleMood,
    message: 'Welcome to your recovery journey! I\'m here to support you every step of the way.',
    showMessage: true
  },
  exercise: {
    mood: 'excited' as TurtleMood,
    message: 'Ready to move and grow stronger? Let\'s do this together!',
    showMessage: false
  },
  celebration: {
    mood: 'great' as TurtleMood,
    message: 'Incredible work! Every small step is a victory worth celebrating!',
    showMessage: true
  },
  meditation: {
    mood: 'meditation' as TurtleMood,
    message: 'Let\'s take a peaceful moment together. Breathe slowly and feel the calm.',
    showMessage: false
  },
  encouragement: {
    mood: 'love' as TurtleMood,
    message: 'You\'re stronger than you know. I believe in you completely!',
    showMessage: false
  },
  learning: {
    mood: 'idea' as TurtleMood,
    message: 'Learning something new today? I love discovering things together with you!',
    showMessage: false
  },
  support: {
    mood: 'questioning' as TurtleMood,
    message: 'How are you feeling? Remember, it\'s okay to have difficult days too.',
    showMessage: false
  }
};