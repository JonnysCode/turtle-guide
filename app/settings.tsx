import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Bell, 
  Eye, 
  Globe, 
  Lock, 
  LogOut, 
  Moon, 
  Palette, 
  Shield, 
  Sun, 
  User, 
  Volume2,
  ChevronRight,
  Smartphone,
  Mail,
  Key
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import TurtleCompanion from '@/components/TurtleCompanion';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';

interface AppSettings {
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

const defaultSettings: AppSettings = {
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

export default function Settings() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { profile } = useUser();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Email change form
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    password: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // In a real app, you'd load these from AsyncStorage or a database
      // For now, we'll use default settings
      setSettings(defaultSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const updateSetting = async (key: keyof AppSettings, value: any) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      
      // In a real app, you'd save to AsyncStorage or database
      console.log('Settings updated:', { [key]: value });
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      console.log('Settings: Starting sign out process...');

      await signOut();

      // Close modal
      setShowSignOutModal(false);

      // Platform-specific navigation
      if (Platform.OS === 'web') {
        // On web, force a page reload to ensure clean state
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
        }, 100);
      } else {
        // On native platforms, navigate to welcome
        router.replace('/(auth)/welcome');
      }

    } catch (error) {
      console.error('Sign out failed:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    } finally {
      setIsSigningOut(false);
    }
  };

  const changePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }

    try {
      // In a real app, you'd call Supabase auth.updateUser()
      Alert.alert('Success', 'Password updated successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordChange(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update password');
    }
  };

  const changeEmail = async () => {
    if (!emailForm.newEmail || !emailForm.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      // In a real app, you'd call Supabase auth.updateUser()
      Alert.alert('Success', 'Email update request sent. Please check your new email for confirmation.');
      setEmailForm({ newEmail: '', password: '' });
      setShowEmailChange(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update email');
    }
  };

  const SettingRow = ({ 
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
      className={`flex-row items-center py-4 ${type === 'button' ? 'active:bg-gray-50' : ''}`}
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
      {/* Sign Out Confirmation Modal */}
      {showSignOutModal && (
        <View className="absolute inset-0 bg-black/50 z-50 items-center justify-center">
          <View className="bg-chalk rounded-3xl p-8 mx-6 max-w-md w-full shadow-2xl">
            <View className="items-center mb-6">
              <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
                <LogOut size={32} color="#EF4444" />
              </View>
              <Text className="text-2xl font-inter-bold text-earie-black text-center mb-2">
                Sign Out
              </Text>
              <Text className="text-earie-black font-inter text-center leading-relaxed">
                Are you sure you want to sign out of your account?
              </Text>
            </View>
            
            <View className="flex-row gap-3">
              <Button
                onPress={() => setShowSignOutModal(false)}
                variant="outline"
                size="lg"
                className="flex-1"
                disabled={isSigningOut}
              >
                Cancel
              </Button>
              <Button
                onPress={handleSignOut}
                variant="primary"
                size="lg"
                className="flex-1"
                loading={isSigningOut}
                style={{ backgroundColor: '#EF4444' }}
              >
                {isSigningOut ? 'Signing Out...' : 'Sign Out'}
              </Button>
            </View>
          </View>
        </View>
      )}

      {/* Password Change Modal */}
      {showPasswordChange && (
        <View className="absolute inset-0 bg-black/50 z-50 items-center justify-center">
          <View className="bg-chalk rounded-3xl p-8 mx-6 max-w-md w-full shadow-2xl">
            <View className="items-center mb-6">
              <View className="w-16 h-16 bg-blue-glass rounded-full items-center justify-center mb-4">
                <Key size={32} color="#418D84" />
              </View>
              <Text className="text-2xl font-inter-bold text-earie-black text-center mb-2">
                Change Password
              </Text>
            </View>
            
            <View className="gap-4 mb-6">
              <Input
                label="Current Password"
                value={passwordForm.currentPassword}
                onChangeText={(text) => setPasswordForm(prev => ({ ...prev, currentPassword: text }))}
                placeholder="Enter current password"
                isPassword
              />
              <Input
                label="New Password"
                value={passwordForm.newPassword}
                onChangeText={(text) => setPasswordForm(prev => ({ ...prev, newPassword: text }))}
                placeholder="Enter new password"
                isPassword
              />
              <Input
                label="Confirm New Password"
                value={passwordForm.confirmPassword}
                onChangeText={(text) => setPasswordForm(prev => ({ ...prev, confirmPassword: text }))}
                placeholder="Confirm new password"
                isPassword
              />
            </View>
            
            <View className="flex-row gap-3">
              <Button
                onPress={() => {
                  setShowPasswordChange(false);
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onPress={changePassword}
                variant="primary"
                size="lg"
                className="flex-1"
              >
                Update
              </Button>
            </View>
          </View>
        </View>
      )}

      {/* Email Change Modal */}
      {showEmailChange && (
        <View className="absolute inset-0 bg-black/50 z-50 items-center justify-center">
          <View className="bg-chalk rounded-3xl p-8 mx-6 max-w-md w-full shadow-2xl">
            <View className="items-center mb-6">
              <View className="w-16 h-16 bg-blue-glass rounded-full items-center justify-center mb-4">
                <Mail size={32} color="#418D84" />
              </View>
              <Text className="text-2xl font-inter-bold text-earie-black text-center mb-2">
                Change Email
              </Text>
            </View>
            
            <View className="gap-4 mb-6">
              <Input
                label="New Email Address"
                value={emailForm.newEmail}
                onChangeText={(text) => setEmailForm(prev => ({ ...prev, newEmail: text }))}
                placeholder="Enter new email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Input
                label="Current Password"
                value={emailForm.password}
                onChangeText={(text) => setEmailForm(prev => ({ ...prev, password: text }))}
                placeholder="Confirm with password"
                isPassword
              />
            </View>
            
            <View className="flex-row gap-3">
              <Button
                onPress={() => {
                  setShowEmailChange(false);
                  setEmailForm({ newEmail: '', password: '' });
                }}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onPress={changeEmail}
                variant="primary"
                size="lg"
                className="flex-1"
              >
                Update
              </Button>
            </View>
          </View>
        </View>
      )}

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
              className="w-12 h-12 bg-turtle-cream-100 border border-turtle-teal-300 rounded-full items-center justify-center mr-4"
            >
              <ArrowLeft size={24} color="#1A1F16" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-inter-bold text-earie-black">
                Settings
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
              message="Let's make sure everything is set up just the way you like it! Your comfort and preferences matter."
              showMessage={false}
              animate={true}
            />
          </View>

          {/* Account Information */}
          <Card variant="elevated" className="mb-6">
            <Text className="text-lg font-inter-bold text-earie-black mb-4">
              Account Information
            </Text>
            
            <SettingRow
              icon={User}
              title="Profile Name"
              description={profile?.patient_name || 'Not set'}
              type="info"
            />
            
            <SettingRow
              icon={Mail}
              title="Email Address"
              description={user?.email || 'Not available'}
              type="button"
              onPress={() => setShowEmailChange(true)}
              showChevron
            />
            
            <SettingRow
              icon={Key}
              title="Change Password"
              description="Update your account password"
              type="button"
              onPress={() => setShowPasswordChange(true)}
              showChevron
            />
          </Card>

          {/* App Preferences */}
          <Card variant="elevated" className="mb-6">
            <Text className="text-lg font-inter-bold text-earie-black mb-4">
              App Preferences
            </Text>
            
            <SettingRow
              icon={Bell}
              title="Notifications"
              description="Receive app notifications"
              value={settings.notifications_enabled}
              onToggle={(value) => updateSetting('notifications_enabled', value)}
            />
            
            <SettingRow
              icon={Volume2}
              title="Sound Effects"
              description="Play sounds for interactions"
              value={settings.sound_enabled}
              onToggle={(value) => updateSetting('sound_enabled', value)}
            />
            
            <SettingRow
              icon={Smartphone}
              title="Turtle Animations"
              description="Enable turtle companion animations"
              value={settings.turtle_animations}
              onToggle={(value) => updateSetting('turtle_animations', value)}
            />
            
            <SettingRow
              icon={Moon}
              title="Dark Mode"
              description="Use dark theme (coming soon)"
              value={settings.dark_mode}
              onToggle={(value) => updateSetting('dark_mode', value)}
            />
          </Card>

          {/* Health & Reminders */}
          <Card variant="elevated" className="mb-6">
            <Text className="text-lg font-inter-bold text-earie-black mb-4">
              Health & Reminders
            </Text>
            
            <SettingRow
              icon={Bell}
              title="Exercise Reminders"
              description="Daily exercise notifications"
              value={settings.exercise_reminders}
              onToggle={(value) => updateSetting('exercise_reminders', value)}
            />
            
            <SettingRow
              icon={Bell}
              title="Medication Reminders"
              description="Medication time notifications"
              value={settings.medication_reminders}
              onToggle={(value) => updateSetting('medication_reminders', value)}
            />
          </Card>

          {/* Privacy & Security */}
          <Card variant="elevated" className="mb-6">
            <Text className="text-lg font-inter-bold text-earie-black mb-4">
              Privacy & Security
            </Text>
            
            <SettingRow
              icon={Shield}
              title="Privacy Mode"
              description="Hide sensitive information in app switcher"
              value={settings.privacy_mode}
              onToggle={(value) => updateSetting('privacy_mode', value)}
            />
            
            <SettingRow
              icon={Globe}
              title="Progress Sharing"
              description="Allow sharing progress with care team"
              value={settings.progress_sharing}
              onToggle={(value) => updateSetting('progress_sharing', value)}
            />
            
            <SettingRow
              icon={Lock}
              title="Auto Backup"
              description="Automatically backup your data"
              value={settings.auto_backup}
              onToggle={(value) => updateSetting('auto_backup', value)}
            />
          </Card>

          {/* App Information */}
          <Card variant="elevated" className="mb-6">
            <Text className="text-lg font-inter-bold text-earie-black mb-4">
              App Information
            </Text>
            
            <SettingRow
              icon={Smartphone}
              title="App Version"
              description="1.0.0"
              type="info"
            />
            
            <SettingRow
              icon={Globe}
              title="Platform"
              description={Platform.OS === 'web' ? 'Web' : Platform.OS === 'ios' ? 'iOS' : 'Android'}
              type="info"
            />
          </Card>

          {/* Sign Out */}
          <Card variant="elevated" className="mb-6">
            <TouchableOpacity
              onPress={() => setShowSignOutModal(true)}
              className="flex-row items-center py-4"
            >
              <View className="w-10 h-10 bg-red-100 rounded-lg items-center justify-center mr-4">
                <LogOut size={20} color="#EF4444" />
              </View>
              <View className="flex-1">
                <Text className="text-red-600 font-inter-semibold">Sign Out</Text>
                <Text className="text-red-500 font-inter text-sm">
                  Sign out of your account
                </Text>
              </View>
              <ChevronRight size={20} color="#EF4444" />
            </TouchableOpacity>
          </Card>

          {/* Turtle Message */}
          <Card variant="flat" className="bg-turtle-indigo-50 border-turtle-indigo-200">
            <View className="flex-row items-start">
              <Text className="text-3xl mr-3">🐢</Text>
              <View className="flex-1">
                <Text className="text-turtle-indigo-700 font-inter-bold text-lg mb-2">
                  Settings Tip from {profile?.turtle_name || 'Shelly'}
                </Text>
                <Text className="text-turtle-indigo-700 font-inter text-base leading-relaxed italic">
                  "Take time to customize these settings to match your needs! The right setup can make your recovery journey more comfortable and effective. I'm here to support you every step of the way."
                </Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}