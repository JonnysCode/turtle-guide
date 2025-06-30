import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
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
      className={`flex-row items-center py-4 ${type === 'button' ? 'bg-black/5 rounded-lg my-0.5' : ''}`}
      disabled={type !== 'button'}
    >
      <View className="w-10 h-10 bg-blue-glass rounded-lg items-center justify-center mr-4">
        <Icon size={20} color="#418D84" />
      </View>
      <View className="flex-1">
        <Text className="text-earie-black font-inter-semibold">{title}</Text>
        {description && (
          <Text className="text-royal-palm font-inter text-sm">{description}</Text>
        )}
        {type === 'info' && typeof value === 'string' && (
          <Text className="text-earie-black/80 font-inter text-sm">{value}</Text>
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
    <SafeAreaView className="flex-1 bg-chalk" edges={['top', 'left', 'right']}>
      <ScrollView 
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="py-6">
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-12 h-12 bg-turtle-cream-100 border border-turtle-teal-300 rounded-3xl items-center justify-center mr-4"
            >
              <ArrowLeft size={24} color="#1A1F16" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-inter-bold text-earie-black">
                App Preferences
              </Text>
              <Text className="text-royal-palm font-inter">
                Customize your app experience
              </Text>
            </View>
          </View>

          {/* Turtle Companion */}
          <View className="items-center mb-6">
            <TurtleCompanion
              size={120}
              mood="writing"
              message="Let's customize the app to work perfectly for you! Your comfort and preferences are what matter most."
              showMessage={false}
              animate={true}
            />
          </View>

          {/* Notifications & Alerts */}
          <View className="bg-turtle-cream-100 border border-turtle-teal-300 rounded-2xl p-6 mb-6 shadow-lg shadow-turtle-teal-300/50">
            <Text className="text-lg font-inter-bold text-earie-black mb-4">
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
          <View className="bg-turtle-cream-100 border border-turtle-teal-300 rounded-2xl p-6 mb-6 shadow-lg shadow-turtle-teal-300/50">
            <Text className="text-lg font-inter-bold text-earie-black mb-4">
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
          <View className="bg-turtle-cream-100 border border-turtle-teal-300 rounded-2xl p-6 mb-6 shadow-lg shadow-turtle-teal-300/50">
            <Text className="text-lg font-inter-bold text-earie-black mb-4">
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
          <View className="bg-turtle-cream-100 border border-turtle-teal-300 rounded-2xl p-6 mb-6 shadow-lg shadow-turtle-teal-300/50">
            <Text className="text-lg font-inter-bold text-earie-black mb-4">
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
          <View className="bg-blue-50 border border-blue-300 rounded-3xl p-4 mt-4">
            <View className="flex-row items-start">
              <Text className="text-2xl mr-3">🐢</Text>
              <View className="flex-1">
                <Text className="text-blue-800 font-inter-bold text-lg mb-2">
                  Tip from {profile?.turtle_name || 'Shelly'}
                </Text>
                <Text className="text-blue-800 font-inter text-base leading-6 italic">
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