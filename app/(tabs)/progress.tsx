import React, { useEffect, useState } from 'react';
import { Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Award, Calendar, Heart, Smile, Target, TrendingUp } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import TurtleCompanion from '@/components/TurtleCompanion';
import Card from '@/components/Card';
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

interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  badgeImage: any;
  category: 'exercise' | 'consistency' | 'learning' | 'milestone' | 'mood' | 'special';
  requirement: string;
  points: number;
}

const achievementDefinitions: AchievementDefinition[] = [
  {
    id: 'first_exercise',
    title: 'First Steps',
    description: 'Completed your very first exercise',
    badgeImage: require('@/assets/images/badges/badge-1.png'),
    category: 'exercise',
    requirement: 'Complete 1 exercise',
    points: 10
  },
  {
    id: 'exercise_streak_3',
    title: 'Building Momentum',
    description: 'Exercised for 3 days in a row',
    badgeImage: require('@/assets/images/badges/badge-2.png'),
    category: 'consistency',
    requirement: '3-day exercise streak',
    points: 25
  },
  {
    id: 'exercise_streak_7',
    title: 'Week Warrior',
    description: 'Maintained a 7-day exercise streak',
    badgeImage: require('@/assets/images/badges/badge-3.png'),
    category: 'consistency',
    requirement: '7-day exercise streak',
    points: 50
  },
  {
    id: 'exercise_master_25',
    title: 'Exercise Champion',
    description: 'Completed 25 total exercises',
    badgeImage: require('@/assets/images/badges/badge-4.png'),
    category: 'milestone',
    requirement: 'Complete 25 exercises',
    points: 75
  },
  {
    id: 'learning_enthusiast',
    title: 'Knowledge Seeker',
    description: 'Completed 3 learning modules',
    badgeImage: require('@/assets/images/badges/badge-5.png'),
    category: 'learning',
    requirement: 'Complete 3 lessons',
    points: 40
  },
  {
    id: 'mood_tracker_7',
    title: 'Self-Aware Soul',
    description: 'Tracked your mood for 7 consecutive days',
    badgeImage: require('@/assets/images/badges/badge-6.png'),
    category: 'mood',
    requirement: 'Track mood for 7 days',
    points: 30
  }
];

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
  const [totalExercises, setTotalExercises] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [averageMood, setAverageMood] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    if (user) {
      fetchProgressData();
      fetchAchievements();
      fetchTotalStats();
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
      
      // Calculate total points
      const points = data.reduce((total, achievement) => {
        const def = achievementDefinitions.find(a => a.id === achievement.achievement_type);
        return total + (def?.points || 0);
      }, 0);
      setTotalPoints(points);
    }
  };

  const fetchTotalStats = async () => {
    if (!user) return;

    // Get total exercises
    const { count: exerciseCount } = await supabase
      .from('exercise_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('completed', true);

    // Get total lessons
    const { count: lessonCount } = await supabase
      .from('education_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('completed', true);

    setTotalExercises(exerciseCount || 0);
    setTotalLessons(lessonCount || 0);
  };

  const getCurrentStreak = () => {
    if (progressData.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    const sortedData = [...progressData].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    for (let i = 0; i < sortedData.length; i++) {
      const progressDate = new Date(sortedData[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      if (progressDate.toDateString() === expectedDate.toDateString() && 
          sortedData[i].exercises_completed > 0) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const getExerciseChart = () => {
    const screenWidth = Dimensions.get('window').width;
    const chartWidth = screenWidth - 48;
    const maxExercises = Math.max(...progressData.map(d => d.exercises_completed), 1);

    return progressData.slice(-7).map((data, index) => {
      const height = (data.exercises_completed / maxExercises) * 80;
      const date = new Date(data.date);
      const dayLabel = date.toLocaleDateString('en', { weekday: 'short' });

      return (
        <View key={index} className="items-center flex-1">
          <View className="h-20 justify-end mb-2">
            <View
              className="bg-royal-palm rounded-t-lg w-6 min-h-[4px]"
              style={{ height: Math.max(height, 4) }}
            />
          </View>
          <Text className="text-royal-palm font-inter text-xs">
            {dayLabel}
          </Text>
          <Text className="text-earie-black font-inter-bold text-xs">
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
    return achievementDefinitions.filter(def => 
      achievements.some(a => a.achievement_type === def.id)
    );
  };

  const getLockedAchievements = () => {
    return achievementDefinitions.filter(def => 
      !achievements.some(a => a.achievement_type === def.id)
    );
  };

  const getProgressLevel = () => {
    if (totalPoints < 50) return { level: 1, title: 'Beginner', color: '#10B981', progress: totalPoints / 50 };
    if (totalPoints < 150) return { level: 2, title: 'Explorer', color: '#3B82F6', progress: (totalPoints - 50) / 100 };
    if (totalPoints < 300) return { level: 3, title: 'Achiever', color: '#8B5CF6', progress: (totalPoints - 150) / 150 };
    if (totalPoints < 500) return { level: 4, title: 'Champion', color: '#EC4899', progress: (totalPoints - 300) / 200 };
    return { level: 5, title: 'Master', color: '#F59E0B', progress: 1 };
  };

  const levelInfo = getProgressLevel();

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

          {/* Period Selection */}
          <Card variant="flat" className="mb-6 bg-turtle-cream-100 border-turtle-teal-300">
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
                  {totalExercises}
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
                  {getCurrentStreak()}
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

          {/* Exercise Chart */}
          {progressData.length > 0 && (
            <Card variant="elevated" className="mb-6">
              <Text className="text-lg font-inter-bold text-earie-black mb-4">
                Daily Exercise Activity
              </Text>
              <View className="flex-row items-end justify-between mb-4">
                {getExerciseChart()}
              </View>
              <Text className="text-royal-palm font-inter text-center text-sm">
                Exercises completed per day (last 7 days)
              </Text>
            </Card>
          )}

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
                    
                    return (
                      <View key={achievement.id} className="bg-flaxseed rounded-xl p-4 flex-1 min-w-[45%] max-w-[48%] items-center">
                        <View className="w-16 h-16 mb-3 items-center justify-center">
                          <Image 
                            source={achievement.badgeImage}
                            style={{
                              width: 64,
                              height: 64,
                              maxWidth: 64,
                              maxHeight: 64
                            }}
                            resizeMode="contain"
                          />
                        </View>
                        <Text className="font-inter-bold text-earie-black text-center mb-1 text-sm">
                          {achievement.title}
                        </Text>
                        <Text className="text-royal-palm font-inter text-xs text-center mb-2 leading-tight">
                          {achievement.description}
                        </Text>
                        <View 
                          className="px-2 py-1 rounded-full"
                          style={{ backgroundColor: `${categoryColors[achievement.category]}20` }}
                        >
                          <Text 
                            className="font-inter text-xs"
                            style={{ color: categoryColors[achievement.category] }}
                          >
                            +{achievement.points} pts
                          </Text>
                        </View>
                        <Text className="text-earie-black/60 font-inter text-xs mt-1">
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
                  {getLockedAchievements().slice(0, 4).map((achievement) => (
                    <View key={achievement.id} className="bg-blue-glass/50 rounded-xl p-4 flex-1 min-w-[45%] max-w-[48%] items-center opacity-75">
                      <View className="w-16 h-16 mb-3 items-center justify-center">
                        <Image 
                          source={achievement.badgeImage}
                          style={{
                            width: 64,
                            height: 64,
                            maxWidth: 64,
                            maxHeight: 64,
                            opacity: 0.5
                          }}
                          resizeMode="contain"
                        />
                      </View>
                      <Text className="font-inter-bold text-earie-black text-center mb-1 text-sm">
                        {achievement.title}
                      </Text>
                      <Text className="text-royal-palm font-inter text-xs text-center mb-2 leading-tight">
                        {achievement.description}
                      </Text>
                      <Text className="text-earie-black/60 font-inter text-xs text-center mb-2">
                        {achievement.requirement}
                      </Text>
                      <View 
                        className="px-2 py-1 rounded-full"
                        style={{ backgroundColor: `${categoryColors[achievement.category]}20` }}
                      >
                        <Text 
                          className="font-inter text-xs"
                          style={{ color: categoryColors[achievement.category] }}
                        >
                          +{achievement.points} pts
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Card>

          {/* Motivational Message */}
          <Card variant="flat" className="bg-turtle-indigo-50 border-turtle-indigo-200">
            <View className="flex-row items-start">
              <Text className="text-3xl mr-3">🐢</Text>
              <View className="flex-1">
                <Text className="text-turtle-indigo-700 font-inter-bold text-lg mb-2">
                  Progress Reflection from {profile?.turtle_name || 'Shelly'}
                </Text>
                <Text className="text-turtle-indigo-700 font-inter text-base leading-relaxed italic">
                  {totalExercises > 0
                    ? `"Look at all you've accomplished! ${totalExercises} exercises completed and ${achievements.length} badges earned shows your incredible dedication. Every small step forward is a victory worth celebrating. I'm so proud of your commitment to recovery!"`
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