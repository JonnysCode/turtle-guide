import React, { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  LocationEdit as Edit3,
  Mail,
  MapPin,
  Phone,
  Plus,
  Star,
  Trash2,
  User,
  X
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import TurtleCompanion from '@/components/TurtleCompanion';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { supabase } from '@/lib/supabase';

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone_number: string;
  phone_number_2?: string;
  email?: string;
  address?: string;
  is_primary: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

const relationshipOptions = [
  'Spouse/Partner',
  'Child',
  'Parent',
  'Sibling',
  'Other Family',
  'Friend',
  'Neighbor',
  'Doctor',
  'Nurse',
  'Caregiver',
  'Other'
];

export default function EmergencyContacts() {
  const router = useRouter();
  const { user } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phone_number: '',
    phone_number_2: '',
    email: '',
    address: '',
    is_primary: false,
    notes: ''
  });

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  const fetchContacts = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching emergency contacts:', error);
    } else {
      setContacts(data || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: '',
      phone_number: '',
      phone_number_2: '',
      email: '',
      address: '',
      is_primary: false,
      notes: ''
    });
    setEditingContact(null);
  };

  const startEdit = (contact: EmergencyContact) => {
    setFormData({
      name: contact.name,
      relationship: contact.relationship,
      phone_number: contact.phone_number,
      phone_number_2: contact.phone_number_2 || '',
      email: contact.email || '',
      address: contact.address || '',
      is_primary: contact.is_primary,
      notes: contact.notes || ''
    });
    setEditingContact(contact);
    setShowAddForm(true);
  };

  const saveContact = async () => {
    if (!user || !formData.name.trim() || !formData.relationship || !formData.phone_number.trim()) {
      Alert.alert('Error', 'Please fill in name, relationship, and phone number');
      return;
    }

    try {
      const contactData = {
        user_id: user.id,
        name: formData.name.trim(),
        relationship: formData.relationship,
        phone_number: formData.phone_number.trim(),
        phone_number_2: formData.phone_number_2.trim() || null,
        email: formData.email.trim() || null,
        address: formData.address.trim() || null,
        is_primary: formData.is_primary,
        notes: formData.notes.trim() || null,
        updated_at: new Date().toISOString()
      };

      let error;
      if (editingContact) {
        // Update existing contact
        const { error: updateError } = await supabase
          .from('emergency_contacts')
          .update(contactData)
          .eq('id', editingContact.id);
        error = updateError;
      } else {
        // Add new contact
        const { error: insertError } = await supabase
          .from('emergency_contacts')
          .insert(contactData);
        error = insertError;
      }

      if (error) {
        Alert.alert('Error', 'Failed to save emergency contact');
        return;
      }

      resetForm();
      setShowAddForm(false);
      fetchContacts();
    } catch (error) {
      console.error('Error saving emergency contact:', error);
      Alert.alert('Error', 'Failed to save emergency contact');
    }
  };

  const deleteContact = async (contactId: string) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('emergency_contacts')
              .delete()
              .eq('id', contactId);

            if (error) {
              Alert.alert('Error', 'Failed to delete contact');
            } else {
              fetchContacts();
            }
          }
        }
      ]
    );
  };

  const makePhoneCall = (phoneNumber: string) => {
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Phone calls are not supported on this device');
        }
      })
      .catch((error) => {
        console.error('Error making phone call:', error);
        Alert.alert('Error', 'Failed to make phone call');
      });
  };

  const sendEmail = (email: string) => {
    const url = `mailto:${email}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Email is not supported on this device');
        }
      })
      .catch((error) => {
        console.error('Error sending email:', error);
        Alert.alert('Error', 'Failed to open email');
      });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-chalk" edges={['top', 'left', 'right']}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-earie-black font-inter text-lg">Loading contacts...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
              className="w-12 h-12 bg-turtle-cream-100 border border-turtle-teal-300 rounded-full items-center justify-center mr-4"
            >
              <ArrowLeft size={24} color="#1A1F16" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-inter-bold text-earie-black">
                Emergency Contacts
              </Text>
              <Text className="text-royal-palm font-inter">
                Important people to contact in emergencies
              </Text>
            </View>
          </View>

          {/* Turtle Companion */}
          <View className="items-center mb-6">
            <TurtleCompanion
              size={120}
              mood="questioning"
              message="Having emergency contacts readily available gives you and your loved ones peace of mind. Let's make sure your important people are just a tap away!"
              showMessage={false}
              animate={true}
            />
          </View>

          {/* Emergency Services */}
          <Card variant="elevated" className="mb-6 bg-red-50 border-red-300">
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 bg-red-500 rounded-full items-center justify-center mr-4">
                <Phone size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-red-800 font-inter-bold text-lg">
                  🚨 Emergency Services
                </Text>
                <Text className="text-red-700 font-inter">
                  For immediate medical emergencies
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => makePhoneCall('911')}
              className="bg-red-600 py-4 rounded-xl shadow-lg"
            >
              <Text className="text-white font-inter-bold text-center text-xl">
                Call 911
              </Text>
            </TouchableOpacity>
          </Card>

          {/* Personal Emergency Contacts */}
          <Card variant="elevated" className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-inter-bold text-earie-black">
                Personal Emergency Contacts
              </Text>
              <TouchableOpacity
                onPress={() => {
                  resetForm();
                  setShowAddForm(true);
                }}
                className="bg-royal-palm w-10 h-10 rounded-full items-center justify-center"
              >
                <Plus size={20} color="white" />
              </TouchableOpacity>
            </View>

            {contacts.length === 0 ? (
              <View className="items-center py-8">
                <User size={48} color="#B8DCDC" />
                <Text className="text-royal-palm font-inter text-center mt-4 mb-2">
                  No emergency contacts added yet
                </Text>
                <Text className="text-earie-black/60 font-inter text-center text-sm">
                  Add family, friends, or medical professionals
                </Text>
              </View>
            ) : (
              <View className="gap-4">
                {contacts.map((contact) => (
                  <View key={contact.id} className="bg-flaxseed rounded-xl p-4">
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1">
                        <View className="flex-row items-center mb-2">
                          <Text className="font-inter-bold text-earie-black text-lg">
                            {contact.name}
                          </Text>
                          {contact.is_primary && (
                            <View className="ml-2 bg-royal-palm px-2 py-1 rounded-full flex-row items-center">
                              <Star size={12} color="white" />
                              <Text className="text-white font-inter-bold text-xs ml-1">
                                PRIMARY
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-royal-palm font-inter mb-1">
                          {contact.relationship}
                        </Text>
                      </View>

                      <View className="flex-row gap-2">
                        <TouchableOpacity
                          onPress={() => startEdit(contact)}
                          className="w-8 h-8 bg-blue-glass rounded-full items-center justify-center"
                        >
                          <Edit3 size={16} color="#418D84" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => deleteContact(contact.id)}
                          className="w-8 h-8 bg-red-100 rounded-full items-center justify-center"
                        >
                          <Trash2 size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Contact Actions */}
                    <View className="gap-2">
                      <TouchableOpacity
                        onPress={() => makePhoneCall(contact.phone_number)}
                        className="bg-royal-palm py-3 rounded-lg flex-row items-center justify-center"
                      >
                        <Phone size={18} color="white" />
                        <Text className="text-white font-inter-semibold ml-2">
                          Call {contact.phone_number}
                        </Text>
                      </TouchableOpacity>

                      {contact.phone_number_2 && (
                        <TouchableOpacity
                          onPress={() => makePhoneCall(contact.phone_number_2!)}
                          className="bg-tropical-indigo py-3 rounded-lg flex-row items-center justify-center"
                        >
                          <Phone size={18} color="white" />
                          <Text className="text-white font-inter-semibold ml-2">
                            Call {contact.phone_number_2} (Alt)
                          </Text>
                        </TouchableOpacity>
                      )}

                      {contact.email && (
                        <TouchableOpacity
                          onPress={() => sendEmail(contact.email!)}
                          className="bg-blue-glass py-2 rounded-lg flex-row items-center justify-center"
                        >
                          <Mail size={16} color="#418D84" />
                          <Text className="text-royal-palm font-inter-semibold ml-2">
                            {contact.email}
                          </Text>
                        </TouchableOpacity>
                      )}

                      {contact.address && (
                        <View className="bg-turtle-cream-200 py-2 px-3 rounded-lg flex-row items-start">
                          <MapPin size={16} color="#418D84" />
                          <Text className="text-royal-palm font-inter ml-2 flex-1">
                            {contact.address}
                          </Text>
                        </View>
                      )}

                      {contact.notes && (
                        <View className="bg-turtle-cream-200 py-2 px-3 rounded-lg">
                          <Text className="text-earie-black/80 font-inter text-sm italic">
                            "{contact.notes}"
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Card>

          {/* Add/Edit Contact Form */}
          {showAddForm && (
            <Card variant="elevated" className="mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-inter-bold text-earie-black">
                  {editingContact ? 'Edit Contact' : 'Add Emergency Contact'}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                  className="w-8 h-8 items-center justify-center"
                >
                  <X size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View className="gap-4">
                <Input
                  label="Full Name *"
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  placeholder="Enter full name"
                />

                <View>
                  <Text className="text-earie-black font-inter-semibold mb-2">
                    Relationship *
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {relationshipOptions.map((relationship) => (
                      <TouchableOpacity
                        key={relationship}
                        onPress={() => setFormData(prev => ({ ...prev, relationship }))}
                        className={`px-3 py-2 rounded-lg border ${
                          formData.relationship === relationship
                            ? 'bg-royal-palm border-royal-palm'
                            : 'bg-turtle-cream-100 border-turtle-teal-300'
                        }`}
                      >
                        <Text className={`font-inter text-sm ${
                          formData.relationship === relationship ? 'text-chalk' : 'text-earie-black'
                        }`}>
                          {relationship}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <Input
                  label="Primary Phone Number *"
                  value={formData.phone_number}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, phone_number: text }))}
                  placeholder="(555) 123-4567"
                  keyboardType="phone-pad"
                />

                <Input
                  label="Secondary Phone Number"
                  value={formData.phone_number_2}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, phone_number_2: text }))}
                  placeholder="(555) 987-6543"
                  keyboardType="phone-pad"
                />

                <Input
                  label="Email Address"
                  value={formData.email}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                  placeholder="email@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Input
                  label="Address"
                  value={formData.address}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                  placeholder="123 Main St, City, State 12345"
                  multiline
                />

                <View>
                  <TouchableOpacity
                    onPress={() => setFormData(prev => ({ ...prev, is_primary: !prev.is_primary }))}
                    className={`p-4 rounded-xl border flex-row items-center ${
                      formData.is_primary
                        ? 'bg-royal-palm border-royal-palm'
                        : 'bg-turtle-cream-100 border-turtle-teal-300'
                    }`}
                  >
                    <Star
                      size={20}
                      color={formData.is_primary ? 'white' : '#418D84'}
                      fill={formData.is_primary ? 'white' : 'none'}
                    />
                    <View className="ml-3 flex-1">
                      <Text className={`font-inter-semibold ${
                        formData.is_primary ? 'text-chalk' : 'text-earie-black'
                      }`}>
                        Primary Emergency Contact
                      </Text>
                      <Text className={`font-inter text-sm ${
                        formData.is_primary ? 'text-chalk/80' : 'text-royal-palm'
                      }`}>
                        This person will be contacted first in emergencies
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                <Input
                  label="Notes"
                  value={formData.notes}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                  placeholder="Any additional information..."
                  multiline
                />

                <Button
                  onPress={saveContact}
                  variant="primary"
                  size="lg"
                  className="mt-2"
                >
                  {editingContact ? 'Update Contact' : 'Add Contact'}
                </Button>
              </View>
            </Card>
          )}

          {/* Tips */}
          <Card variant="flat" className="bg-turtle-indigo-50 border-turtle-indigo-200">
            <View className="flex-row items-start">
              <Text className="text-3xl mr-3">🐢</Text>
              <View className="flex-1">
                <Text className="text-turtle-indigo-700 font-inter-bold text-lg mb-2">
                  Emergency Contact Tips
                </Text>
                <Text className="text-turtle-indigo-700 font-inter text-base leading-relaxed">
                  "Keep your emergency contacts updated and make sure they know they're listed. Consider adding both
                  local and distant family members, plus your medical team. Having multiple ways to reach people (phone,
                  email) is always wise!"
                </Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}