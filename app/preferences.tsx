import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, Switch, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Bell, 
  Globe, 
  Lock, 
  Moon, 
  Palette, 
  Shield, 
  Sun, 
  Volume2,
  ChevronRight,
  Smartphone
} from 'lucide-react-native';
import { useUser } from '@/contexts/UserContext';
import TurtleCompanion from '@/components/TurtleCompanion';

interface AppPreferences {
  notifications_enabled: boolean;
  sound_enabled: boolean;
  dark_mode: boolean;
  language: string;
  privacy_mode: boolean;
  auto_backup: boolean;
  turtle_animations: boolean;
  exercise_reminders: boolean;
  medication_reminders: boolean;
  progress_sharing: boolean;
}

const defaultPreferences: AppPreferences = {
  notifications_enabled: true,
  sound_enabled: true,
  dark_mode: false,
  language: 'en',
  privacy_mode: false,
  auto_backup: true,
  turtle_animations: true,
  exercise_reminders: true,
  medication_reminders: true,
  progress_sharing: false
};

export default function Preferences() {
  const router = useRouter();
  const { profile } = useUser();
  const [preferences, setPreferences] = useState<AppPreferences>(defaultPreferences);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      // In a real app, you'd load these from AsyncStorage or a database
      // For now, we'll use default preferences
      setPreferences(defaultPreferences);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const updatePreference = async (key: keyof AppPreferences, value: any) => {
    try {
      const newPreferences = { ...preferences, [key]: value };
      setPreferences(newPreferences);
      
      // In a real app, you'd save to AsyncStorage or database
      console.log('Preferences updated:', { [key]: value });
    } catch (error) {
      console.error('Error updating preference:', error);
    }
  };

  const PreferenceRow = ({ 
    icon: Icon, 
    title, 
    description, 
    value, 
    onToggle, 
    type = 'switch',
    onPress,
    showChevron = false
  }: {
    icon: any;
    title: string;
    description?: string;
    value?: boolean | string;
    onToggle?: (value: boolean) => void;
    type?: 'switch' | 'button' | 'info';
    onPress?: () => void;
    showChevron?: boolean;
  }) => (
    <TouchableOpacity
      onPress={type === 'button' ? onPress : undefined}
      style={[styles.preferenceRow, type === 'button' && styles.buttonRow]}
      disabled={type !== 'button'}
    >
      <View style={styles.iconContainer}>
        <Icon size={20} color="#418D84" />
      </View>
      <View style={styles.preferenceContent}>
        <Text style={styles.preferenceTitle}>{title}</Text>
        {description && (
          <Text style={styles.preferenceDescription}>{description}</Text>
        )}
        {type === 'info' && typeof value === 'string' && (
          <Text style={styles.preferenceValue}>{value}</Text>
        )}
      </View>
      {type === 'switch' && onToggle && (
        <Switch
          value={value as boolean}
          onValueChange={onToggle}
          trackColor={{ false: '#B8DCDC', true: '#418D84' }}
          thumbColor={value ? '#F6F4F1' : '#F6F4F1'}
        />
      )}
      {showChevron && (
        <ChevronRight size={20} color="#418D84" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color="#1A1F16" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>
                App Preferences
              </Text>
              <Text style={styles.headerSubtitle}>
                Customize your app experience
              </Text>
            </View>
          </View>

          {/* Turtle Companion */}
          <View style={styles.turtleContainer}>
            <TurtleCompanion
              size={120}
              mood="writing"
              message="Let's customize the app to work perfectly for you! Your comfort and preferences are what matter most."
              showMessage={false}
              animate={true}
            />
          </View>

          {/* Notifications & Alerts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Notifications & Alerts
            </Text>
            
            <PreferenceRow
              icon={Bell}
              title="Push Notifications"
              description="Receive app notifications"
              value={preferences.notifications_enabled}
              onToggle={(value) => updatePreference('notifications_enabled', value)}
            />
            
            <PreferenceRow
              icon={Bell}
              title="Exercise Reminders"
              description="Daily exercise notifications"
              value={preferences.exercise_reminders}
              onToggle={(value) => updatePreference('exercise_reminders', value)}
            />
            
            <PreferenceRow
              icon={Bell}
              title="Medication Reminders"
              description="Medication time notifications"
              value={preferences.medication_reminders}
              onToggle={(value) => updatePreference('medication_reminders', value)}
            />
          </View>

          {/* App Experience */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              App Experience
            </Text>
            
            <PreferenceRow
              icon={Volume2}
              title="Sound Effects"
              description="Play sounds for interactions"
              value={preferences.sound_enabled}
              onToggle={(value) => updatePreference('sound_enabled', value)}
            />
            
            <PreferenceRow
              icon={Smartphone}
              title="Turtle Animations"
              description="Enable turtle companion animations"
              value={preferences.turtle_animations}
              onToggle={(value) => updatePreference('turtle_animations', value)}
            />
            
            <PreferenceRow
              icon={Moon}
              title="Dark Mode"
              description="Use dark theme (coming soon)"
              value={preferences.dark_mode}
              onToggle={(value) => updatePreference('dark_mode', value)}
            />
          </View>

          {/* Privacy & Data */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Privacy & Data
            </Text>
            
            <PreferenceRow
              icon={Shield}
              title="Privacy Mode"
              description="Hide sensitive information in app switcher"
              value={preferences.privacy_mode}
              onToggle={(value) => updatePreference('privacy_mode', value)}
            />
            
            <PreferenceRow
              icon={Globe}
              title="Progress Sharing"
              description="Allow sharing progress with care team"
              value={preferences.progress_sharing}
              onToggle={(value) => updatePreference('progress_sharing', value)}
            />
            
            <PreferenceRow
              icon={Lock}
              title="Auto Backup"
              description="Automatically backup your data"
              value={preferences.auto_backup}
              onToggle={(value) => updatePreference('auto_backup', value)}
            />
          </View>

          {/* App Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              App Information
            </Text>
            
            <PreferenceRow
              icon={Smartphone}
              title="App Version"
              description="1.0.0"
              type="info"
            />
            
            <PreferenceRow
              icon={Globe}
              title="Platform"
              description={Platform.OS === 'web' ? 'Web' : Platform.OS === 'ios' ? 'iOS' : 'Android'}
              type="info"
            />
          </View>

          {/* Turtle Message */}
          <View style={styles.turtleMessage}>
            <View style={styles.turtleMessageContent}>
              <Text style={styles.turtleEmoji}>🐢</Text>
              <View style={styles.turtleMessageText}>
                <Text style={styles.turtleMessageTitle}>
                  Tip from {profile?.turtle_name || 'Shelly'}
                </Text>
                <Text style={styles.turtleMessageBody}>
                  "These settings help make your recovery journey more comfortable and effective. Don't hesitate to adjust them as your needs change!"
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 48,
    height: 48,
    backgroundColor: '#FEF7ED',
    borderWidth: 1,
    borderColor: '#14B8A6',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1F16',
    fontFamily: 'Inter-Bold',
  },
  headerSubtitle: {
    color: '#418D84',
    fontFamily: 'Inter-Regular',
  },
  turtleContainer: {
    alignItems: 'center',
    marginBottom: 24,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1F16',
    marginBottom: 16,
    fontFamily: 'Inter-Bold',
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  buttonRow: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
    marginVertical: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#B8DCDC',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  preferenceContent: {
    flex: 1,
  },
  preferenceTitle: {
    color: '#1A1F16',
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  preferenceDescription: {
    color: '#418D84',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  preferenceValue: {
    color: '#1A1F16',
    fontSize: 14,
    opacity: 0.8,
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