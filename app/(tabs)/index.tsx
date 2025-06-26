import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Calendar, Heart, Target, TrendingUp, Smile, Frown, Meh, BookOpen } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import TurtleAvatar from '@/components/TurtleAvatar';
import TurtleIntroduction from '@/components/TurtleIntroduction';
import { supabase } from '@/lib/supabase';

interface DailyProgress {
  date: string;
  exercises_completed: number;
  mood_rating: number;
  notes?: string;
}

const moodIcons = [
  { rating: 1, icon: Frown, color: '#EF4444', label: 'Struggling' },
  { rating: 2, icon: Frown, color: '#F97316', label: 'Difficult' },
  { rating: 3, icon: Meh, color: '#F59E0B', label: 'Okay' },
  { rating: 4, icon: Smile, color: '#10B981', label: 'Good' },
  { rating: 5, icon: Smile, color: '#14B8A6', label: 'Great' }
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
    fetchTodayProgress();
    calculateStreak();
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

    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('daily_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    if (data) {
      setTodayProgress(data);
      setSelectedMood(data.mood_rating);
    }
  };

  const calculateStreak = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('daily_progress')
      .select('date')
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
      
      if (progressDate.toDateString() === expectedDate.toDateString()) {
        currentStreak++;
      } else {
        break;
      }
    }

    setStreak(currentStreak);
  };

  const updateMood = async (rating: number) => {
    if (!user) return;

    setSelectedMood(rating);
    
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase
      .from('daily_progress')
      .upsert({
        user_id: user.id,
        date: today,
        mood_rating: rating,
        exercises_completed: todayProgress?.exercises_completed || 0
      });

    if (error) {
      Alert.alert('Error', 'Failed to save mood. Please try again.');
    } else {
      fetchTodayProgress();
    }
  };

  const getTurtleMood = () => {
    if (!selectedMood) return 'welcoming';
    if (selectedMood >= 4) return 'happy';
    if (selectedMood >= 3) return 'encouraging';
    return 'concerned';
  };

  const getTurtleMessage = () => {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    
    if (!selectedMood) {
      return `${timeGreeting}! How are you feeling today?`;
    }
    
    switch (selectedMood) {
      case 5:
        return "Wonderful! Your positive energy makes my shell sparkle!";
      case 4:
        return "That's great to hear! Let's keep this good momentum going!";
      case 3:
        return "Every day doesn't have to be perfect. You're doing just fine!";
      case 2:
        return "I understand today is challenging. Let's take it slow together.";
      case 1:
        return "I'm here with you through the tough times. You're not alone.";
      default:
        return `${timeGreeting}! Ready for another day of gentle progress?`;
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
    <SafeAreaView className="flex-1 bg-turtle-cream">
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Header with Turtle */}
        <View className="items-center py-6">
          <TouchableOpacity 
            onPress={() => setShowTurtleChat(true)}
            className="items-center"
          >
            <TurtleAvatar size={120} mood={getTurtleMood()} />
            <Text className="text-xl font-inter-bold text-turtle-slate mt-4">
              Hello, {user?.email?.split('@')[0]}!
            </Text>
          </TouchableOpacity>
          <View className="bg-white px-6 py-4 rounded-2xl mt-4 shadow-sm border border-turtle-teal/10">
            <Text className="text-turtle-slate font-inter text-center">
              {getTurtleMessage()}
            </Text>
          </View>
          <Text className="text-turtle-slate/50 font-inter text-xs mt-2 text-center">
            Tap me to chat anytime! 🐢
          </Text>
        </View>

        {/* Mood Check-in */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-turtle-teal/10">
          <Text className="text-lg font-inter-bold text-turtle-slate mb-4">
            How are you feeling today?
          </Text>
          <View className="flex-row justify-between">
            {moodIcons.map(({ rating, icon: Icon, color, label }) => (
              <TouchableOpacity
                key={rating}
                onPress={() => updateMood(rating)}
                className={`items-center p-3 rounded-xl ${
                  selectedMood === rating ? 'bg-turtle-teal/10' : ''
                }`}
              >
                <Icon 
                  size={32} 
                  color={selectedMood === rating ? '#14B8A6' : color}
                />
                <Text className={`text-xs font-inter mt-1 ${
                  selectedMood === rating ? 'text-turtle-teal' : 'text-turtle-slate/70'
                }`}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Today's Progress */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-turtle-teal/10">
          <Text className="text-lg font-inter-bold text-turtle-slate mb-4">
            Today's Progress
          </Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <View className="w-12 h-12 bg-turtle-teal/10 rounded-xl items-center justify-center mb-2">
                <Target size={24} color="#14B8A6" />
              </View>
              <Text className="text-2xl font-inter-bold text-turtle-slate">
                {todayProgress?.exercises_completed || 0}
              </Text>
              <Text className="text-turtle-slate/70 font-inter text-sm">Exercises</Text>
            </View>
            
            <View className="items-center">
              <View className="w-12 h-12 bg-turtle-amber/10 rounded-xl items-center justify-center mb-2">
                <TrendingUp size={24} color="#F59E0B" />
              </View>
              <Text className="text-2xl font-inter-bold text-turtle-slate">{streak}</Text>
              <Text className="text-turtle-slate/70 font-inter text-sm">Day Streak</Text>
            </View>
            
            <View className="items-center">
              <View className="w-12 h-12 bg-turtle-green/10 rounded-xl items-center justify-center mb-2">
                <Heart size={24} color="#10B981" />
              </View>
              <Text className="text-2xl font-inter-bold text-turtle-slate">
                {selectedMood ? moodIcons.find(m => m.rating === selectedMood)?.label : '-'}
              </Text>
              <Text className="text-turtle-slate/70 font-inter text-sm">Mood</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="space-y-4 mb-8">
          <Text className="text-lg font-inter-bold text-turtle-slate">
            Quick Actions
          </Text>
          
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/exercises')}
            className="bg-turtle-teal p-6 rounded-2xl shadow-lg flex-row items-center justify-between"
          >
            <View>
              <Text className="text-white text-lg font-inter-bold">Start Exercise</Text>
              <Text className="text-white/80 font-inter">
                Gentle movements for today
              </Text>
            </View>
            <Target size={32} color="white" />
          </TouchableOpacity>

          <View className="flex-row space-x-4">
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/learn')}
              className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-turtle-teal/10 flex-row items-center"
            >
              <View className="w-10 h-10 bg-turtle-amber/10 rounded-lg items-center justify-center mr-3">
                <BookOpen size={20} color="#F59E0B" />
              </View>
              <View>
                <Text className="text-turtle-slate font-inter-semibold">Learn</Text>
                <Text className="text-turtle-slate/70 font-inter text-sm">Recovery tips</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(tabs)/progress')}
              className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-turtle-teal/10 flex-row items-center"
            >
              <View className="w-10 h-10 bg-turtle-green/10 rounded-lg items-center justify-center mr-3">
                <Calendar size={20} color="#10B981" />
              </View>
              <View>
                <Text className="text-turtle-slate font-inter-semibold">Progress</Text>
                <Text className="text-turtle-slate/70 font-inter text-sm">Your journey</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}