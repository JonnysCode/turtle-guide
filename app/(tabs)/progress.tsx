import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Award, Smile, Target, TrendingUp } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import TurtleAvatar from '@/components/TurtleAvatar';
import TurtleCompanion from '@/components/TurtleCompanion';
import { supabase } from '@/lib/supabase';

interface ProgressData {
  date: string;
  exercises_completed: number;
  mood_rating: number;
}

interface Achievement {
  id: string;
  achievement_type: string;
  unlocked_at: string;
}

const achievementTypes = {
  'first_exercise': { icon: '🎯', title: 'First Steps', description: 'Completed your first exercise' },
  'week_streak': { icon: '🔥', title: 'Week Warrior', description: '7 days in a row' },
  'month_streak': { icon: '💎', title: 'Consistency Champion', description: '30 days in a row' },
  'exercise_master': { icon: '💪', title: 'Exercise Master', description: '50 exercises completed' },
  'learning_lover': { icon: '📚', title: 'Learning Lover', description: 'Completed 5 lessons' },
  'mood_tracker': { icon: '😊', title: 'Self-Aware', description: 'Tracked mood for 10 days' }
};

export default function Progress() {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [totalExercises, setTotalExercises] = useState(0);
  const [averageMood, setAverageMood] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    if (user) {
      fetchProgressData();
      fetchAchievements();
      fetchTotalExercises();
    }
  }, [user, selectedPeriod]);

  const fetchProgressData = async () => {
    if (!user) return;

    let startDate = new Date();
    if (selectedPeriod === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (selectedPeriod === 'month') {
      startDate.setDate(startDate.getDate() - 30);
    } else {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const { data } = await supabase
      .from('daily_progress')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (data) {
      setProgressData(data);

      // Calculate average mood
      const moodRatings = data.filter(d => d.mood_rating).map(d => d.mood_rating);
      const avgMood = moodRatings.length > 0
        ? moodRatings.reduce((sum, rating) => sum + rating, 0) / moodRatings.length
        : 0;
      setAverageMood(Math.round(avgMood * 10) / 10);
    }
  };

  const fetchAchievements = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', user.id)
      .order('unlocked_at', { ascending: false });

    if (data) {
      setAchievements(data);
    }
  };

  const fetchTotalExercises = async () => {
    if (!user) return;

    const { count } = await supabase
      .from('exercise_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('completed', true);

    setTotalExercises(count || 0);
  };

  const getCurrentStreak = () => {
    if (progressData.length === 0) return 0;

    let streak = 0;
    const today = new Date();

    // Sort data by date descending
    const sortedData = [...progressData].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    for (let i = 0; i < sortedData.length; i++) {
      const progressDate = new Date(sortedData[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      if (progressDate.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const getExerciseChart = () => {
    const screenWidth = Dimensions.get('window').width;
    const chartWidth = screenWidth - 48; // Account for padding
    const maxExercises = Math.max(...progressData.map(d => d.exercises_completed), 1);

    return progressData.map((data, index) => {
      const height = (data.exercises_completed / maxExercises) * 100;
      const date = new Date(data.date);
      const dayLabel = date.getDate().toString();

      return (
        <View key={index} className="items-center flex-1">
          <View
            className="bg-royal-palm rounded-t-lg w-6 min-h-[4px]"
            style={{ height: Math.max(height, 4) }}
          />
          <Text className="text-royal-palm font-inter text-xs mt-2">
            {dayLabel}
          </Text>
        </View>
      );
    });
  };

  const getMoodEmoji = (rating: number) => {
    if (rating >= 4.5) return '😊';
    if (rating >= 3.5) return '🙂';
    if (rating >= 2.5) return '😐';
    if (rating >= 1.5) return '😕';
    return '😢';
  };

  return (
    <SafeAreaView className="flex-1 bg-chalk" edges={['top', 'left', 'right']}>
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="py-6">
          <View className="items-center mb-6">
            <TurtleCompanion 
              size={100} 
              mood="great" 
              message="Look at all you've accomplished! Your progress makes my shell sparkle with pride!"
              showMessage={false}
              animate={true}
            />
            <Text className="text-2xl font-inter-bold text-earie-black mt-3">
              Your Progress
            </Text>
            <Text className="text-royal-palm font-inter text-center mt-1">
              Look how far you've come!
            </Text>
          </View>

          {/* Period Selection */}
          <View
            className="bg-turtle-teal-50 border border-turtle-teal-300 rounded-2xl p-2 mb-6 shadow-lg shadow-turtle-teal-300/50">
            <View className="flex-row">
              {(['week', 'month', 'all'] as const).map((period) => (
                <TouchableOpacity
                  key={period}
                  onPress={() => setSelectedPeriod(period)}
                  className={`flex-1 py-3 rounded-xl mx-1 ${
                    selectedPeriod === period ? 'bg-royal-palm' : 'bg-blue-glass'
                  }`}
                >
                  <Text className={`text-center font-inter-semibold ${
                    selectedPeriod === period ? 'text-chalk' : 'text-earie-black'
                  }`}>
                    {period === 'week' ? 'Week' : period === 'month' ? 'Month' : 'All Time'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Key Stats */}
          <View
            className="bg-turtle-cream-100 border border-turtle-teal-300 rounded-2xl p-6 mb-6 shadow-lg shadow-turtle-teal-300/50">
            <Text className="text-lg font-inter-bold text-earie-black mb-4">
              Key Statistics
            </Text>
            <View className="flex-row justify-between">
              <View className="items-center">
                <View className="w-12 h-12 bg-royal-palm/20 rounded-xl items-center justify-center mb-2">
                  <Target size={24} color="#418D84" />
                </View>
                <Text className="text-2xl font-inter-bold text-earie-black">
                  {totalExercises}
                </Text>
                <Text className="text-royal-palm font-inter text-sm text-center">
                  Total{'\n'}Exercises
                </Text>
              </View>

              <View className="items-center">
                <View className="w-12 h-12 bg-tropical-indigo/20 rounded-xl items-center justify-center mb-2">
                  <TrendingUp size={24} color="#9381FF" />
                </View>
                <Text className="text-2xl font-inter-bold text-earie-black">
                  {getCurrentStreak()}
                </Text>
                <Text className="text-royal-palm font-inter text-sm text-center">
                  Current{'\n'}Streak
                </Text>
              </View>

              <View className="items-center">
                <View className="w-12 h-12 bg-flaxseed rounded-xl items-center justify-center mb-2">
                  <Smile size={24} color="#418D84" />
                </View>
                <Text className="text-2xl font-inter-bold text-earie-black">
                  {averageMood > 0 ? averageMood : '-'}
                </Text>
                <Text className="text-royal-palm font-inter text-sm text-center">
                  Average{'\n'}Mood {averageMood > 0 && getMoodEmoji(averageMood)}
                </Text>
              </View>
            </View>
          </View>

          {/* Exercise Chart */}
          {progressData.length > 0 && (
            <View
              className="bg-turtle-cream-100 border border-turtle-teal-300 rounded-2xl p-6 mb-6 shadow-lg shadow-turtle-teal-300/50">
              <Text className="text-lg font-inter-bold text-earie-black mb-4">
                Daily Exercise Activity
              </Text>
              <View className="flex-row items-end justify-between h-32 mb-4">
                {getExerciseChart()}
              </View>
              <Text className="text-royal-palm font-inter text-center text-sm">
                Exercises completed per day
              </Text>
            </View>
          )}

          {/* Achievements */}
          <View
            className="bg-turtle-cream-100 border border-turtle-teal-300 rounded-2xl p-6 mb-6 shadow-lg shadow-turtle-teal-300/50">
            <Text className="text-lg font-inter-bold text-earie-black mb-4">
              Achievements Unlocked
            </Text>
            {achievements.length > 0 ? (
              <View className="gap-3">
                {achievements.slice(0, 5).map((achievement, index) => {
                  const achievementInfo = achievementTypes[achievement.achievement_type as keyof typeof achievementTypes];
                  const unlockedDate = new Date(achievement.unlocked_at).toLocaleDateString();

                  return (
                    <View key={achievement.id} className="flex-row items-center bg-flaxseed p-4 rounded-xl">
                      <Text className="text-3xl mr-4">{achievementInfo?.icon || '🏆'}</Text>
                      <View className="flex-1">
                        <Text className="font-inter-semibold text-earie-black">
                          {achievementInfo?.title || 'Achievement'}
                        </Text>
                        <Text className="text-royal-palm font-inter text-sm">
                          {achievementInfo?.description || 'Great job!'}
                        </Text>
                        <Text className="text-royal-palm/70 font-inter text-xs mt-1">
                          Unlocked {unlockedDate}
                        </Text>
                      </View>
                      <Award size={20} color="#418D84" />
                    </View>
                  );
                })}
              </View>
            ) : (
              <View className="items-center py-8">
                <Text className="text-6xl mb-2">🏆</Text>
                <Text className="text-royal-palm font-inter text-center">
                  Your achievements will appear here{'\n'}as you make progress!
                </Text>
              </View>
            )}
          </View>

          {/* Turtle Encouragement */}
          <View
            className="bg-turtle-indigo-50 border border-turtle-indigo-200 rounded-3xl px-6 py-4 mt-4">
            <View className="flex-row items-start mb-2">
              <View className="flex-1">
                <Text className="text-turtle-indigo-700 font-inter-bold text-lg ml-1">
                  🐢 Progress Reflection
                </Text>
              </View>
            </View>
            <Text
              className="text-turtle-indigo-700 font-inter text-base leading-relaxed italic">
              {totalExercises > 0
                ? `"Look at all you've accomplished! ${totalExercises} exercises completed shows your incredible dedication. Every small step forward is a victory worth celebrating. I'm so proud of your commitment to recovery!"`
                : '"Every journey begins with a single step. You\'re here, you\'re learning, and that\'s already progress! I\'m excited to celebrate many achievements with you in the days ahead."'
              }
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}