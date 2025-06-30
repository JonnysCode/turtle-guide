'use dom';

import { useConversation } from '@elevenlabs/react';
import { ArrowRight, BookOpen, Mic, MicOff, PhoneOff, Play, X } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

// Define suggestion types that Shelly can make
interface ExerciseSuggestion {
  type: 'exercise';
  id: string;
  name: string;
  category: string;
  duration: number;
  difficulty: number;
}

interface LearningSuggestion {
  type: 'learning';
  id: string;
  title: string;
  category: string;
  duration: number;
}

interface MoodSuggestion {
  type: 'mood-check';
  message: string;
}

type AISuggestion = ExerciseSuggestion | LearningSuggestion | MoodSuggestion;

async function requestMicrophonePermission() {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    return true;
  } catch (error) {
    console.error('Microphone permission denied:', error);
    return false;
  }
}

export default function TurtleConversationAI({
                                               patientName,
                                               mobilityLevel,
                                               recoveryGoals,
                                               strokeType,
                                               currentMood,
                                               todaysExercises,
                                               onEndConversation
                                             }: {
  dom?: import('expo/dom').DOMProps;
  patientName: string;
  mobilityLevel: number;
  recoveryGoals: string[];
  strokeType: string;
  currentMood: string;
  todaysExercises: number;
  onEndConversation: () => void;
}) {
  const router = useRouter();
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [conversationTranscript, setConversationTranscript] = useState<string[]>([]);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Turtle AI Connected');
      setConnectionStatus('connected');
    },
    onDisconnect: () => {
      console.log('Turtle AI Disconnected');
      setConnectionStatus('disconnected');
    },
    onMessage: (message) => {
      console.log('Turtle AI Message:', message);
      if (message.type === 'agent_response') {
        setConversationTranscript(prev => [...prev, `Shelly: ${message.message}`]);
      } else if (message.type === 'user_transcript') {
        setConversationTranscript(prev => [...prev, `You: ${message.transcript}`]);
      }
    },
    onError: (error) => {
      console.error('Turtle AI Error:', error);
      setConnectionStatus('disconnected');
    }
  });

  // Exercise and lesson lookup data
  const exerciseData: Record<string, {
    id: string;
    name: string;
    category: string;
    duration: number;
    difficulty: number
  }> = {
    'shoulder-rolls': {
      id: 'shoulder-rolls',
      name: 'Gentle Shoulder Rolls',
      category: 'mobility',
      duration: 5,
      difficulty: 1
    },
    'finger-stretches': {
      id: 'finger-stretches',
      name: 'Finger Flexibility',
      category: 'fine-motor',
      duration: 4,
      difficulty: 1
    },
    'ankle-circles': { id: 'ankle-circles', name: 'Ankle Circles', category: 'mobility', duration: 4, difficulty: 1 },
    'deep-breathing': {
      id: 'deep-breathing',
      name: 'Deep Breathing Exercise',
      category: 'cognitive',
      duration: 6,
      difficulty: 1
    },
    'speech-practice': {
      id: 'speech-practice',
      name: 'Speech Practice',
      category: 'speech',
      duration: 8,
      difficulty: 2
    },
    'memory-games': {
      id: 'memory-games',
      name: 'Memory Enhancement',
      category: 'cognitive',
      duration: 10,
      difficulty: 2
    },
    'coordination-exercises': {
      id: 'coordination-exercises',
      name: 'Hand-Eye Coordination',
      category: 'fine-motor',
      duration: 7,
      difficulty: 2
    }
  };

  const lessonData: Record<string, { id: string; title: string; category: string; duration: number }> = {
    'understanding-stroke': {
      id: 'understanding-stroke',
      title: 'Understanding Stroke Recovery',
      category: 'basics',
      duration: 8
    },
    'nutrition-healing': {
      id: 'nutrition-healing',
      title: 'Nutrition for Healing',
      category: 'lifestyle',
      duration: 6
    },
    'emotional-wellbeing': {
      id: 'emotional-wellbeing',
      title: 'Managing Emotions After Stroke',
      category: 'mental-health',
      duration: 10
    },
    'sleep-recovery': { id: 'sleep-recovery', title: 'Sleep and Recovery', category: 'lifestyle', duration: 7 },
    'family-support': { id: 'family-support', title: 'Family Support Systems', category: 'lifestyle', duration: 9 },
    'daily-routines': { id: 'daily-routines', title: 'Building Daily Routines', category: 'lifestyle', duration: 8 }
  };

  // Client tools that Shelly can use to make suggestions
  const clientTools = {
    suggest_exercise: (params: any) => {
      const exerciseName = params.exercise_name;
      const exerciseInfo = exerciseData[exerciseName];

      if (exerciseInfo) {
        const suggestion: ExerciseSuggestion = {
          type: 'exercise',
          id: exerciseInfo.id,
          name: exerciseInfo.name,
          category: exerciseInfo.category,
          duration: exerciseInfo.duration,
          difficulty: exerciseInfo.difficulty
        };
        setSuggestions(prev => [...prev, suggestion]);
        return { success: true, message: `Exercise "${exerciseInfo.name}" suggested` };
      }
      return { success: false, message: 'Exercise not found' };
    },
    suggest_learning: (params: any) => {
      const lessonName = params.lesson_name;
      const lessonInfo = lessonData[lessonName];

      if (lessonInfo) {
        const suggestion: LearningSuggestion = {
          type: 'learning',
          id: lessonInfo.id,
          title: lessonInfo.title,
          category: lessonInfo.category,
          duration: lessonInfo.duration
        };
        setSuggestions(prev => [...prev, suggestion]);
        return { success: true, message: `Learning module "${lessonInfo.title}" suggested` };
      }
      return { success: false, message: 'Lesson not found' };
    },
    mood_check_followup: (params: any) => {
      const suggestion: MoodSuggestion = {
        type: 'mood-check',
        message: params.message
      };
      setSuggestions(prev => [...prev, suggestion]);
      return { success: true, message: 'Mood check-in recorded' };
    }
  };

  const startConversation = useCallback(async () => {
    try {
      setConnectionStatus('connecting');
      setSuggestions([]);
      setConversationTranscript([]);

      // Request microphone permission
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        Alert.alert('Microphone Permission Required', 'Please allow microphone access to chat with your turtle companion.');
        setConnectionStatus('disconnected');
        return;
      }

      // Enhanced patient context for better conversations
      const patientContext = {
        user_name: patientName,
        mobility_level: mobilityLevel.toString(),
        recovery_goals: recoveryGoals.join(', '),
        stroke_type: strokeType,
        current_mood: currentMood,
        todays_exercises: todaysExercises.toString(),
        time_of_day: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening',
        date: new Date().toLocaleDateString(),
        // Add available exercises and lessons for context (exact names that client tools expect)
        available_exercises: Object.keys(exerciseData).join(', '),
        available_lessons: Object.keys(lessonData).join(', ')
      };

      // Start the conversation with enhanced context
      await conversation.startSession({
        agentId: 'agent_01jz10176ke5c9qpzr1e05k9hb',
        dynamicVariables: patientContext,
        clientTools: clientTools
      });
    } catch (error) {
      console.error('Failed to start turtle conversation:', error);
      setConnectionStatus('disconnected');
      Alert.alert('Connection Error', 'Failed to connect to your turtle companion. Please try again.');
    }
  }, [conversation, patientName, mobilityLevel, recoveryGoals, strokeType, currentMood, todaysExercises, exerciseData, lessonData, clientTools]);

  const endConversation = useCallback(async () => {
    try {
      await conversation.endSession();
      onEndConversation();
    } catch (error) {
      console.error('Failed to end conversation:', error);
      onEndConversation();
    }
  }, [conversation, onEndConversation]);

  const handleExerciseSuggestion = (suggestion: ExerciseSuggestion) => {
    router.push(`/exercise/${suggestion.id}`);
  };

  const handleLearningSuggestion = (suggestion: LearningSuggestion) => {
    router.push(`/lesson/${suggestion.id}`);
  };

  const dismissSuggestion = (index: number) => {
    setSuggestions(prev => prev.filter((_, i) => i !== index));
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connecting':
        return 'Connecting to Shelly...';
      case 'connected':
        return 'Shelly is listening...';
      default:
        return 'Tap to start talking with Shelly';
    }
  };

  const getButtonColor = () => {
    switch (connectionStatus) {
      case 'connecting':
        return '#F59E0B';
      case 'connected':
        return '#EF4444';
      default:
        return '#418D84';
    }
  };

  const getButtonIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <MicOff size={32} color="#F6F4F1" />;
      default:
        return <Mic size={32} color="#F6F4F1" />;
    }
  };

  const renderSuggestion = (suggestion: AISuggestion, index: number) => {
    if (suggestion.type === 'exercise') {
      return (
        <View key={index} className="bg-turtle-cream-100 border border-turtle-teal-300 rounded-2xl p-4 mb-3">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <Play size={20} color="#418D84" />
              <Text className="text-earie-black font-inter-bold ml-2">Exercise Suggestion</Text>
            </View>
            <TouchableOpacity onPress={() => dismissSuggestion(index)}>
              <X size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <Text className="text-earie-black font-inter-semibold mb-1">{suggestion.name}</Text>
          <Text className="text-royal-palm font-inter text-sm mb-3">
            {suggestion.category} • {suggestion.duration} min • Level {suggestion.difficulty}
          </Text>
          <TouchableOpacity
            onPress={() => handleExerciseSuggestion(suggestion)}
            className="bg-royal-palm py-3 px-4 rounded-xl flex-row items-center justify-center"
          >
            <Text className="text-chalk font-inter-semibold mr-2">Start Exercise</Text>
            <ArrowRight size={16} color="#F6F4F1" />
          </TouchableOpacity>
        </View>
      );
    }

    if (suggestion.type === 'learning') {
      return (
        <View key={index} className="bg-blue-glass border border-royal-palm rounded-2xl p-4 mb-3">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <BookOpen size={20} color="#418D84" />
              <Text className="text-earie-black font-inter-bold ml-2">Learning Suggestion</Text>
            </View>
            <TouchableOpacity onPress={() => dismissSuggestion(index)}>
              <X size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <Text className="text-earie-black font-inter-semibold mb-1">{suggestion.title}</Text>
          <Text className="text-royal-palm font-inter text-sm mb-3">
            {suggestion.category} • {suggestion.duration} min read
          </Text>
          <TouchableOpacity
            onPress={() => handleLearningSuggestion(suggestion)}
            className="bg-royal-palm py-3 px-4 rounded-xl flex-row items-center justify-center"
          >
            <Text className="text-chalk font-inter-semibold mr-2">Learn More</Text>
            <ArrowRight size={16} color="#F6F4F1" />
          </TouchableOpacity>
        </View>
      );
    }

    if (suggestion.type === 'mood-check') {
      return (
        <View key={index} className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-3">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-yellow-800 font-inter-bold">💭 Shelly's Note</Text>
            <TouchableOpacity onPress={() => dismissSuggestion(index)}>
              <X size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <Text className="text-yellow-800 font-inter leading-relaxed">{suggestion.message}</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View className="flex-1 bg-turtle-cream-50 p-6">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Main Control Interface */}
        <View className="items-center mb-6">
          <Text className="text-lg font-inter-bold text-earie-black text-center mb-8">
            {getStatusText()}
          </Text>

          <Pressable
            className="w-32 h-32 rounded-full items-center justify-center mb-6 shadow-lg"
            style={{ backgroundColor: getButtonColor() }}
            onPress={connectionStatus === 'disconnected' ? startConversation : endConversation}
            disabled={connectionStatus === 'connecting'}
          >
            {getButtonIcon()}
          </Pressable>

          {connectionStatus === 'connected' && (
            <Pressable
              className="flex-row items-center bg-red-50 px-4 py-2 rounded-full border border-red-200 mb-6"
              onPress={endConversation}
            >
              <PhoneOff size={20} color="#EF4444" />
              <Text className="text-red-500 font-inter-semibold ml-2">End Chat</Text>
            </Pressable>
          )}

          <Text className="text-royal-palm font-inter text-center leading-relaxed max-w-xs">
            {connectionStatus === 'connected'
              ? 'Speak naturally - Shelly is here to help with your recovery journey!'
              : 'Shelly can suggest exercises, discuss your mood, share learning resources, and provide personalized recovery support.'}
          </Text>
        </View>

        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-inter-bold text-earie-black mb-4">
              🐢 Shelly's Suggestions
            </Text>
            {suggestions.map((suggestion, index) => renderSuggestion(suggestion, index))}
          </View>
        )}

        {/* Conversation History (optional) */}
        {conversationTranscript.length > 0 && connectionStatus === 'connected' && (
          <View className="bg-chalk border border-turtle-teal-200 rounded-2xl p-4">
            <Text className="text-earie-black font-inter-bold mb-3">Conversation</Text>
            <ScrollView className="max-h-40">
              {conversationTranscript.slice(-10).map((line, index) => (
                <Text key={index} className="text-earie-black font-inter text-sm mb-1 leading-relaxed">
                  {line}
                </Text>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}