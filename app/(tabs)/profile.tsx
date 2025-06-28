import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, Heart, Phone, LogOut, LocationEdit as Edit3, Calendar } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'expo-router';
import TurtleAvatar from '@/components/TurtleAvatar';

const strokeTypes = {
  ischemic: 'Ischemic Stroke',
  hemorrhagic: 'Hemorrhagic Stroke',
  tia: 'TIA (Mini-Stroke)',
  unknown: 'Not Sure'
};

const recoveryGoalLabels = {
  mobility: '🚶 Improve Mobility',
  speech: '💬 Speech Recovery',
  cognitive: '🧠 Cognitive Function',
  independence: '🏠 Daily Independence',
  social: '👥 Social Connections',
  emotional: '💝 Emotional Well-being'
};

export default function Profile() {
  const { user, signOut } = useAuth();
  const { profile } = useUser();
  const router = useRouter();
  const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/welcome');
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <SafeAreaView className="flex-1 bg-turtle-cream">
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="py-6">
          {/* Profile Header */}
          <View className="items-center mb-8">
            <TurtleAvatar size={120} mood="happy" />
            <Text className="text-2xl font-inter-bold text-turtle-slate mt-4">
              {profile?.patient_name || user?.email?.split('@')[0] || 'Friend'}
            </Text>
            <Text className="text-turtle-slate/70 font-inter mt-1">
              Recovery companion: {profile?.turtle_name || 'Shelly'}
            </Text>
            <Text className="text-turtle-slate/50 font-inter text-sm mt-2">
              Member since {formatDate(profile?.created_at || null)}
            </Text>
          </View>

          {/* Recovery Profile */}
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-turtle-teal/10">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-inter-bold text-turtle-slate">
                Recovery Profile
              </Text>
              <TouchableOpacity className="p-2">
                <Edit3 size={20} color="#14B8A6" />
              </TouchableOpacity>
            </View>

            <View className="space-y-4">
              <View className="flex-row justify-between">
                <Text className="text-turtle-slate/70 font-inter">Patient Name</Text>
                <Text className="text-turtle-slate font-inter-semibold">
                  {profile?.patient_name || 'Not specified'}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-turtle-slate/70 font-inter">Stroke Type</Text>
                <Text className="text-turtle-slate font-inter-semibold">
                  {profile?.stroke_type ? strokeTypes[profile.stroke_type as keyof typeof strokeTypes] : 'Not specified'}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-turtle-slate/70 font-inter">Stroke Date</Text>
                <Text className="text-turtle-slate font-inter-semibold">
                  {formatDate(profile?.stroke_date)}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-turtle-slate/70 font-inter">Mobility Level</Text>
                <Text className="text-turtle-slate font-inter-semibold">
                  {profile?.mobility_level || 'Not set'}/10
                </Text>
              </View>

              {profile?.recovery_goals && profile.recovery_goals.length > 0 && (
                <View>
                  <Text className="text-turtle-slate/70 font-inter mb-2">Recovery Goals</Text>
                  <View className="flex-row flex-wrap">
                    {profile.recovery_goals.map((goal) => (
                      <View key={goal} className="bg-turtle-teal/10 px-3 py-1 rounded-full mr-2 mb-2">
                        <Text className="text-turtle-teal font-inter text-sm">
                          {recoveryGoalLabels[goal as keyof typeof recoveryGoalLabels] || goal}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Quick Actions */}
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-turtle-teal/10">
            <Text className="text-lg font-inter-bold text-turtle-slate mb-4">
              Quick Actions
            </Text>
            
            <TouchableOpacity
              onPress={() => setShowEmergencyContacts(!showEmergencyContacts)}
              className="flex-row items-center py-4 border-b border-gray-100"
            >
              <View className="w-10 h-10 bg-red-100 rounded-lg items-center justify-center mr-4">
                <Phone size={20} color="#EF4444" />
              </View>
              <View className="flex-1">
                <Text className="text-turtle-slate font-inter-semibold">Emergency Contacts</Text>
                <Text className="text-turtle-slate/70 font-inter text-sm">
                  Quick access to important numbers
                </Text>
              </View>
            </TouchableOpacity>

            {showEmergencyContacts && (
              <View className="bg-red-50 p-4 rounded-lg mt-2 border border-red-200">
                <Text className="text-red-800 font-inter-semibold mb-2">
                  🚨 Emergency Services
                </Text>
                <TouchableOpacity className="bg-red-600 py-3 rounded-lg mb-3">
                  <Text className="text-white font-inter-bold text-center text-lg">
                    Call 911
                  </Text>
                </TouchableOpacity>
                <Text className="text-red-700 font-inter text-sm text-center">
                  For immediate medical emergencies
                </Text>
              </View>
            )}

            <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-100">
              <View className="w-10 h-10 bg-turtle-amber/10 rounded-lg items-center justify-center mr-4">
                <Calendar size={20} color="#F59E0B" />
              </View>
              <View className="flex-1">
                <Text className="text-turtle-slate font-inter-semibold">Medication Reminders</Text>
                <Text className="text-turtle-slate/70 font-inter text-sm">
                  Set up daily medication alerts
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center py-4">
              <View className="w-10 h-10 bg-turtle-green/10 rounded-lg items-center justify-center mr-4">
                <Heart size={20} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-turtle-slate font-inter-semibold">Health Tracking</Text>
                <Text className="text-turtle-slate/70 font-inter text-sm">
                  Log symptoms and vital signs
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* App Settings */}
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-turtle-teal/10">
            <Text className="text-lg font-inter-bold text-turtle-slate mb-4">
              App Settings
            </Text>
            
            <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-100">
              <Settings size={20} color="#64748B" className="mr-4" />
              <View className="flex-1">
                <Text className="text-turtle-slate font-inter-semibold">Preferences</Text>
                <Text className="text-turtle-slate/70 font-inter text-sm">
                  Customize your experience
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-100">
              <User size={20} color="#64748B" className="mr-4" />
              <View className="flex-1">
                <Text className="text-turtle-slate font-inter-semibold">Account Settings</Text>
                <Text className="text-turtle-slate/70 font-inter text-sm">
                  Manage your account details
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleSignOut}
              className="flex-row items-center py-4"
            >
              <LogOut size={20} color="#EF4444" className="mr-4" />
              <View className="flex-1">
                <Text className="text-red-600 font-inter-semibold">Sign Out</Text>
                <Text className="text-turtle-slate/70 font-inter text-sm">
                  Sign out of your account
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Turtle Message */}
          <View className="bg-turtle-teal/5 rounded-2xl p-6 border border-turtle-teal/20">
            <Text className="text-turtle-teal font-inter-semibold mb-3">
              🐢 From {profile?.turtle_name || 'Shelly'}
            </Text>
            <Text className="text-turtle-slate/70 font-inter">
              "I'm so grateful to be part of your recovery journey, {profile?.patient_name || 'my friend'}! Remember, every day you show up and try is a day worth celebrating. Keep being amazing!"
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}