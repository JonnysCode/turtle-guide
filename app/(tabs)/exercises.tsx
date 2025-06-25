import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, Clock, Star, ChevronRight, CheckCircle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import TurtleAvatar from '@/components/TurtleAvatar';
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
    let interval: NodeJS.Timeout;
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
      <SafeAreaView className="flex-1 bg-turtle-cream">
        <View className="flex-1 px-6 py-6">
          <View className="items-center mb-8">
            <TurtleAvatar size={100} mood="encouraging" animate={isPerforming} />
            <Text className="text-2xl font-inter-bold text-turtle-slate mt-4 text-center">
              {selectedExercise.name}
            </Text>
            <Text className="text-turtle-slate/70 font-inter mt-2 text-center">
              {isPerforming ? "You're doing great! Keep going!" : "Get ready to begin"}
            </Text>
          </View>

          {isPerforming && (
            <View className="bg-white rounded-2xl p-8 mb-6 items-center shadow-sm">
              <Text className="text-6xl font-inter-bold text-turtle-teal mb-2">
                {formatTime(timeRemaining)}
              </Text>
              <Text className="text-turtle-slate/70 font-inter">Time remaining</Text>
            </View>
          )}

          <ScrollView className="flex-1 bg-white rounded-2xl p-6 shadow-sm">
            <Text className="text-lg font-inter-bold text-turtle-slate mb-4">
              Instructions
            </Text>
            {selectedExercise.instructions.map((instruction, index) => (
              <View key={index} className="flex-row mb-3">
                <Text className="text-turtle-teal font-inter-bold mr-3">
                  {index + 1}.
                </Text>
                <Text className="text-turtle-slate font-inter flex-1">
                  {instruction}
                </Text>
              </View>
            ))}
            
            <View className="bg-turtle-teal/5 p-4 rounded-xl mt-4">
              <Text className="text-turtle-teal font-inter-semibold mb-2">
                💡 Benefits
              </Text>
              <Text className="text-turtle-slate font-inter">
                {selectedExercise.benefits}
              </Text>
            </View>
          </ScrollView>

          <View className="flex-row space-x-4 mt-6">
            <TouchableOpacity
              onPress={stopExercise}
              className="flex-1 bg-gray-200 py-4 rounded-2xl"
            >
              <Text className="text-turtle-slate font-inter-semibold text-center">
                Stop
              </Text>
            </TouchableOpacity>
            
            {!isPerforming ? (
              <TouchableOpacity
                onPress={() => startExercise(selectedExercise)}
                className="flex-1 bg-turtle-teal py-4 rounded-2xl"
              >
                <Text className="text-white font-inter-semibold text-center">
                  Start Exercise
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={completeExercise}
                className="flex-1 bg-turtle-green py-4 rounded-2xl"
              >
                <Text className="text-white font-inter-semibold text-center">
                  Complete Early
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-turtle-cream">
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="py-6">
          <View className="items-center mb-6">
            <TurtleAvatar size={80} mood="encouraging" />
            <Text className="text-2xl font-inter-bold text-turtle-slate mt-3">
              Exercise Time!
            </Text>
            <Text className="text-turtle-slate/70 font-inter text-center mt-1">
              Choose an exercise that feels right for you today
            </Text>
          </View>

          {completedToday.length > 0 && (
            <View className="bg-turtle-green/10 p-4 rounded-xl mb-6 border border-turtle-green/20">
              <Text className="text-turtle-green font-inter-semibold mb-1">
                🎉 Great job today!
              </Text>
              <Text className="text-turtle-slate font-inter">
                You've completed {completedToday.length} exercise{completedToday.length > 1 ? 's' : ''} already
              </Text>
            </View>
          )}

          <Text className="text-lg font-inter-bold text-turtle-slate mb-4">
            Recommended for You
          </Text>

          <View className="space-y-4">
            {getFilteredExercises().map((exercise) => {
              const isCompleted = completedToday.includes(exercise.id);
              const categoryColor = categoryColors[exercise.category];
              
              return (
                <TouchableOpacity
                  key={exercise.id}
                  onPress={() => setSelectedExercise(exercise)}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-turtle-teal/10"
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-2">
                        <Text className="text-2xl mr-2">
                          {categoryIcons[exercise.category]}
                        </Text>
                        <Text className="text-lg font-inter-bold text-turtle-slate">
                          {exercise.name}
                        </Text>
                        {isCompleted && (
                          <CheckCircle size={20} color="#10B981" className="ml-2" />
                        )}
                      </View>
                      <Text className="text-turtle-slate/70 font-inter text-sm mb-2">
                        {exercise.description}
                      </Text>
                      <View className="flex-row items-center">
                        <Clock size={16} color="#64748B" />
                        <Text className="text-turtle-slate/70 font-inter text-sm ml-1 mr-4">
                          {Math.ceil(exercise.duration / 60)} min
                        </Text>
                        <View className="flex-row">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              color={i < exercise.difficulty ? categoryColor : '#E5E7EB'}
                              fill={i < exercise.difficulty ? categoryColor : 'none'}
                            />
                          ))}
                        </View>
                      </View>
                    </View>
                    <View className="items-center">
                      {isCompleted ? (
                        <View className="w-12 h-12 bg-turtle-green/10 rounded-full items-center justify-center">
                          <CheckCircle size={24} color="#10B981" />
                        </View>
                      ) : (
                        <View className="w-12 h-12 bg-turtle-teal/10 rounded-full items-center justify-center">
                          <Play size={20} color="#14B8A6" />
                        </View>
                      )}
                    </View>
                  </View>
                  
                  <View className="flex-row justify-between items-center">
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
                    <ChevronRight size={20} color="#64748B" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View className="bg-white rounded-2xl p-6 mt-6 shadow-sm border border-turtle-teal/10">
            <Text className="text-turtle-slate font-inter-semibold mb-2">
              🐢 Turtle Wisdom
            </Text>
            <Text className="text-turtle-slate/70 font-inter">
              "Remember, progress isn't about speed - it's about consistency. Even the smallest movement forward is a victory worth celebrating!"
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}