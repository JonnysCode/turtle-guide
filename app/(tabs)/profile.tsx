import React, { useState } from 'react';
import { Alert, Platform, ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Heart, LocationEdit as Edit3, Phone, Settings, User, Activity, Pill, ChevronRight } from 'lucide-react-native';
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
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <TurtleCompanion
              size={140}
              mood="writing"
              showMessage={false}
              animate={false}
              className="mb-4"
            />
            <Text style={styles.profileName}>
              {profile?.patient_name || user?.email?.split('@')[0] || 'Friend'}
            </Text>
            <Text style={styles.profileSubtitle}>
              Recovery companion: {profile?.turtle_name || 'Shelly'}
            </Text>
            <Text style={styles.profileMemberSince}>
              Member since {formatDate(profile?.created_at || null)}
            </Text>
          </View>

          {/* Recovery Profile */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Recovery Profile
              </Text>
              <TouchableOpacity style={styles.editButton}>
                <Edit3 size={20} color="#418D84" />
              </TouchableOpacity>
            </View>

            <View style={styles.profileDetails}>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Patient Name</Text>
                <Text style={styles.profileValue}>
                  {profile?.patient_name || 'Not specified'}
                </Text>
              </View>

              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Stroke Type</Text>
                <Text style={styles.profileValue}>
                  {profile?.stroke_type ? strokeTypes[profile.stroke_type as keyof typeof strokeTypes] : 'Not specified'}
                </Text>
              </View>

              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Stroke Date</Text>
                <Text style={styles.profileValue}>
                  {formatDate(profile?.stroke_date)}
                </Text>
              </View>

              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Mobility Level</Text>
                <Text style={styles.profileValue}>
                  {profile?.mobility_level || 'Not set'}/10
                </Text>
              </View>

              {profile?.recovery_goals && profile.recovery_goals.length > 0 && (
                <View style={styles.goalsContainer}>
                  <Text style={styles.profileLabel}>Recovery Goals</Text>
                  <View style={styles.goalsList}>
                    {profile.recovery_goals.map((goal) => (
                      <View key={goal} style={styles.goalTag}>
                        <Text style={styles.goalText}>
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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Health & Wellness Tools
            </Text>

            <TouchableOpacity
              onPress={() => router.push('/medication-reminders')}
              style={styles.toolRow}
            >
              <View style={styles.toolIcon}>
                <Pill size={20} color="#9381FF" />
              </View>
              <View style={styles.toolContent}>
                <Text style={styles.toolTitle}>Medication Reminders</Text>
                <Text style={styles.toolDescription}>
                  Set up daily medication alerts and track adherence
                </Text>
              </View>
              <ChevronRight size={20} color="#418D84" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/health-tracking')}
              style={styles.toolRow}
            >
              <View style={styles.toolIconBlue}>
                <Activity size={20} color="#418D84" />
              </View>
              <View style={styles.toolContent}>
                <Text style={styles.toolTitle}>Health Tracking</Text>
                <Text style={styles.toolDescription}>
                  Log vital signs, symptoms, and health metrics
                </Text>
              </View>
              <ChevronRight size={20} color="#418D84" />
            </TouchableOpacity>
          </View>

          {/* Emergency & Support */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Emergency & Support
            </Text>

            <TouchableOpacity
              onPress={() => router.push('/emergency-contacts')}
              style={styles.toolRow}
            >
              <View style={styles.toolIconRed}>
                <Phone size={20} color="#EF4444" />
              </View>
              <View style={styles.toolContent}>
                <Text style={styles.toolTitle}>Emergency Contacts</Text>
                <Text style={styles.toolDescription}>
                  Manage family, friends, and medical team contacts
                </Text>
              </View>
              <ChevronRight size={20} color="#418D84" />
            </TouchableOpacity>
          </View>

          {/* App Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              App Settings
            </Text>

            <TouchableOpacity 
              onPress={() => router.push('/preferences')}
              style={styles.toolRow}
            >
              <Settings size={20} color="#418D84" />
              <View style={styles.toolContent}>
                <Text style={styles.toolTitle}>Preferences</Text>
                <Text style={styles.toolDescription}>
                  Customize your app experience
                </Text>
              </View>
              <ChevronRight size={20} color="#418D84" />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/account-settings')}
              style={styles.toolRow}
            >
              <User size={20} color="#418D84" />
              <View style={styles.toolContent}>
                <Text style={styles.toolTitle}>Account Settings</Text>
                <Text style={styles.toolDescription}>
                  Manage your account details
                </Text>
              </View>
              <ChevronRight size={20} color="#418D84" />
            </TouchableOpacity>
          </View>

          {/* Turtle Message */}
          <View style={styles.turtleMessage}>
            <View style={styles.turtleMessageContent}>
              <Text style={styles.turtleEmoji}>🐢</Text>
              <View style={styles.turtleMessageText}>
                <Text style={styles.turtleMessageTitle}>
                  From {profile?.turtle_name || 'Shelly'}
                </Text>
                <Text style={styles.turtleMessageBody}>
                  "I'm so grateful to be part of your recovery journey, {profile?.patient_name || 'my friend'}! Remember,
                  every day you show up and try is a day worth celebrating. Keep being amazing!"
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F4F1',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  content: {
    paddingVertical: 24,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1F16',
    marginTop: 16,
    fontFamily: 'Inter-Bold',
  },
  profileSubtitle: {
    color: '#418D84',
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  profileMemberSince: {
    color: '#418D84',
    fontSize: 14,
    marginTop: 8,
    fontFamily: 'Inter-Regular',
  },
  section: {
    backgroundColor: '#FEF7ED',
    borderWidth: 1,
    borderColor: '#14B8A6',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1F16',
    fontFamily: 'Inter-Bold',
  },
  editButton: {
    padding: 8,
  },
  profileDetails: {
    gap: 16,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profileLabel: {
    color: '#418D84',
    fontFamily: 'Inter-Regular',
  },
  profileValue: {
    color: '#1A1F16',
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  goalsContainer: {
    marginTop: 8,
  },
  goalsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  goalTag: {
    backgroundColor: '#B8DCDC',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  goalText: {
    color: '#418D84',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 184, 166, 0.1)',
  },
  toolIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(147, 129, 255, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  toolIconBlue: {
    width: 40,
    height: 40,
    backgroundColor: '#B8DCDC',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  toolIconRed: {
    width: 40,
    height: 40,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  toolContent: {
    flex: 1,
  },
  toolTitle: {
    color: '#1A1F16',
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  toolDescription: {
    color: '#418D84',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  turtleMessage: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#93C5FD',
    borderRadius: 24,
    padding: 16,
    marginTop: 16,
  },
  turtleMessageContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  turtleEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  turtleMessageText: {
    flex: 1,
  },
  turtleMessageTitle: {
    color: '#1E40AF',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
  },
  turtleMessageBody: {
    color: '#1E40AF',
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
    fontFamily: 'Inter-Regular',
  },
});