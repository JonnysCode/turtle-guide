import React, { useState } from 'react';
import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronRight, Key, LogOut, Mail, User } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import TurtleCompanion from '@/components/TurtleCompanion';
import Input from '@/components/Input';

export default function AccountSettings() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { profile } = useUser();
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

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      console.log('Account Settings: Starting sign out process...');

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
      // Even if there's an error, try to navigate
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      } else {
        router.replace('/(auth)/welcome');
      }
    } finally {
      setIsSigningOut(false);
    }
  };

  const changePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      // Show error in UI instead of Alert
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      // Show error in UI instead of Alert
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      // Show error in UI instead of Alert
      return;
    }

    try {
      // In a real app, you'd call Supabase auth.updateUser()
      // Show success message in UI
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordChange(false);
    } catch (error) {
      // Show error in UI
    }
  };

  const changeEmail = async () => {
    if (!emailForm.newEmail || !emailForm.password) {
      // Show error in UI instead of Alert
      return;
    }

    try {
      // In a real app, you'd call Supabase auth.updateUser()
      // Show success message in UI
      setEmailForm({ newEmail: '', password: '' });
      setShowEmailChange(false);
    } catch (error) {
      // Show error in UI
    }
  };

  const SettingRow = ({
                        icon: Icon,
                        title,
                        description,
                        onPress,
                        showChevron = true,
                        isDestructive = false
                      }: {
    icon: any;
    title: string;
    description?: string;
    onPress?: () => void;
    showChevron?: boolean;
    isDestructive?: boolean;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center py-3 px-4 bg-turtle-cream-200 rounded-lg my-0.5"
    >
      <View className={`w-10 h-10 rounded-lg items-center justify-center mr-4 ${
        isDestructive ? 'bg-red-500' : 'bg-blue-glass'
      }`}>
        <Icon size={20} color={isDestructive ? '#ffffff' : '#418D84'} />
      </View>
      <View className="flex-1">
        <Text className={`font-inter-semibold ${
          isDestructive ? 'text-red-500' : 'text-earie-black'
        }`}>{title}</Text>
        {description && (
          <Text className={`text-sm font-inter ${
            isDestructive ? 'text-red-400' : 'text-royal-palm'
          }`}>
            {description}
          </Text>
        )}
      </View>
      {showChevron && (
        <ChevronRight size={20} color={isDestructive ? '#EF4444' : '#418D84'} />
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
              <Text className="text-earie-black font-inter text-center leading-6">
                Are you sure you want to sign out of your account?
              </Text>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowSignOutModal(false)}
                className="flex-1 py-4 px-6 rounded-2xl border-2 border-royal-palm items-center justify-center min-h-14"
                disabled={isSigningOut}
              >
                <Text className="text-royal-palm font-inter-semibold text-lg">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSignOut}
                className="flex-1 py-4 px-6 rounded-2xl bg-red-500 items-center justify-center min-h-14"
                disabled={isSigningOut}
              >
                <Text className="text-chalk font-inter-semibold text-lg">
                  {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                </Text>
              </TouchableOpacity>
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
              <Text className="text-2xl font-inter-bold text-earie-black text-center">
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
              <TouchableOpacity
                onPress={() => {
                  setShowPasswordChange(false);
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="flex-1 py-4 px-6 rounded-2xl border-2 border-royal-palm items-center justify-center min-h-14"
              >
                <Text className="text-royal-palm font-inter-semibold text-lg">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={changePassword}
                className="flex-1 py-4 px-6 rounded-2xl bg-royal-palm items-center justify-center min-h-14"
              >
                <Text className="text-chalk font-inter-semibold text-lg">Update</Text>
              </TouchableOpacity>
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
              <Text className="text-2xl font-inter-bold text-earie-black text-center">
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
              <TouchableOpacity
                onPress={() => {
                  setShowEmailChange(false);
                  setEmailForm({ newEmail: '', password: '' });
                }}
                className="flex-1 py-4 px-6 rounded-2xl border-2 border-royal-palm items-center justify-center min-h-14"
              >
                <Text className="text-royal-palm font-inter-semibold text-lg">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={changeEmail}
                className="flex-1 py-4 px-6 rounded-2xl bg-royal-palm items-center justify-center min-h-14"
              >
                <Text className="text-chalk font-inter-semibold text-lg">Update</Text>
              </TouchableOpacity>
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
              className="w-12 h-12 bg-turtle-cream-100 border border-turtle-teal-300 rounded-3xl items-center justify-center mr-4"
            >
              <ArrowLeft size={24} color="#1A1F16" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-inter-bold text-earie-black">
                Account Settings
              </Text>
              <Text className="text-royal-palm font-inter">
                Manage your account details
              </Text>
            </View>
          </View>

          {/* Turtle Companion */}
          <View className="items-center mb-6">
            <TurtleCompanion
              size={120}
              mood="writing"
              message="Let's keep your account secure and up to date! Your privacy and security are very important to me."
              showMessage={false}
              animate={true}
            />
          </View>

          {/* Account Information */}
          <View
            className="bg-turtle-cream-100 border border-turtle-teal-300 rounded-2xl p-6 mb-6 shadow-lg shadow-turtle-teal-300/50">
            <Text className="text-lg font-inter-bold text-earie-black mb-4">
              Account Information
            </Text>

            <SettingRow
              icon={User}
              title="Profile Name"
              description={profile?.patient_name || 'Not set'}
              showChevron={false}
            />

            <SettingRow
              icon={Mail}
              title="Email Address"
              description={user?.email || 'Not available'}
              onPress={() => setShowEmailChange(true)}
            />

            <SettingRow
              icon={Key}
              title="Change Password"
              description="Update your account password"
              onPress={() => setShowPasswordChange(true)}
            />
          </View>

          {/* Account Actions */}
          <View
            className="bg-turtle-cream-100 border border-turtle-teal-300 rounded-2xl p-6 mb-6 shadow-lg shadow-turtle-teal-300/50">
            <Text className="text-lg font-inter-bold text-earie-black mb-4">
              Account Actions
            </Text>

            <SettingRow
              icon={LogOut}
              title="Sign Out"
              description="Sign out of your account"
              onPress={() => setShowSignOutModal(true)}
              isDestructive={true}
            />
          </View>

          {/* Turtle Message */}
          <View className="bg-blue-50 border border-blue-300 rounded-2xl p-4 mt-4">
            <View className="flex-row items-start">
              <Text className="text-2xl mr-3">🐢</Text>
              <View className="flex-1">
                <Text className="text-blue-800 font-inter-bold text-lg mb-2">
                  Security Tip from {profile?.turtle_name || 'Shelly'}
                </Text>
                <Text className="text-blue-800 font-inter text-base leading-6 italic">
                  "Keep your account secure by using a strong password and updating your email if needed. I'm here to
                  help protect your recovery journey data!"
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}