import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BookOpen, Calendar, Frown, Heart, Meh, Smile, Target, TrendingUp } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import TurtleCompanion from '@/components/TurtleCompanion';
import TurtleIntroduction from '@/components/TurtleIntroduction';
import { supabase } from '@/lib/supabase';
import { checkAndAwardAchievements } from '@/lib/achievementSystem';

interface DailyProgress {
  date: string;
  exercises_completed: number;
  mood_rating: number;
  notes?: string;
}

const moodIcons = [
  { rating: 1, icon: Frown, color: '#EF4444', label: 'Hard', description: 'Having a tough day' },
  { rating: 2, icon: Frown, color: '#F97316', label: 'Rough', description: 'Feeling challenged' },
  { rating: 3, icon: Meh, color: '#F59E0B', label: 'Okay', description: 'Getting by' },
  { rating: 4, icon: Smile, color: '#10B981', label: 'Good', description: 'Feeling positive' },
  { rating: 5, icon: Smile, color: '#14B8A6', label: 'Great', description: 'Having a wonderful day' }
];

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useUser();
  const [todayProgress, setTodayProgress] = useState<DailyProgress | null>(null);
  const [streak, setStreak] = useState(0);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [showTurtleChat, setShowTurtleChat] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTodayProgress();
      calculateStreak();
    }
  }, [user]);

  const handleTurtleChatComplete = async (mood: string | null) => {
    setShowTurtleChat(false);
    if (mood) {
      // Convert mood string to rating
      const moodMap: { [key: string]: number } = {
        'positive': 5,
        'hopeful': 4,
        'neutral': 3,
        'tired': 2,
        'frustrated': 1
      };
      const rating = moodMap[mood] || 3;
      await updateMood(rating);
    }
  };

  const fetchTodayProgress = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      // Handle the case where no entry exists for today (normal scenario)
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching daily progress:', error);
        return;
      }

      if (data) {
        setTodayProgress(data);
        setSelectedMood(data.mood_rating);
      } else {
        // No entry for today yet - this is normal
        setTodayProgress(null);
        setSelectedMood(null);
      }
    } catch (error) {
      console.error('Error in fetchTodayProgress:', error);
    }
  };

  const calculateStreak = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('daily_progress')
        .select('date, exercises_completed')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30);

      if (!data || data.length === 0) {
        setStreak(0);
        return;
      }

      let currentStreak = 0;
      const today = new Date();

      for (let i = 0; i < data.length; i++) {
        const progressDate = new Date(data[i].date);
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);

        if (progressDate.toDateString() === expectedDate.toDateString() &&
          data[i].exercises_completed > 0) {
          currentStreak++;
        } else {
          break;
        }
      }

      setStreak(currentStreak);
    } catch (error) {
      console.error('Error calculating streak:', error);
    }
  };

  const updateMood = async (rating: number) => {
    if (!user) return;

    try {
      setSelectedMood(rating);

      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase
        .from('daily_progress')
        .upsert({
          user_id: user.id,
          date: today,
          mood_rating: rating,
          exercises_completed: todayProgress?.exercises_completed || 0
        }, {
          onConflict: 'user_id,date'
        });

      if (error) {
        Alert.alert('Error', 'Failed to save mood. Please try again.');
        console.error('Error updating mood:', error);
      } else {
        // Check for achievements after mood update
        await checkAndAwardAchievements(user.id);
        fetchTodayProgress();
      }
    } catch (error) {
      console.error('Error in updateMood:', error);
      Alert.alert('Error', 'Failed to save mood. Please try again.');
    }
  };

  const getTurtleMood = () => {
    if (!selectedMood) return 'hi';
    if (selectedMood >= 4) return 'great';
    if (selectedMood >= 3) return 'main';
    return 'sad';
  };

  const getTurtleMessage = () => {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const patientName = profile?.patient_name || 'friend';

    if (!selectedMood) {
      return `${timeGreeting}, ${patientName}! How are you feeling today?`;
    }

    switch (selectedMood) {
      case 5:
        return `Wonderful, ${patientName}! Your positive energy makes my shell sparkle!`;
      case 4:
        return `That's great to hear, ${patientName}! Let's keep this good momentum going!`;
      case 3:
        return `Every day doesn't have to be perfect, ${patientName}. You're doing just fine!`;
      case 2:
        return `I understand today is challenging, ${patientName}. Let's take it slow together.`;
      case 1:
        return `I'm here with you through the tough times, ${patientName}. You're not alone.`;
      default:
        return `${timeGreeting}, ${patientName}! Ready for another day of gentle progress?`;
    }
  };

  if (showTurtleChat) {
    return (
      <TurtleIntroduction
        onComplete={handleTurtleChatComplete}
        isStartupScreen={false}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-chalk" edges={['top', 'left', 'right']}>
      {/* Bolt.new Badge */}
      <View className="absolute top-4 right-4 z-10 rounded-full border-2 border-turtle-indigo-500">
        <Image
          source={require('@/assets/images/bolt.png')}
          className="w-16 h-16"
          resizeMode="contain"
          style={{ height: 80, width: 80 }}
        />
      </View>

      <ScrollView
        className="flex-1 px-6 pt-16"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }} // Add padding for tab bar
      >
        {/* Header with Turtle Companion */}
        <View className="items-center py-6">
          <TurtleCompanion
            size={160}
            mood={getTurtleMood()}
            message={getTurtleMessage()}
            onTap={() => router.push('/turtle-chat')}
            showMessage={true}
            animate={true}
            className="mb-4"
          />

          <Text className="text-xl font-inter-bold text-earie-black">
            Hello, {profile?.patient_name || user?.email?.split('@')[0] || 'friend'}!
          </Text>

          <Text className="text-royal-palm font-inter text-sm mt-2 text-center">
            Tap your turtle companion for a chat! 🐢
          </Text>
        </View>

        {/* Compact Mood Check-in */}
        <View
          className="bg-turtle-cream-100 border border-turtle-teal-300 rounded-2xl p-4 mb-6 shadow-lg shadow-turtle-teal-300/50">
          <Text className="text-base font-inter-bold text-earie-black mb-3">
            How are you feeling today?
          </Text>

          {/* Compact horizontal layout for all screen sizes */}
          <View className="flex-row justify-between items-center">
            {moodIcons.map(({ rating, icon: Icon, color, label }) => (
              <TouchableOpacity
                key={rating}
                onPress={() => updateMood(rating)}
                className={`items-center flex-1 py-2 px-1 rounded-lg ${
                  selectedMood === rating ? 'bg-blue-glass' : ''
                }`}
              >
                <Icon
                  size={24}
                  color={selectedMood === rating ? '#418D84' : color}
                />
                <Text
                  className={`text-xs font-inter mt-1 text-center ${
                    selectedMood === rating ? 'text-royal-palm font-inter-semibold' : 'text-earie-black'
                  }`}
                  numberOfLines={1}
                >
                  {label}
                </Text>
                {selectedMood === rating && (
                  <View className="w-1 h-1 bg-royal-palm rounded-full mt-1" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Show selected mood description */}
          {selectedMood && (
            <Text className="text-royal-palm/80 font-inter text-sm text-center mt-2">
              {moodIcons.find(m => m.rating === selectedMood)?.description}
            </Text>
          )}
        </View>

        {/* Today's Progress */}
        <View
          className="bg-turtle-cream-100 border border-turtle-teal-300 rounded-2xl p-6 mb-6 shadow-lg shadow-turtle-teal-300/50">
          <Text className="text-lg font-inter-bold text-earie-black mb-4">
            Today's Progress
          </Text>
          <View className="flex-row justify-between items-center">
            <View className="items-center flex-1">
              <View className="w-12 h-12 bg-royal-palm rounded-xl items-center justify-center mb-2">
                <Target size={24} color="#F6F4F1" />
              </View>
              <Text className="text-2xl font-inter-bold text-earie-black">
                {todayProgress?.exercises_completed || 0}
              </Text>
              <Text className="text-royal-palm font-inter text-sm text-center leading-tight">
                Exercises
              </Text>
            </View>

            <View className="items-center flex-1">
              <View className="w-12 h-12 bg-turtle-indigo-500 rounded-xl items-center justify-center mb-2">
                <TrendingUp size={24} color="#F6F4F1" />
              </View>
              <Text className="text-2xl font-inter-bold text-earie-black">{streak}</Text>
              <Text className="text-royal-palm font-inter text-sm text-center leading-tight">
                Day Streak
              </Text>
            </View>

            <View className="items-center flex-1">
              <View className="w-12 h-12 bg-blue-glass rounded-xl items-center justify-center mb-2">
                <Heart size={24} color="#418D84" />
              </View>
              <Text className="text-2xl font-inter-bold text-earie-black">
                {selectedMood ? moodIcons.find(m => m.rating === selectedMood)?.label : '-'}
              </Text>
              <Text className="text-royal-palm font-inter text-sm text-center leading-tight">
                Mood
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="gap-4 mb-8">
          <Text className="text-lg font-inter-bold text-earie-black">
            Quick Actions
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/(tabs)/exercises')}
            className="bg-royal-palm p-6 rounded-2xl shadow-lg flex-row items-center justify-between"
          >
            <View>
              <Text className="text-chalk text-lg font-inter-bold">Start Exercise</Text>
              <Text className="text-chalk/80 font-inter">
                Gentle movements for today
              </Text>
            </View>
            <Target size={32} color="#F6F4F1" />
          </TouchableOpacity>

          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/learn')}
              className="flex-1 bg-turtle-cream-100 border border-turtle-teal-300 p-4 rounded-xl shadow-lg shadow-turtle-teal-300/50 flex-row items-center"
            >
              <View className="w-10 h-10 bg-turtle-indigo-500 rounded-lg items-center justify-center mr-3">
                <BookOpen size={20} color="#F6F4F1" />
              </View>
              <View className="flex-1">
                <Text className="text-earie-black font-inter-semibold">Learn</Text>
                <Text className="text-royal-palm font-inter text-sm">Recovery tips</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(tabs)/progress')}
              className="flex-1 bg-turtle-cream-100 border border-turtle-teal-300 p-4 rounded-xl shadow-lg shadow-turtle-teal-300/50 flex-row items-center"
            >
              <View className="w-10 h-10 bg-blue-glass rounded-lg items-center justify-center mr-3">
                <Calendar size={20} color="#418D84" />
              </View>
              <View className="flex-1">
                <Text className="text-earie-black font-inter-semibold">Progress</Text>
                <Text className="text-royal-palm font-inter text-sm">Your journey</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}