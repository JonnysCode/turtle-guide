import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Award, Smile, Target, TrendingUp } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import TurtleCompanion from '@/components/TurtleCompanion';
import Card from '@/components/Card';
import { supabase } from '@/lib/supabase';
import { achievementDefinitions, getAchievementProgress, getUserStats } from '@/lib/achievementSystem';

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

const badgeImages = {
  'first_exercise': require('@/assets/images/badges/badge-1.png'),
  'exercise_streak_3': require('@/assets/images/badges/badge-2.png'),
  'exercise_streak_7': require('@/assets/images/badges/badge-3.png'),
  'exercise_master_10': require('@/assets/images/badges/badge-4.png'),
  'exercise_master_25': require('@/assets/images/badges/badge-5.png'),
  'exercise_master_50': require('@/assets/images/badges/badge-6.png'),
  'learning_enthusiast': require('@/assets/images/badges/badge-1.png'),
  'learning_master': require('@/assets/images/badges/badge-5.png'),
  'mood_tracker_7': require('@/assets/images/badges/badge-6.png'),
  'weekly_warrior': require('@/assets/images/badges/badge-3.png')
};

const moodIcons = [
  { rating: 1, icon: '😢', color: '#EF4444', label: 'Tough' },
  { rating: 2, icon: '😕', color: '#F97316', label: 'Hard' },
  { rating: 3, icon: '😐', color: '#F59E0B', label: 'Okay' },
  { rating: 4, icon: '🙂', color: '#10B981', label: 'Good' },
  { rating: 5, icon: '😊', color: '#14B8A6', label: 'Great' }
];

const categoryColors = {
  exercise: '#14B8A6',
  consistency: '#9381FF',
  learning: '#F59E0B',
  milestone: '#EC4899',
  mood: '#8B5CF6',
  special: '#10B981'
};

export default function Progress() {
  const { user } = useAuth();
  const { profile } = useUser();
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [achievementProgress, setAchievementProgress] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [averageMood, setAverageMood] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user, selectedPeriod]);

  const fetchAllData = async () => {
    if (!user) return;

    try {
      // Fetch user stats
      const stats = await getUserStats(user.id);
      setUserStats(stats);

      // Fetch achievement progress
      const progress = await getAchievementProgress(user.id);
      setAchievementProgress(progress);

      // Fetch achievements
      const { data: achievementData } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });

      if (achievementData) {
        setAchievements(achievementData);

        // Calculate total points
        const points = achievementData.reduce((total, achievement) => {
          const def = achievementDefinitions.find(a => a.id === achievement.achievement_type);
          return total + (def?.points || 0);
        }, 0);
        setTotalPoints(points);
      }

      // Fetch progress data for charts
      await fetchProgressData();
    } catch (error) {
      console.error('Error fetching progress data:', error);
    }
  };

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

  const getFullWeekData = () => {
    const today = new Date();
    const weekData = [];

    // Generate the last 7 days (including today)
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];

      // Find existing data for this date
      const existingData = progressData.find(d => d.date === dateString);

      weekData.push({
        date: dateString,
        exercises_completed: existingData?.exercises_completed || 0,
        mood_rating: existingData?.mood_rating || null,
        dayName: date.toLocaleDateString('en', { weekday: 'short' }),
        dayNumber: date.getDate()
      });
    }

    return weekData;
  };

  const getExerciseChart = () => {
    const weekData = getFullWeekData();
    const maxExercises = Math.max(...weekData.map(d => d.exercises_completed), 1);

    return weekData.map((data, index) => {
      const height = maxExercises > 0 ? (data.exercises_completed / maxExercises) * 80 : 4;
      const isToday = data.date === new Date().toISOString().split('T')[0];

      return (
        <View key={index} className="items-center flex-1">
          <View className="h-20 justify-end mb-2">
            <View
              className={`rounded-t-lg w-6 min-h-[4px] ${
                data.exercises_completed > 0
                  ? 'bg-royal-palm'
                  : 'bg-gray-300'
              } ${isToday ? 'border-2 border-tropical-indigo' : ''}`}
              style={{ height: Math.max(height, 4) }}
            />
          </View>
          <Text className={`font-inter text-xs ${
            isToday ? 'text-tropical-indigo font-inter-bold' : 'text-royal-palm'
          }`}>
            {data.dayName}
          </Text>
          <Text className={`font-inter-bold text-xs ${
            data.exercises_completed > 0 ? 'text-earie-black' : 'text-gray-400'
          }`}>
            {data.exercises_completed}
          </Text>
        </View>
      );
    });
  };

  const getMoodEmoji = (rating: number) => {
    const mood = moodIcons.find(m => m.rating === Math.round(rating));
    return mood?.icon || '😐';
  };

  const getUnlockedAchievements = () => {
    return achievementProgress.filter(a => a.isUnlocked);
  };

  const getLockedAchievements = () => {
    return achievementProgress.filter(a => !a.isUnlocked);
  };

  const getProgressLevel = () => {
    if (totalPoints < 50) return { level: 1, title: 'Beginner', color: '#10B981', progress: totalPoints / 50 };
    if (totalPoints < 150) return { level: 2, title: 'Explorer', color: '#3B82F6', progress: (totalPoints - 50) / 100 };
    if (totalPoints < 300) return {
      level: 3,
      title: 'Achiever',
      color: '#8B5CF6',
      progress: (totalPoints - 150) / 150
    };
    if (totalPoints < 500) return {
      level: 4,
      title: 'Champion',
      color: '#EC4899',
      progress: (totalPoints - 300) / 200
    };
    return { level: 5, title: 'Master', color: '#F59E0B', progress: 1 };
  };

  const levelInfo = getProgressLevel();

  if (!userStats) {
    return (
      <SafeAreaView className="flex-1 bg-chalk" edges={['top', 'left', 'right']}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-earie-black font-inter text-lg">Loading progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-chalk" edges={['top', 'left', 'right']}>
      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="py-6">
          {/* Header */}
          <View className="items-center mb-6">
            <TurtleCompanion
              size={140}
              mood="great"
              message="Look at all you've accomplished! Your progress makes my shell sparkle with pride!"
              showMessage={false}
              animate={true}
            />
            <Text className="text-2xl font-inter-bold text-earie-black mt-3">
              Your Progress
            </Text>
            <Text className="text-royal-palm font-inter text-center mt-1">
              Every step forward is a victory! 🌟
            </Text>
          </View>

          {/* Level Progress */}
          <Card variant="elevated" className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50">
            <View className="items-center">
              <View className="flex-row items-center mb-4">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: levelInfo.color }}
                >
                  <Text className="text-white font-inter-bold text-lg">
                    {levelInfo.level}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-inter-bold text-earie-black">
                    Level {levelInfo.level} - {levelInfo.title}
                  </Text>
                  <Text className="text-royal-palm font-inter">
                    {totalPoints} points earned
                  </Text>
                </View>
              </View>

              <View className="w-full bg-blue-glass rounded-full h-3 mb-2">
                <View
                  className="h-3 rounded-full"
                  style={{
                    width: `${levelInfo.progress * 100}%`,
                    backgroundColor: levelInfo.color
                  }}
                />
              </View>

              <Text className="text-royal-palm font-inter text-sm">
                {levelInfo.level < 5
                  ? `${Math.round((1 - levelInfo.progress) * 100)}% to next level`
                  : 'Maximum level achieved! 🏆'
                }
              </Text>
            </View>
          </Card>

          {/* Key Stats */}
          <Card variant="elevated" className="mb-6">
            <Text className="text-lg font-inter-bold text-earie-black mb-4">
              Key Statistics
            </Text>
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <View className="w-14 h-14 bg-royal-palm/20 rounded-xl items-center justify-center mb-2">
                  <Target size={28} color="#418D84" />
                </View>
                <Text className="text-2xl font-inter-bold text-earie-black">
                  {userStats.totalExercises}
                </Text>
                <Text className="text-royal-palm font-inter text-sm text-center">
                  Total{'\n'}Exercises
                </Text>
              </View>

              <View className="items-center flex-1">
                <View className="w-14 h-14 bg-tropical-indigo/20 rounded-xl items-center justify-center mb-2">
                  <TrendingUp size={28} color="#9381FF" />
                </View>
                <Text className="text-2xl font-inter-bold text-earie-black">
                  {userStats.currentStreak}
                </Text>
                <Text className="text-royal-palm font-inter text-sm text-center">
                  Current{'\n'}Streak
                </Text>
              </View>

              <View className="items-center flex-1">
                <View className="w-14 h-14 bg-flaxseed rounded-xl items-center justify-center mb-2">
                  <Smile size={28} color="#418D84" />
                </View>
                <Text className="text-2xl font-inter-bold text-earie-black">
                  {averageMood > 0 ? averageMood : '-'}
                </Text>
                <Text className="text-royal-palm font-inter text-sm text-center">
                  Average{'\n'}Mood {averageMood > 0 && getMoodEmoji(averageMood)}
                </Text>
              </View>

              <View className="items-center flex-1">
                <View className="w-14 h-14 bg-blue-glass rounded-xl items-center justify-center mb-2">
                  <Award size={28} color="#418D84" />
                </View>
                <Text className="text-2xl font-inter-bold text-earie-black">
                  {achievements.length}
                </Text>
                <Text className="text-royal-palm font-inter text-sm text-center">
                  Badges{'\n'}Earned
                </Text>
              </View>
            </View>
          </Card>

          {/* Exercise Chart - Always show full week */}
          <Card variant="elevated" className="mb-6">
            <Text className="text-lg font-inter-bold text-earie-black mb-4">
              Weekly Exercise Activity
            </Text>
            <View className="flex-row items-end justify-between mb-4">
              {getExerciseChart()}
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-royal-palm font-inter text-sm">
                Last 7 days • Today highlighted
              </Text>
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-royal-palm rounded mr-2" />
                <Text className="text-royal-palm font-inter text-xs mr-3">Active</Text>
                <View className="w-3 h-3 bg-gray-300 rounded mr-2" />
                <Text className="text-gray-500 font-inter text-xs">Rest</Text>
              </View>
            </View>
          </Card>

          {/* Achievements Section */}
          <Card variant="elevated" className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-inter-bold text-earie-black">
                Achievements
              </Text>
              <View className="bg-royal-palm px-3 py-1 rounded-full">
                <Text className="text-chalk font-inter-semibold text-sm">
                  {achievements.length}/{achievementDefinitions.length}
                </Text>
              </View>
            </View>

            {/* Unlocked Achievements */}
            {getUnlockedAchievements().length > 0 && (
              <View className="mb-6">
                <Text className="text-royal-palm font-inter-bold mb-3">
                  🏆 Earned Badges
                </Text>
                <View className="flex-row flex-wrap gap-3">
                  {getUnlockedAchievements().map((achievement) => {
                    const unlockedData = achievements.find(a => a.achievement_type === achievement.id);
                    const unlockedDate = unlockedData ? new Date(unlockedData.unlocked_at).toLocaleDateString() : '';
                    const badgeImage = badgeImages[achievement.id as keyof typeof badgeImages];

                    return (
                      <View key={achievement.id}
                            className="bg-turtle-cream-200 rounded-xl px-4 pb-4 pt-4 flex-1 min-w-[45%] max-w-[48%] items-center border-2 border-royal-palm shadow-xl">
                        {/* Earned Badge with Enhanced Visibility */}
                        <View className="relative mb-3">
                          {/* Glow effect */}
                          <View className="absolute -inset-2 rounded-full "
                                style={{ backgroundColor: categoryColors[achievement.category] }} />
                          <View className="w-16 h-16 items-center justify-center relative">
                            <Image
                              source={badgeImage}
                              style={{
                                width: 64,
                                height: 64,
                                maxWidth: 64,
                                maxHeight: 64
                              }}
                              resizeMode="contain"
                            />
                          </View>
                        </View>

                        <Text className="font-inter-bold text-earie-black text-center mb-1 text-base">
                          {achievement.title}
                        </Text>
                        <Text className="text-earie-black/80 font-inter text-xs text-center mb-3 leading-tight">
                          {achievement.description}
                        </Text>

                        <View className="flex-row items-center gap-2 mb-2">
                          <View
                            className="px-3 py-1 rounded-full"
                            style={{ backgroundColor: categoryColors[achievement.category] }}
                          >
                            <Text className="text-white font-inter-bold text-xs">
                              +{achievement.points} pts
                            </Text>
                          </View>
                          <View className="bg-emerald-100 px-2 py-1 rounded-full">
                            <Text className="text-emerald-700 font-inter-bold text-xs">
                              ✓ EARNED
                            </Text>
                          </View>
                        </View>

                        <Text className="text-earie-black/60 font-inter text-xs">
                          {unlockedDate}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Locked Achievements */}
            {getLockedAchievements().length > 0 && (
              <View>
                <Text className="text-royal-palm font-inter-bold mb-3">
                  🎯 Available Badges
                </Text>
                <View className="flex-row flex-wrap gap-3">
                  {getLockedAchievements().slice(0, 4).map((achievement) => {
                    const badgeImage = badgeImages[achievement.id as keyof typeof badgeImages];
                    const progressPercent = Math.round(achievement.progress * 100);

                    return (
                      <View key={achievement.id}
                            className="bg-turtle-cream-200 rounded-xl px-4 pb-4 pt-2 flex-1 min-w-[45%] max-w-[48%] items-center border border-turtle-teal-300">
                        <View className="w-20 h-20 mb-1 items-center justify-center relative">
                          {/* Badge image with light opacity overlay */}
                          <Image
                            source={badgeImage}
                            style={{
                              width: 64,
                              height: 64,
                              maxWidth: 64,
                              maxHeight: 64,
                              opacity: 0.3
                            }}
                            resizeMode="contain"
                          />
                          <View className="absolute inset-0 items-center justify-center">
                            <View className="bg-gray-600/80 px-2 py-1 rounded">
                              <Text className="text-white font-inter-bold text-xs">
                                LOCKED
                              </Text>
                            </View>
                          </View>
                        </View>

                        <Text className="font-inter-bold text-gray-800 text-center mb-1 text-base">
                          {achievement.title}
                        </Text>
                        <Text className="text-gray-700 font-inter text-xs text-center mb-3 leading-tight">
                          {achievement.description}
                        </Text>
                        <Text className="text-gray-600 font-inter-semibold text-xs text-center mb-3">
                          {achievement.requirement}
                        </Text>

                        {/* Progress bar for locked achievements */}
                        {progressPercent > 0 && (
                          <View className="w-full mb-3">
                            <View className="w-full bg-gray-300 rounded-full h-2 mb-1">
                              <View
                                className="h-2 rounded-full"
                                style={{
                                  width: `${progressPercent}%`,
                                  backgroundColor: categoryColors[achievement.category]
                                }}
                              />
                            </View>
                            <Text className="text-gray-700 font-inter text-xs text-center">
                              {progressPercent}% complete
                            </Text>
                          </View>
                        )}

                        <View
                          className="px-3 py-1 rounded-full"
                          style={{ backgroundColor: `${categoryColors[achievement.category]}20` }}
                        >
                          <Text
                            className="font-inter-bold text-xs"
                            style={{ color: categoryColors[achievement.category] }}
                          >
                            +{achievement.points} pts
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </Card>

          {/* Motivational Message */}
          <Card variant="flat" className="bg-turtle-indigo-50 border-turtle-indigo-400">
            <View className="flex-row items-start">
              <Text className="text-3xl mr-3">🐢</Text>
              <View className="flex-1">
                <Text className="text-turtle-indigo-700 font-inter-bold text-lg mb-2">
                  Progress Reflection from {profile?.turtle_name || 'Shelly'}
                </Text>
                <Text className="text-turtle-indigo-700 font-inter text-base leading-relaxed italic">
                  {userStats.totalExercises > 0
                    ? `"Look at all you've accomplished! ${userStats.totalExercises} exercises completed and ${achievements.length} badges earned shows your incredible dedication. Every small step forward is a victory worth celebrating. I'm so proud of your commitment to recovery!"`
                    : '"Every journey begins with a single step. You\'re here, you\'re learning, and that\'s already progress! I\'m excited to celebrate many achievements with you in the days ahead."'
                  }
                </Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}