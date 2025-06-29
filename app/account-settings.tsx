import React, { useState } from 'react';
import { Platform, ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  LogOut, 
  Mail, 
  User, 
  Key,
  ChevronRight
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import TurtleCompanion from '@/components/TurtleCompanion';
import Input from '@/components/Input';
import Button from '@/components/Button';

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
      style={styles.settingRow}
    >
      <View style={[styles.iconContainer, isDestructive && styles.destructiveIcon]}>
        <Icon size={20} color={isDestructive ? "#EF4444" : "#418D84"} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, isDestructive && styles.destructiveText]}>{title}</Text>
        {description && (
          <Text style={[styles.settingDescription, isDestructive && styles.destructiveDescription]}>
            {description}
          </Text>
        )}
      </View>
      {showChevron && (
        <ChevronRight size={20} color={isDestructive ? "#EF4444" : "#418D84"} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Sign Out Confirmation Modal */}
      {showSignOutModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalContent}>
              <View style={styles.modalIcon}>
                <LogOut size={32} color="#EF4444" />
              </View>
              <Text style={styles.modalTitle}>
                Sign Out
              </Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to sign out of your account?
              </Text>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setShowSignOutModal(false)}
                style={[styles.modalButton, styles.cancelButton]}
                disabled={isSigningOut}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSignOut}
                style={[styles.modalButton, styles.signOutButton]}
                disabled={isSigningOut}
              >
                <Text style={styles.signOutButtonText}>
                  {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Password Change Modal */}
      {showPasswordChange && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalContent}>
              <View style={styles.modalIconBlue}>
                <Key size={32} color="#418D84" />
              </View>
              <Text style={styles.modalTitle}>
                Change Password
              </Text>
            </View>
            
            <View style={styles.formContainer}>
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
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => {
                  setShowPasswordChange(false);
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={changePassword}
                style={[styles.modalButton, styles.primaryButton]}
              >
                <Text style={styles.primaryButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Email Change Modal */}
      {showEmailChange && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalContent}>
              <View style={styles.modalIconBlue}>
                <Mail size={32} color="#418D84" />
              </View>
              <Text style={styles.modalTitle}>
                Change Email
              </Text>
            </View>
            
            <View style={styles.formContainer}>
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
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => {
                  setShowEmailChange(false);
                  setEmailForm({ newEmail: '', password: '' });
                }}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={changeEmail}
                style={[styles.modalButton, styles.primaryButton]}
              >
                <Text style={styles.primaryButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

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
                Account Settings
              </Text>
              <Text style={styles.headerSubtitle}>
                Manage your account details
              </Text>
            </View>
          </View>

          {/* Turtle Companion */}
          <View style={styles.turtleContainer}>
            <TurtleCompanion
              size={120}
              mood="writing"
              message="Let's keep your account secure and up to date! Your privacy and security are very important to me."
              showMessage={false}
              animate={true}
            />
          </View>

          {/* Account Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
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
          <View style={styles.turtleMessage}>
            <View style={styles.turtleMessageContent}>
              <Text style={styles.turtleEmoji}>🐢</Text>
              <View style={styles.turtleMessageText}>
                <Text style={styles.turtleMessageTitle}>
                  Security Tip from {profile?.turtle_name || 'Shelly'}
                </Text>
                <Text style={styles.turtleMessageBody}>
                  "Keep your account secure by using a strong password and updating your email if needed. I'm here to help protect your recovery journey data!"
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    backgroundColor: '#F6F4F1',
    borderRadius: 24,
    padding: 32,
    marginHorizontal: 24,
    maxWidth: 400,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  modalContent: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#FEF2F2',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalIconBlue: {
    width: 64,
    height: 64,
    backgroundColor: '#B8DCDC',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1F16',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
  },
  modalMessage: {
    color: '#1A1F16',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
  },
  formContainer: {
    gap: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#418D84',
  },
  cancelButtonText: {
    color: '#418D84',
    fontWeight: '600',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  signOutButton: {
    backgroundColor: '#EF4444',
  },
  signOutButtonText: {
    color: '#F6F4F1',
    fontWeight: '600',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  primaryButton: {
    backgroundColor: '#418D84',
  },
  primaryButtonText: {
    color: '#F6F4F1',
    fontWeight: '600',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
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
  destructiveIcon: {
    backgroundColor: '#FEF2F2',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    color: '#1A1F16',
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  settingDescription: {
    color: '#418D84',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  destructiveText: {
    color: '#EF4444',
  },
  destructiveDescription: {
    color: '#F87171',
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