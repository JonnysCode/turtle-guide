import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle, Clock, Play, Star } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import TurtleAvatar from '@/components/TurtleAvatar';
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

const categoryIcons = {
  mobility: '🚶',
  speech: '💬',
  cognitive: '🧠',
  'fine-motor': '✋'
};

const categoryColors = {
  mobility: '#14B8A6',
  speech: '#F59E0B',
  cognitive: '#8B5CF6',
  'fine-motor': '#EC4899'
};

export default function Exercises() {
  const { user } = useAuth();
  const { profile } = useUser();
  const [completedToday, setCompletedToday] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isPerforming, setIsPerforming] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    fetchTodayCompletions();
  }, [user]);

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

  const fetchTodayCompletions = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('exercise_sessions')
      .select('exercise_type')
      .eq('user_id', user.id)
      .eq('completed', true)
      .gte('created_at', today)
      .lt('created_at', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    if (data) {
      setCompletedToday(data.map(session => session.exercise_type));
    }
  };

  const startExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setTimeRemaining(exercise.duration);
    setIsPerforming(true);
  };

  const completeExercise = async () => {
    if (!user || !selectedExercise) return;

    setIsPerforming(false);

    // Record exercise session
    const { error } = await supabase
      .from('exercise_sessions')
      .insert({
        user_id: user.id,
        exercise_type: selectedExercise.id,
        duration: selectedExercise.duration,
        difficulty_level: selectedExercise.difficulty,
        completed: true
      });

    if (error) {
      Alert.alert('Error', 'Failed to record exercise completion');
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

    await supabase
      .from('daily_progress')
      .upsert({
        user_id: user.id,
        date: today,
        exercises_completed: (existingProgress?.exercises_completed || 0) + 1
      });

    setCompletedToday(prev => [...prev, selectedExercise.id]);
    setSelectedExercise(null);

    Alert.alert(
      'Excellent Work! 🎉',
      'You completed the exercise! I\'m so proud of your dedication.',
      [{ text: 'Thank you!', style: 'default' }]
    );
  };

  const stopExercise = () => {
    setIsPerforming(false);
    setSelectedExercise(null);
    setTimeRemaining(0);
  };

  const getFilteredExercises = () => {
    if (!profile) return exercises;

    return exercises.filter(exercise => {
      // Filter by mobility level - show exercises at or below user's level + 1
      const maxDifficulty = Math.min(5, Math.ceil(profile.mobility_level / 2) + 1);
      return exercise.difficulty <= maxDifficulty;
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (selectedExercise) {
    return (
      <SafeAreaView className="flex-1 bg-chalk" edges={['top', 'left', 'right']}>
        <View className="flex-1 px-6 py-8">
          <View className="items-center mb-10">
            <TurtleCompanion
              size={140}
              mood={isPerforming ? "excited" : "meditation"}
              message={isPerforming ? "You're doing amazing! Keep going strong!" : "Take your time and breathe. I believe in you!"}
              showMessage={isPerforming}
              animate={true}
            />
            <Text className="text-3xl font-inter-bold text-earie-black mt-6 text-center">
              {selectedExercise.name}
            </Text>
            <Text className="text-royal-palm font-inter mt-3 text-center text-lg">
              {isPerforming ? 'You\'re doing great! Keep going!' : 'Get ready to begin'}
            </Text>
          </View>

          {isPerforming && (
            <Card variant="glow"
                  className="mb-8 bg-blue-glass border-2 border-royal-palm">
              <View className="items-center">
                <Text className="text-7xl font-inter-bold text-royal-palm mb-3 animate-pulse">
                  {formatTime(timeRemaining)}
                </Text>
                <Text className="text-earie-black font-inter-semibold text-lg">Time remaining</Text>
              </View>
            </Card>
          )}

          <Card variant="elevated" className="flex-1 bg-chalk">
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-2xl font-inter-bold text-earie-black mb-6">
                Instructions
              </Text>
              {selectedExercise.instructions.map((instruction, index) => (
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

              <Card variant="flat"
                    className="bg-blue-glass border-royal-palm mt-6">
                <View className="flex-row items-start">
                  <Text className="text-2xl mr-3">💡</Text>
                  <View className="flex-1">
                    <Text className="text-royal-palm font-inter-bold mb-3 text-lg">
                      Benefits
                    </Text>
                    <Text className="text-earie-black font-inter text-base leading-relaxed">
                      {selectedExercise.benefits}
                    </Text>
                  </View>
                </View>
              </Card>
            </ScrollView>
          </Card>

          <View className="flex-row gap-4 mt-8">
            <Button
              onPress={stopExercise}
              variant="outline"
              size="lg"
              className="flex-1"
            >
              Stop
            </Button>

            {!isPerforming ? (
              <Button
                onPress={() => startExercise(selectedExercise)}
                variant="primary"
                size="lg"
                className="flex-1 shadow-nature"
                leftIcon={<Play size={20} color="white" />}
              >
                Start Exercise
              </Button>
            ) : (
              <Button
                onPress={completeExercise}
                variant="success"
                size="lg"
                className="flex-1 shadow-nature"
                leftIcon={<CheckCircle size={20} color="white" />}
              >
                Complete Early
              </Button>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-chalk" edges={['top', 'left', 'right']}>
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="py-6">
          <View className="items-center mb-6">
            <TurtleCompanion 
              size={100} 
              mood="excited" 
              message="Ready to move and grow stronger? Let's do this together!"
              showMessage={false}
              animate={true}
            />
            <Text className="text-2xl font-inter-bold text-earie-black mt-3">
              Exercise Time!
            </Text>
            <Text className="text-royal-palm font-inter text-center mt-1">
              Choose an exercise that feels right for you today
            </Text>
          </View>

          {completedToday.length > 0 && (
            <View
              className="bg-emerald-50 border border-emerald-300 px-6 py-4 rounded-2xl mb-6">
              <View className="flex-row items-center mb-2">
                <Text className="text-emerald-700 font-inter-bold text-lg flex-1">
                  🎉 Great job today!
                </Text>
              </View>
              <Text className="text-emerald-600 font-inter ml-13">
                You've completed {completedToday.length} exercise{completedToday.length > 1 ? 's' : ''} already
              </Text>
            </View>
          )}

          <Text className="text-lg font-inter-bold text-earie-black mb-4">
            Recommended for You
          </Text>

          <View className="gap-4">
            {getFilteredExercises().map((exercise) => {
              const isCompleted = completedToday.includes(exercise.id);
              const categoryColor = categoryColors[exercise.category];

              return (
                <TouchableOpacity
                  key={exercise.id}
                  onPress={() => setSelectedExercise(exercise)}
                  className={`bg-turtle-cream-100 border border-turtle-teal-300 rounded-2xl p-6 mb-4 shadow-lg shadow-turtle-teal-300/50 ${
                    isCompleted ? 'bg-blue-glass border-royal-palm' : ''
                  }`}
                >
                  <View className="flex-row justify-between">
                    <View className="flex-1 gap-2">
                      <View className="flex-row items-center mb-2">
                        <Text className="text-2xl mr-2">
                          {categoryIcons[exercise.category]}
                        </Text>
                        <Text className="text-lg font-inter-bold text-earie-black pr-2">
                          {exercise.name}
                        </Text>
                        {isCompleted && (
                          <CheckCircle size={20} color="#418D84" className="ml-2" />
                        )}
                      </View>
                      <Text className="text-royal-palm font-inter text-sm mb-2">
                        {exercise.description}
                      </Text>
                      <View className="flex-row items-center">
                        <Clock size={16} color="#418D84" />
                        <Text className="text-royal-palm font-inter text-sm ml-1 mr-4">
                          {Math.ceil(exercise.duration / 60)} min
                        </Text>
                        <View className="flex-row">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              color={i < exercise.difficulty ? categoryColor : '#B8DCDC'}
                              fill={i < exercise.difficulty ? categoryColor : 'white'}
                            />
                          ))}
                        </View>
                      </View>
                      <View className="flex-row justify-between items-center mt-2">
                        <View
                          className="px-3 py-1 rounded-full"
                          style={{ backgroundColor: `${categoryColor}20` }}
                        >
                          <Text
                            className="font-inter text-sm capitalize"
                            style={{ color: categoryColor }}
                          >
                            {exercise.category.replace('-', ' ')}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View className="items-center justify-end">
                      {isCompleted ? (
                        <View
                          className="w-14 h-14 bg-royal-palm rounded-full items-center justify-center shadow-lg shadow-turtle-cream-300/70">
                          <CheckCircle size={26} color="#F6F4F1" />
                        </View>
                      ) : (
                        <View
                          className="w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-turtle-cream-300/70"
                          style={{ backgroundColor: categoryColor }}
                        >
                          <Play size={22} color="#F6F4F1" />
                        </View>
                      )}
                    </View>
                  </View>

                </TouchableOpacity>
              );
            })}
          </View>

          <View
            className="bg-turtle-indigo-50 border border-turtle-indigo-200 rounded-3xl px-6 py-4 mt-8">
            <View className="flex-row items-start mb-2">
              <View className="flex-1">
                <Text className="text-turtle-indigo-700 font-inter-bold text-lg ml-1">
                  🐢 Turtle Wisdom
                </Text>
              </View>
            </View>
            <Text
              className="text-turtle-indigo-700 font-inter text-base leading-relaxed italic">
              "Remember, progress isn't about speed - it's about consistency. Even the smallest movement forward is a
              victory worth celebrating!"
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}