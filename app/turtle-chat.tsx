import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Heart, MessageCircle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import TurtleCompanion from '@/components/TurtleCompanion';
import TurtleConversationAI from '@/components/TurtleConversationAI';
import { supabase } from '@/lib/supabase';

interface DailyProgress {
  exercises_completed: number;
  mood_rating: number;
}

export default function TurtleChat() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useUser();
  const [isConversationActive, setIsConversationActive] = useState(false);
  const [todayProgress, setTodayProgress] = useState<DailyProgress | null>(null);

  useEffect(() => {
    if (user) {
      fetchTodayProgress();
    }
  }, [user]);

  const fetchTodayProgress = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('daily_progress')
        .select('exercises_completed, mood_rating')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching daily progress:', error);
        return;
      }

      setTodayProgress(data || { exercises_completed: 0, mood_rating: 3 });
    } catch (error) {
      console.error('Error in fetchTodayProgress:', error);
    }
  };

  const handleStartConversation = () => {
    if (!profile) {
      Alert.alert(
        'Profile Incomplete',
        'Please complete your profile setup first to have the best conversation with your turtle companion.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Complete Profile', onPress: () => router.push('/(tabs)/profile') }
        ]
      );
      return;
    }
    setIsConversationActive(true);
  };

  const handleEndConversation = () => {
    setIsConversationActive(false);
  };

  const getMoodDescription = (rating: number) => {
    const moods = {
      1: 'having a tough day',
      2: 'feeling challenged',
      3: 'doing okay',
      4: 'feeling positive',
      5: 'having a wonderful day'
    };
    return moods[rating as keyof typeof moods] || 'uncertain';
  };

  if (isConversationActive) {
    return (
      <SafeAreaView className="flex-1 bg-chalk" edges={['top', 'left', 'right']}>
        <View className="flex-1">
          {/* Header */}
          <View className="px-6 pt-4 bg-chalk border-b border-turtle-teal-300">
            <View className="flex-row items-start">
              <TouchableOpacity
                onPress={() => setIsConversationActive(false)}
                className="w-12 h-12 bg-turtle-cream-100 border border-turtle-teal-300 rounded-full items-center justify-center"
              >
                <ArrowLeft size={24} color="#1A1F16" />
              </TouchableOpacity>
              <Image
                source={require('@/assets/images/turtle/turtle-wave-right.png')}
                className="w-36 h-44 mr-3 "
                resizeMode="contain"
              />
              <View className="flex-1 mt-6">
                <Text className="text-lg font-inter-bold text-earie-black">
                  Chatting with {profile?.turtle_name || 'Shelly'}
                </Text>
                <Text className="text-royal-palm font-inter text-sm">
                  Your AI companion is listening...
                </Text>
              </View>
            </View>
          </View>

          {/* Conversational AI Component */}
          <View className="flex-1 bg-turtle-cream-50">
            <TurtleConversationAI
              dom={{ 
                style: { 
                  flex: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%'
                } 
              }}
              patientName={profile?.patient_name || 'friend'}
              mobilityLevel={profile?.mobility_level || 5}
              recoveryGoals={profile?.recovery_goals || []}
              strokeType={profile?.stroke_type || 'unknown'}
              currentMood={getMoodDescription(todayProgress?.mood_rating || 3)}
              todaysExercises={todayProgress?.exercises_completed || 0}
              onEndConversation={handleEndConversation}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-chalk" edges={['top', 'left', 'right']}>
      <ScrollView className="flex-1 px-6 py-8">
        {/* Header */}
        <View className="flex-row items-center mb-8">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-12 h-12 bg-turtle-cream-100 border border-turtle-teal-300 rounded-full items-center justify-center mr-4"
          >
            <ArrowLeft size={24} color="#1A1F16" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-inter-bold text-earie-black">
              Chat with {profile?.turtle_name || 'Shelly'}
            </Text>
            <Text className="text-royal-palm font-inter">
              Your AI-powered recovery companion
            </Text>
          </View>
        </View>

        {/* Turtle Display */}
        <View className="items-center mb-8">
          <TurtleCompanion
            size={180}
            mood="speech"
            message={`Hello ${profile?.patient_name || 'friend'}! I'm ready to chat about your recovery journey, exercises, mood, or anything else on your mind. How can I help you today?`}
            showMessage={true}
            animate={true}
            className="mb-6"
          />
        </View>

        {/* Information Card */}
        <View
          className="bg-turtle-cream-100 border border-turtle-teal-300 rounded-2xl p-6 mb-8 shadow-lg shadow-turtle-teal-300/50">
          <View className="flex-row items-center mb-4">
            <Heart size={24} color="#418D84" />
            <Text className="text-lg font-inter-bold text-earie-black ml-3">
              Conversational AI Companion
            </Text>
          </View>
          <Text className="text-earie-black font-inter mb-4 leading-relaxed">
            Your turtle companion uses advanced AI to have natural conversations about your recovery.
            It can help with:
          </Text>
          <View className="gap-2">
            <Text className="text-royal-palm font-inter">• Exercise recommendations and motivation</Text>
            <Text className="text-royal-palm font-inter">• Mood check-ins and emotional support</Text>
            <Text className="text-royal-palm font-inter">• Recovery progress discussions</Text>
            <Text className="text-royal-palm font-inter">• General wellness conversations</Text>
          </View>
        </View>

        {/* Context Information */}
        {profile && (
          <View className="bg-blue-glass border border-royal-palm rounded-2xl p-4 mb-8">
            <Text className="text-royal-palm font-inter-bold mb-3">
              🤖 AI Context Information
            </Text>
            <View className="gap-1">
              <Text className="text-earie-black font-inter text-sm">
                Name: {profile.patient_name}
              </Text>
              <Text className="text-earie-black font-inter text-sm">
                Mobility Level: {profile.mobility_level}/10
              </Text>
              <Text className="text-earie-black font-inter text-sm">
                Recovery Goals: {profile.recovery_goals?.join(', ') || 'Not specified'}
              </Text>
              <Text className="text-earie-black font-inter text-sm">
                Today's Mood: {getMoodDescription(todayProgress?.mood_rating || 3)}
              </Text>
              <Text className="text-earie-black font-inter text-sm">
                Exercises Today: {todayProgress?.exercises_completed || 0}
              </Text>
            </View>
          </View>
        )}

        {/* Start Conversation Button */}
        <TouchableOpacity
          onPress={handleStartConversation}
          className="bg-royal-palm py-4 px-8 rounded-2xl shadow-lg flex-row items-center justify-center"
        >
          <MessageCircle size={24} color="#F6F4F1" />
          <Text className="text-chalk text-lg font-inter-bold ml-3">
            Start Voice Chat
          </Text>
        </TouchableOpacity>

        {/* Privacy Note */}
        <View
          className="bg-turtle-indigo-100 border border-turtle-indigo-200 rounded-xl p-4 mt-6 mb-12">
          <Text className="text-turtle-indigo-700 font-inter-bold text-sm mb-2">
            🔒 Privacy & Security
          </Text>
          <Text className="text-turtle-indigo-700 font-inter text-xs leading-relaxed">
            Your conversations are processed securely by ElevenLabs' AI. No personal health information
            is stored beyond this session. Microphone access is only used during active conversations.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}