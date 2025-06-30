import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CircleCheck as CheckCircle, Clock, Play, Star } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import TurtleCompanion from '@/components/TurtleCompanion';
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
    id: 'deep-breathing',
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
    id: 'speech-practice',
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
    id: 'memory-games',
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
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useUser();
  const [completedToday, setCompletedToday] = useState<string[]>([]);

  useEffect(() => {
    fetchTodayCompletions();
  }, [user]);

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

  const navigateToExercise = (exerciseId: string) => {
    router.push(`/exercise/${exerciseId}`);
  };

  const getFilteredExercises = () => {
    if (!profile) return exercises;

    return exercises.filter(exercise => {
      // Filter by mobility level - show exercises at or below user's level + 1
      const maxDifficulty = Math.min(5, Math.ceil(profile.mobility_level / 2) + 1);
      return exercise.difficulty <= maxDifficulty;
    });
  };

  const getCategoryStats = () => {
    const categories = ['mobility', 'speech', 'cognitive', 'fine-motor'] as const;
    return categories.map(category => {
      const categoryExercises = getFilteredExercises().filter(ex => ex.category === category);
      const completedCount = categoryExercises.filter(ex => completedToday.includes(ex.id)).length;
      return {
        category,
        total: categoryExercises.length,
        completed: completedCount,
        icon: categoryIcons[category],
        color: categoryColors[category]
      };
    }).filter(stat => stat.total > 0);
  };

  return (
    <SafeAreaView className="flex-1 bg-chalk" edges={['top', 'left', 'right']}>
      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }} // Add padding for tab bar
      >
        <View className="py-6">
          {/* Header */}
          <View className="items-center mb-8">
            <TurtleCompanion
              size={120}
              mood="excited"
              message="Ready to move and grow stronger? Let's do this together!"
              showMessage={false}
              animate={true}
            />
            <Text className="text-3xl font-inter-bold text-earie-black mt-4">
              Exercise Time!
            </Text>
            <Text className="text-royal-palm font-inter text-center mt-2 text-lg">
              Choose an exercise that feels right for you today
            </Text>
          </View>

          {/* Progress Summary */}
          {completedToday.length > 0 && (
            <View className="bg-emerald-50 border border-emerald-300 px-6 py-4 rounded-2xl mb-6">
              <View className="flex-row items-center mb-2">
                <Text className="text-emerald-700 font-inter-bold text-lg flex-1">
                  🎉 Great job today!
                </Text>
                <Text className="text-emerald-600 font-inter-bold text-lg">
                  {completedToday.length}
                </Text>
              </View>
              <Text className="text-emerald-600 font-inter">
                You've completed {completedToday.length} exercise{completedToday.length > 1 ? 's' : ''} already
              </Text>
            </View>
          )}

          {/* Category Overview */}
          <View className="mb-6">
            <Text className="text-lg font-inter-bold text-earie-black mb-4">
              Categories Overview
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {getCategoryStats().map((stat) => (
                <View
                  key={stat.category}
                  className="bg-turtle-cream-100 border border-turtle-teal-300 rounded-xl p-4 flex-1 min-w-[45%]"
                >
                  <View className="flex-row items-center mb-2">
                    <Text className="text-2xl mr-2">{stat.icon}</Text>
                    <Text className="text-earie-black font-inter-semibold text-sm capitalize flex-1">
                      {stat.category.replace('-', ' ')}
                    </Text>
                  </View>
                  <Text className="text-royal-palm font-inter text-sm">
                    {stat.completed}/{stat.total} completed
                  </Text>
                  <View className="bg-turtle-cream-200 rounded-full h-2 mt-2">
                    <View
                      className="h-2 rounded-full"
                      style={{
                        width: `${(stat.completed / stat.total) * 100}%`,
                        backgroundColor: stat.color
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Exercise List */}
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
                  onPress={() => navigateToExercise(exercise.id)}
                  activeOpacity={0.7}
                  className={`bg-turtle-cream-100 border border-turtle-teal-300 rounded-2xl p-6 shadow-lg shadow-turtle-teal-300/50 ${
                    isCompleted ? 'bg-blue-glass border-royal-palm' : ''
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 mr-4">
                      {/* Exercise Header */}
                      <View className="flex-row items-center mb-3">
                        <Text className="text-2xl mr-3">
                          {categoryIcons[exercise.category]}
                        </Text>
                        <View className="flex-1">
                          <Text className="text-lg font-inter-bold text-earie-black">
                            {exercise.name}
                          </Text>
                          <Text className="text-royal-palm font-inter text-sm capitalize">
                            {exercise.category.replace('-', ' ')}
                          </Text>
                        </View>
                        {isCompleted && (
                          <CheckCircle size={24} color="#418D84" />
                        )}
                      </View>

                      {/* Description */}
                      <Text className="text-earie-black font-inter text-base mb-3 leading-relaxed">
                        {exercise.description}
                      </Text>

                      {/* Exercise Details */}
                      <View className="flex-row items-center justify-between">
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

                        <View
                          className="px-3 py-1 rounded-full"
                          style={{ backgroundColor: `${categoryColor}20` }}
                        >
                          <Text
                            className="font-inter text-xs"
                            style={{ color: categoryColor }}
                          >
                            Level {exercise.difficulty}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Action Button */}
                    <View className="items-center">
                      {isCompleted ? (
                        <View className="w-16 h-16 bg-royal-palm rounded-full items-center justify-center shadow-lg">
                          <CheckCircle size={28} color="#F6F4F1" />
                        </View>
                      ) : (
                        <View
                          className="w-16 h-16 rounded-full items-center justify-center shadow-lg"
                          style={{ backgroundColor: categoryColor }}
                        >
                          <Play size={24} color="#F6F4F1" />
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Motivational Message */}
          <View className="bg-turtle-indigo-50 border border-turtle-indigo-400 rounded-3xl px-6 py-5 mt-8">
            <View className="flex-row items-start">
              <Text className="text-3xl mr-3">🐢</Text>
              <View className="flex-1">
                <Text className="text-turtle-indigo-700 font-inter-bold text-lg mb-2">
                  Turtle Wisdom
                </Text>
                <Text className="text-turtle-indigo-700 font-inter text-base leading-relaxed italic">
                  "Remember, progress isn't about speed - it's about consistency. Even the smallest movement forward is
                  a victory worth celebrating!"
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}