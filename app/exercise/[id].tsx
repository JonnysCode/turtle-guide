import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CircleCheck as CheckCircle, Play } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import TurtleCompanion from '@/components/TurtleCompanion';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { supabase } from '@/lib/supabase';

interface Exercise {
  id: string;
  name: string;
  category: 'mobility' | 'speech' | 'cognitive' | 'fine-motor';
  difficulty: number;
  duration: number;
  description: string;
  instructions: string[];
  benefits: string;
}

const exercises: Exercise[] = [
  {
    id: 'shoulder-rolls',
    name: 'Gentle Shoulder Rolls',
    category: 'mobility',
    difficulty: 1,
    duration: 300,
    description: 'Relaxing shoulder movements to improve range of motion',
    instructions: [
      'Sit comfortably with feet flat on floor',
      'Slowly roll shoulders forward 5 times',
      'Then roll shoulders backward 5 times',
      'Rest for 10 seconds and repeat 2 more times'
    ],
    benefits: 'Reduces tension and improves shoulder mobility'
  },
  {
    id: 'finger-stretches',
    name: 'Finger Flexibility',
    category: 'fine-motor',
    difficulty: 1,
    duration: 240,
    description: 'Simple finger exercises to maintain dexterity',
    instructions: [
      'Place hand flat on table',
      'Slowly lift each finger one at a time',
      'Hold for 3 seconds, then lower',
      'Repeat with other hand'
    ],
    benefits: 'Improves fine motor control and hand strength'
  },
  {
    id: 'breathing-exercise',
    name: 'Calm Breathing',
    category: 'cognitive',
    difficulty: 1,
    duration: 600,
    description: 'Mindful breathing to reduce stress and improve focus',
    instructions: [
      'Sit or lie down comfortably',
      'Breathe in slowly through nose for 4 counts',
      'Hold breath gently for 4 counts',
      'Exhale slowly through mouth for 6 counts',
      'Repeat 5-10 times'
    ],
    benefits: 'Reduces anxiety and improves concentration'
  },
  {
    id: 'speech-sounds',
    name: 'Sound Practice',
    category: 'speech',
    difficulty: 2,
    duration: 420,
    description: 'Practice common sounds and syllables',
    instructions: [
      'Sit in front of a mirror',
      'Practice "ma-ma-ma" sounds clearly',
      'Try "ba-ba-ba" and "pa-pa-pa"',
      'Say each sound slowly and clearly',
      'Rest between each set'
    ],
    benefits: 'Strengthens speech muscles and improves clarity'
  },
  {
    id: 'ankle-circles',
    name: 'Ankle Mobility',
    category: 'mobility',
    difficulty: 2,
    duration: 360,
    description: 'Gentle ankle movements to improve circulation',
    instructions: [
      'Sit with legs extended',
      'Make slow circles with your ankles',
      'Circle 10 times in each direction',
      'Switch to other ankle',
      'Point and flex feet 10 times'
    ],
    benefits: 'Improves blood flow and ankle flexibility'
  },
  {
    id: 'memory-game',
    name: 'Simple Memory',
    category: 'cognitive',
    difficulty: 2,
    duration: 480,
    description: 'Gentle cognitive exercise to strengthen memory',
    instructions: [
      'Look around the room and pick 5 objects',
      'Say each object name out loud',
      'Close your eyes and try to recall all 5',
      'Open eyes and check your memory',
      'Try with different objects'
    ],
    benefits: 'Enhances memory and cognitive function'
  }
];

const categoryColors = {
  mobility: '#14B8A6',
  speech: '#F59E0B',
  cognitive: '#8B5CF6',
  'fine-motor': '#EC4899'
};

export default function ExerciseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isPerforming, setIsPerforming] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  useEffect(() => {
    const foundExercise = exercises.find(ex => ex.id === id);
    if (foundExercise) {
      setExercise(foundExercise);
      setTimeRemaining(foundExercise.duration);
      checkIfCompletedToday(foundExercise.id);
    }
  }, [id]);

  useEffect(() => {
    let interval: number;
    if (isPerforming && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (isPerforming && timeRemaining === 0) {
      completeExercise();
    }
    return () => clearInterval(interval);
  }, [isPerforming, timeRemaining]);

  const checkIfCompletedToday = async (exerciseId: string) => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('exercise_sessions')
      .select('id')
      .eq('user_id', user.id)
      .eq('exercise_type', exerciseId)
      .eq('completed', true)
      .gte('created_at', today)
      .lt('created_at', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .limit(1);

    if (data && data.length > 0) {
      setIsCompleted(true);
    }
  };

  const startExercise = () => {
    if (!exercise) return;
    setTimeRemaining(exercise.duration);
    setIsPerforming(true);
  };

  const showCompletionMessage = () => {
    if (Platform.OS === 'web') {
      // On web, show our custom modal instead of Alert
      setShowCompletionModal(true);
    } else {
      // On native platforms, use Alert
      Alert.alert(
        'Excellent Work! 🎉',
        'You completed the exercise! I\'m so proud of your dedication.',
        [
          {
            text: 'Continue',
            onPress: () => {
              router.back();
            }
          }
        ]
      );
    }
  };

  const handleCompletionModalClose = () => {
    setShowCompletionModal(false);
    router.back();
  };

  const completeExercise = async () => {
    if (!user || !exercise) return;

    setIsPerforming(false);

    try {
      // Record exercise session
      const { error: sessionError } = await supabase
        .from('exercise_sessions')
        .insert({
          user_id: user.id,
          exercise_type: exercise.id,
          duration: exercise.duration,
          difficulty_level: exercise.difficulty,
          completed: true
        });

      if (sessionError) {
        console.error('Error recording exercise session:', sessionError);
        if (Platform.OS === 'web') {
          setShowCompletionModal(true);
        } else {
          Alert.alert('Error', 'Failed to record exercise completion');
        }
        return;
      }

      // Update daily progress
      const today = new Date().toISOString().split('T')[0];
      const { data: existingProgress } = await supabase
        .from('daily_progress')
        .select('exercises_completed')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      const { error: progressError } = await supabase
        .from('daily_progress')
        .upsert({
          user_id: user.id,
          date: today,
          exercises_completed: (existingProgress?.exercises_completed || 0) + 1
        }, {
          onConflict: 'user_id,date'
        });

      if (progressError) {
        console.error('Error updating daily progress:', progressError);
      }

      // Mark as completed locally
      setIsCompleted(true);

      // Show success message (platform-specific)
      showCompletionMessage();

    } catch (error) {
      console.error('Error in completeExercise:', error);
      if (Platform.OS === 'web') {
        setShowCompletionModal(true);
      } else {
        Alert.alert('Error', 'Failed to record exercise completion. Please try again.');
      }
    }
  };

  const stopExercise = () => {
    setIsPerforming(false);
    if (exercise) {
      setTimeRemaining(exercise.duration);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!exercise) {
    return (
      <SafeAreaView className="flex-1 bg-chalk" edges={['top', 'left', 'right', 'bottom']}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-earie-black font-inter text-lg">Exercise not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const categoryColor = categoryColors[exercise.category];

  return (
    <SafeAreaView className="flex-1 bg-turtle-cream-50" edges={['top', 'left', 'right', 'bottom']}>
      {/* Completion Modal for Web */}
      {showCompletionModal && Platform.OS === 'web' && (
        <View className="absolute inset-0 bg-black/50 z-50 items-center justify-center">
          <View className="bg-chalk rounded-3xl p-8 mx-6 max-w-md w-full shadow-2xl">
            <View className="items-center mb-6">
              <TurtleCompanion
                size={120}
                mood="great"
                message="Excellent work! You completed the exercise!"
                showMessage={false}
                animate={true}
              />
            </View>
            
            <Text className="text-2xl font-inter-bold text-earie-black text-center mb-4">
              Excellent Work! 🎉
            </Text>
            
            <Text className="text-earie-black font-inter text-center text-lg mb-8 leading-relaxed">
              You completed the exercise! I'm so proud of your dedication to your recovery journey.
            </Text>
            
            <Button
              onPress={handleCompletionModalClose}
              variant="primary"
              size="lg"
              className="w-full"
              style={{ backgroundColor: categoryColor }}
            >
              Continue
            </Button>
          </View>
        </View>
      )}

      {/* Header with back button */}
      <View className="px-6 py-4 border-b border-turtle-teal-300">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-12 h-12 bg-turtle-cream-100 border border-turtle-teal-300 rounded-full items-center justify-center mr-4"
          >
            <ArrowLeft size={24} color="#1A1F16" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-inter-bold text-earie-black">
              {exercise.name}
            </Text>
            <Text className="text-royal-palm font-inter text-sm capitalize">
              {exercise.category.replace('-', ' ')} Exercise
            </Text>
          </View>
          <View className="flex-row items-center">
            {isCompleted && (
              <View className="w-10 h-10 bg-royal-palm rounded-full items-center justify-center mr-3">
                <CheckCircle size={20} color="#F6F4F1" />
              </View>
            )}
            <View
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{ backgroundColor: categoryColor }}
            >
              <Text className="text-white text-xl">
                {exercise.category === 'mobility' ? '🚶' :
                  exercise.category === 'speech' ? '💬' :
                    exercise.category === 'cognitive' ? '🧠' : '✋'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-6 bg-chalk" showsVerticalScrollIndicator={false}>
        <View className="items-center mb-8">
          <TurtleCompanion
            size={120}
            mood={isPerforming ? 'excited' : isCompleted ? 'great' : 'meditation'}
            message={
              isPerforming 
                ? 'You\'re doing amazing! Keep going strong!' 
                : isCompleted 
                  ? 'Fantastic work! You completed this exercise today!'
                  : 'Take your time and breathe. I believe in you!'
            }
            showMessage={isPerforming || isCompleted}
            animate={true}
          />
          <Text className="text-royal-palm font-inter mt-4 text-center text-lg">
            {isPerforming 
              ? 'You\'re doing great! Keep going!' 
              : isCompleted 
                ? 'Already completed today! Great job!'
                : exercise.description
            }
          </Text>
        </View>

        {isPerforming && (
          <Card variant="glow" className="mb-8 bg-blue-glass border-2 border-royal-palm">
            <View className="items-center">
              <Text className="text-6xl font-inter-bold text-royal-palm mb-3">
                {formatTime(timeRemaining)}
              </Text>
              <Text className="text-earie-black font-inter-semibold text-lg">Time remaining</Text>
            </View>
          </Card>
        )}

        {isCompleted && (
          <Card variant="elevated" className="mb-8 bg-emerald-50 border-emerald-300">
            <View className="items-center">
              <CheckCircle size={48} color="#10B981" />
              <Text className="text-emerald-700 font-inter-bold text-xl mt-3 mb-2">
                Exercise Completed!
              </Text>
              <Text className="text-emerald-600 font-inter text-center">
                You've already completed this exercise today. Great work on staying consistent!
              </Text>
            </View>
          </Card>
        )}

        <Card variant="elevated" className="mb-6">
          <Text className="text-2xl font-inter-bold text-earie-black mb-6">
            Instructions
          </Text>
          {exercise.instructions.map((instruction, index) => (
            <View key={index} className="flex-row mb-4 p-3 bg-flaxseed rounded-xl">
              <View className="w-8 h-8 bg-royal-palm rounded-full items-center justify-center mr-4">
                <Text className="text-chalk font-inter-bold">
                  {index + 1}
                </Text>
              </View>
              <Text className="text-earie-black font-inter flex-1 text-base leading-relaxed">
                {instruction}
              </Text>
            </View>
          ))}
        </Card>

        <Card variant="flat" className="bg-blue-glass border-royal-palm mb-8">
          <View className="flex-row items-start">
            <Text className="text-2xl mr-3">💡</Text>
            <View className="flex-1">
              <Text className="text-royal-palm font-inter-bold mb-3 text-lg">
                Benefits
              </Text>
              <Text className="text-earie-black font-inter text-base leading-relaxed">
                {exercise.benefits}
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Fixed bottom buttons */}
      {!isPerforming ? (
        <View
          className="px-6 pt-4 bg-turtle-cream-50 border-t border-turtle-teal-300"
          style={{
            paddingBottom: Platform.OS === 'android' ? Math.max(24, insets.bottom + 16) : 24
          }}
        >
          <View className="flex-row gap-4">
            {!isCompleted ? (
              <Button
                onPress={startExercise}
                variant="primary"
                size="lg"
                className="flex-1"
                leftIcon={<Play size={20} color="white" />}
                style={{ backgroundColor: categoryColor }}
              >
                Start Exercise
              </Button>
            ) : (
              <Button
                onPress={startExercise}
                variant="outline"
                size="lg"
                className="flex-1"
                leftIcon={<Play size={20} color={categoryColor} />}
              >
                Do Again
              </Button>
            )}
          </View>
        </View>
      ) : (
        <View
          className="px-6 pt-4 bg-turtle-cream-50 border-t border-turtle-teal-300"
          style={{
            paddingBottom: Platform.OS === 'android' ? Math.max(24, insets.bottom + 16) : 24
          }}
        >
          <View className="gap-3">
            <Button
              onPress={completeExercise}
              variant="success"
              size="lg"
              className="w-full"
              leftIcon={<CheckCircle size={20} color="white" />}
            >
              Mark as Complete
            </Button>
            <View className="flex-row gap-3">
              <Button
                onPress={() => router.back()}
                variant="ghost"
                size="md"
                className="flex-1"
              >
                Exit
              </Button>
              <Button
                onPress={stopExercise}
                variant="outline"
                size="md"
                className="flex-1"
              >
                Pause Exercise
              </Button>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}