import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Activity, ChevronRight, LocationEdit as Edit3, Phone, Pill, Settings, User } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'expo-router';
import TurtleCompanion from '@/components/TurtleCompanion';

const strokeTypes = {
  ischemic: 'Ischemic Stroke',
  hemorrhagic: 'Hemorrhagic Stroke',
  tia: 'TIA (Mini-Stroke)',
  unknown: 'Not Sure'
};

const recoveryGoalLabels = {
  mobility: '🚶  Improve Mobility',
  speech: '💬  Speech Recovery',
  cognitive: '🧠  Cognitive Function',
  independence: '🏠  Daily Independence',
  social: '👥  Social Connections',
  emotional: '💝  Emotional Well-being'
};

export default function Profile() {
  const { user } = useAuth();
  const { profile } = useUser();
  const router = useRouter();

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <SafeAreaView className="flex-1 bg-chalk" edges={['top', 'left', 'right']}>
      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }} // Add padding for tab bar
      >
        <View className="py-6">
          {/* Profile Header */}
          <View className="items-center mb-8">
            <TurtleCompanion
              size={140}
              mood="writing"
              showMessage={false}
              animate={false}
              className="mb-4"
            />
            <Text className="text-2xl font-inter-bold text-earie-black mt-4">
              {profile?.patient_name || user?.email?.split('@')[0] || 'Friend'}
            </Text>
            <Text className="text-royal-palm font-inter mt-1">
              Recovery companion: {profile?.turtle_name || 'Shelly'}
            </Text>
            <Text className="text-royal-palm font-inter text-sm mt-2">
              Member since {formatDate(profile?.created_at || null)}
            </Text>
          </View>

          {/* Recovery Profile */}
          <View
            className="bg-turtle-cream-100 border border-turtle-teal-300 rounded-2xl p-6 mb-6 shadow-lg shadow-turtle-teal-300/50">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-inter-bold text-earie-black">
                Recovery Profile
              </Text>
              <TouchableOpacity className="p-2">
                <Edit3 size={20} color="#418D84" />
              </TouchableOpacity>
            </View>

            <View className="gap-4">
              <View className="flex-row justify-between">
                <Text className="text-royal-palm font-inter">Patient Name</Text>
                <Text className="text-earie-black font-inter-semibold">
                  {profile?.patient_name || 'Not specified'}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-royal-palm font-inter">Stroke Type</Text>
                <Text className="text-earie-black font-inter-semibold">
                  {profile?.stroke_type ? strokeTypes[profile.stroke_type as keyof typeof strokeTypes] : 'Not specified'}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-royal-palm font-inter">Stroke Date</Text>
                <Text className="text-earie-black font-inter-semibold">
                  {formatDate(profile?.stroke_date)}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-royal-palm font-inter">Mobility Level</Text>
                <Text className="text-earie-black font-inter-semibold">
                  {profile?.mobility_level || 'Not set'}/10
                </Text>
              </View>

              {profile?.recovery_goals && profile.recovery_goals.length > 0 && (
                <View>
                  <Text className="text-royal-palm font-inter mb-2">Recovery Goals</Text>
                  <View className="flex-row flex-wrap">
                    {profile.recovery_goals.map((goal) => (
                      <View key={goal} className="bg-blue-glass px-3 py-1 rounded-full mr-2 mb-2">
                        <Text className="text-royal-palm font-inter text-sm">
                          {recoveryGoalLabels[goal as keyof typeof recoveryGoalLabels] || goal}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Health & Wellness Tools */}
          <View
            className="bg-turtle-cream-100 border border-turtle-teal-300 rounded-2xl p-6 mb-6 shadow-lg shadow-turtle-teal-300/50">
            <Text className="text-lg font-inter-bold text-earie-black mb-4">
              Health & Wellness Tools
            </Text>

            <TouchableOpacity
              onPress={() => router.push('/profile/medication-reminders')}
              className="flex-row items-center py-4 border-b border-turtle-cream-300/70"
            >
              <View className="w-10 h-10 bg-tropical-indigo/10 rounded-lg items-center justify-center mr-4">
                <Pill size={20} color="#9381FF" />
              </View>
              <View className="flex-1">
                <Text className="text-earie-black font-inter-semibold">Medication Reminders</Text>
                <Text className="text-royal-palm font-inter text-sm">
                  Set up daily medication alerts and track adherence
                </Text>
              </View>
              <ChevronRight size={20} color="#418D84" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/profile/health-tracking')}
              className="flex-row items-center py-4"
            >
              <View className="w-10 h-10 bg-blue-glass rounded-lg items-center justify-center mr-4">
                <Activity size={20} color="#418D84" />
              </View>
              <View className="flex-1">
                <Text className="text-earie-black font-inter-semibold">Health Tracking</Text>
                <Text className="text-royal-palm font-inter text-sm">
                  Log vital signs, symptoms, and health metrics
                </Text>
              </View>
              <ChevronRight size={20} color="#418D84" />
            </TouchableOpacity>
          </View>

          {/* Emergency & Support */}
          <View
            className="bg-turtle-cream-100 border border-turtle-teal-300 rounded-2xl p-6 mb-6 shadow-lg shadow-turtle-teal-300/50">
            <Text className="text-lg font-inter-bold text-earie-black mb-4">
              Emergency & Support
            </Text>

            <TouchableOpacity
              onPress={() => router.push('/profile/emergency-contacts')}
              className="flex-row items-center py-4"
            >
              <View className="w-10 h-10 bg-red-100 rounded-lg items-center justify-center mr-4">
                <Phone size={20} color="#EF4444" />
              </View>
              <View className="flex-1">
                <Text className="text-earie-black font-inter-semibold">Emergency Contacts</Text>
                <Text className="text-royal-palm font-inter text-sm">
                  Manage family, friends, and medical team contacts
                </Text>
              </View>
              <ChevronRight size={20} color="#418D84" />
            </TouchableOpacity>
          </View>

          {/* App Settings */}
          <View
            className="bg-turtle-cream-100 border border-turtle-teal-300 rounded-2xl p-6 mb-6 shadow-lg shadow-turtle-teal-300/50">
            <Text className="text-lg font-inter-bold text-earie-black mb-4">
              App Settings
            </Text>

            <TouchableOpacity
              onPress={() => router.push('/profile/preferences')}
              className="flex-row items-center py-4 border-b border-turtle-cream-300/70"
            >
              <Settings size={20} color="#418D84" />
              <View className="flex-1 ml-4">
                <Text className="text-earie-black font-inter-semibold">Preferences</Text>
                <Text className="text-royal-palm font-inter text-sm">
                  Customize your app experience
                </Text>
              </View>
              <ChevronRight size={20} color="#418D84" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/profile/account-settings')}
              className="flex-row items-center py-4"
            >
              <User size={20} color="#418D84" />
              <View className="flex-1 ml-4">
                <Text className="text-earie-black font-inter-semibold">Account Settings</Text>
                <Text className="text-royal-palm font-inter text-sm">
                  Manage your account details
                </Text>
              </View>
              <ChevronRight size={20} color="#418D84" />
            </TouchableOpacity>
          </View>

          {/* Powered by Section */}
          <View
            className="bg-turtle-cream-100 border border-turtle-teal-300 rounded-2xl p-6 mb-6 shadow-lg shadow-turtle-teal-300/50">
            <Text className="text-lg font-inter-bold text-earie-black mb-4 text-center">
              Powered by
            </Text>
            <View className="flex-row flex-wrap justify-center items-center" style={{ gap: 12 }}>
              <View className="bg-turtle-teal-500 rounded-xl" style={{
                padding: 12,
                minWidth: 120,
                alignItems: 'center'
              }}>
                <Image
                  source={require('@/assets/images/partners/anthropic.png')}
                  style={{
                    width: 84,
                    height: 36
                  }}
                  resizeMode="contain"
                />
              </View>
              <View className="bg-turtle-teal-500 rounded-xl" style={{
                padding: 12,
                minWidth: 120,
                alignItems: 'center'
              }}>
                <Image
                  source={require('@/assets/images/partners/bolt-powered.png')}
                  style={{
                    width: 84,
                    height: 36
                  }}
                  resizeMode="contain"
                />
              </View>
              <View className="bg-turtle-teal-500 rounded-xl" style={{
                padding: 12,
                minWidth: 120,
                alignItems: 'center'
              }}>
                <Image
                  source={require('@/assets/images/partners/elevenlabs.png')}
                  style={{
                    width: 84,
                    height: 36
                  }}
                  resizeMode="contain"
                />
              </View>
              <View className="bg-turtle-teal-500 rounded-xl" style={{
                padding: 12,
                minWidth: 120,
                alignItems: 'center'
              }}>
                <Image
                  source={require('@/assets/images/partners/netlify.png')}
                  style={{
                    width: 84,
                    height: 36
                  }}
                  resizeMode="contain"
                />
              </View>
              <View className="bg-turtle-teal-500 rounded-xl" style={{
                padding: 12,
                minWidth: 120,
                alignItems: 'center'
              }}>
                <Image
                  source={require('@/assets/images/partners/supabase.png')}
                  style={{
                    width: 84,
                    height: 36
                  }}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>

          {/* Turtle Message */}
          <View
            className="bg-turtle-indigo-50 border border-turtle-indigo-400 rounded-3xl px-6 py-4 mt-4">
            <View className="flex-row items-start mb-2">
              <View className="flex-1">
                <Text className="text-turtle-indigo-700 font-inter-bold text-lg ml-1">
                  🐢 From {profile?.turtle_name || 'Shelly'}
                </Text>
              </View>
            </View>
            <Text
              className="text-turtle-indigo-700 font-inter text-base leading-relaxed italic">
              "I'm so grateful to be part of your recovery journey, {profile?.patient_name || 'my friend'}! Remember,
              every day you show up and try is a day worth celebrating. Keep being amazing!"
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
