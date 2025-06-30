import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, Calendar, CircleCheck as CheckCircle, Clock, Plus, Pill, X } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import TurtleCompanion from '@/components/TurtleCompanion';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { supabase } from '@/lib/supabase';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  start_date: string;
  end_date?: string;
  notes?: string;
  is_active: boolean;
}

interface MedicationLog {
  id: string;
  medication_id: string;
  scheduled_time: string;
  taken_at?: string;
  status: 'pending' | 'taken' | 'missed' | 'skipped';
  medication: Medication;
}

const frequencyOptions = [
  { value: 'daily', label: 'Once Daily', times: ['08:00'] },
  { value: 'twice_daily', label: 'Twice Daily', times: ['08:00', '20:00'] },
  { value: 'three_times_daily', label: 'Three Times Daily', times: ['08:00', '14:00', '20:00'] },
  { value: 'four_times_daily', label: 'Four Times Daily', times: ['08:00', '12:00', '16:00', '20:00'] },
  { value: 'weekly', label: 'Weekly', times: ['08:00'] },
  { value: 'as_needed', label: 'As Needed', times: [] }
];

export default function MedicationReminders() {
  const router = useRouter();
  const { user } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [todayLogs, setTodayLogs] = useState<MedicationLog[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'daily',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      fetchMedications();
      fetchTodayLogs();
    }
  }, [user]);

  const fetchMedications = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching medications:', error);
    } else {
      setMedications(data || []);
    }
    setLoading(false);
  };

  const fetchTodayLogs = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('medication_logs')
      .select(`
        *,
        medication:medications(*)
      `)
      .eq('user_id', user.id)
      .gte('scheduled_time', today)
      .lt('scheduled_time', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('scheduled_time', { ascending: true });

    if (error) {
      console.error('Error fetching today logs:', error);
    } else {
      setTodayLogs(data || []);
    }
  };

  const addMedication = async () => {
    if (!user || !formData.name.trim() || !formData.dosage.trim()) {
      Alert.alert('Error', 'Please fill in medication name and dosage');
      return;
    }

    const frequencyOption = frequencyOptions.find(f => f.value === formData.frequency);
    if (!frequencyOption) return;

    try {
      const { data, error } = await supabase
        .from('medications')
        .insert({
          user_id: user.id,
          name: formData.name.trim(),
          dosage: formData.dosage.trim(),
          frequency: formData.frequency,
          times: frequencyOption.times,
          notes: formData.notes.trim() || null
        })
        .select()
        .single();

      if (error) {
        Alert.alert('Error', 'Failed to add medication');
        return;
      }

      // Generate logs for today if it's a scheduled medication
      if (frequencyOption.times.length > 0) {
        await generateLogsForMedication(data);
      }

      setFormData({ name: '', dosage: '', frequency: 'daily', notes: '' });
      setShowAddForm(false);
      fetchMedications();
      fetchTodayLogs();
    } catch (error) {
      console.error('Error adding medication:', error);
      Alert.alert('Error', 'Failed to add medication');
    }
  };

  const generateLogsForMedication = async (medication: Medication) => {
    const today = new Date();
    const logs = medication.times.map(time => {
      const [hours, minutes] = time.split(':');
      const scheduledTime = new Date(today);
      scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      return {
        user_id: user!.id,
        medication_id: medication.id,
        scheduled_time: scheduledTime.toISOString(),
        status: 'pending' as const
      };
    });

    await supabase.from('medication_logs').insert(logs);
  };

  const markMedicationTaken = async (logId: string) => {
    const { error } = await supabase
      .from('medication_logs')
      .update({
        status: 'taken',
        taken_at: new Date().toISOString()
      })
      .eq('id', logId);

    if (error) {
      Alert.alert('Error', 'Failed to update medication status');
    } else {
      fetchTodayLogs();
    }
  };

  const markMedicationMissed = async (logId: string) => {
    const { error } = await supabase
      .from('medication_logs')
      .update({ status: 'missed' })
      .eq('id', logId);

    if (error) {
      Alert.alert('Error', 'Failed to update medication status');
    } else {
      fetchTodayLogs();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'taken': return '#10B981';
      case 'missed': return '#EF4444';
      case 'skipped': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'taken': return CheckCircle;
      case 'missed': return X;
      case 'skipped': return Clock;
      default: return Bell;
    }
  };

  const getAdherenceStats = () => {
    const total = todayLogs.length;
    const taken = todayLogs.filter(log => log.status === 'taken').length;
    const percentage = total > 0 ? Math.round((taken / total) * 100) : 0;
    return { taken, total, percentage };
  };

  const stats = getAdherenceStats();

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-chalk" edges={['top', 'left', 'right']}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-earie-black font-inter text-lg">Loading medications...</Text>
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
                Medication Reminders
              </Text>
              <Text className="text-royal-palm font-inter">
                Stay on track with your medications
              </Text>
            </View>
          </View>

          {/* Turtle Companion */}
          <View className="items-center mb-6">
            <TurtleCompanion
              size={120}
              mood="meditation"
              message="Taking medications consistently is an important part of your recovery journey. I'm here to help you stay on track!"
              showMessage={false}
              animate={true}
            />
          </View>

          {/* Today's Adherence */}
          {todayLogs.length > 0 && (
            <Card variant="elevated" className="mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-inter-bold text-earie-black">
                  Today's Progress
                </Text>
                <View className="bg-royal-palm px-3 py-1 rounded-full">
                  <Text className="text-chalk font-inter-semibold">
                    {stats.percentage}%
                  </Text>
                </View>
              </View>
              
              <View className="bg-blue-glass rounded-full h-3 mb-4">
                <View 
                  className="bg-royal-palm h-3 rounded-full"
                  style={{ width: `${stats.percentage}%` }}
                />
              </View>
              
              <Text className="text-royal-palm font-inter text-center">
                {stats.taken} of {stats.total} medications taken today
              </Text>
            </Card>
          )}

          {/* Today's Schedule */}
          {todayLogs.length > 0 && (
            <Card variant="elevated" className="mb-6">
              <Text className="text-lg font-inter-bold text-earie-black mb-4">
                Today's Schedule
              </Text>
              
              <View className="gap-3">
                {todayLogs.map((log) => {
                  const StatusIcon = getStatusIcon(log.status);
                  const scheduledTime = new Date(log.scheduled_time);
                  
                  return (
                    <View key={log.id} className="bg-flaxseed rounded-xl p-4">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className="font-inter-bold text-earie-black text-lg">
                            {log.medication.name}
                          </Text>
                          <Text className="text-royal-palm font-inter">
                            {log.medication.dosage}
                          </Text>
                          <Text className="text-royal-palm font-inter text-sm">
                            {scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                        
                        <View className="flex-row items-center gap-3">
                          <View 
                            className="w-10 h-10 rounded-full items-center justify-center"
                            style={{ backgroundColor: getStatusColor(log.status) }}
                          >
                            <StatusIcon size={20} color="white" />
                          </View>
                          
                          {log.status === 'pending' && (
                            <View className="flex-row gap-2">
                              <TouchableOpacity
                                onPress={() => markMedicationTaken(log.id)}
                                className="bg-royal-palm px-3 py-2 rounded-lg"
                              >
                                <Text className="text-chalk font-inter-semibold text-sm">
                                  Take
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => markMedicationMissed(log.id)}
                                className="bg-gray-400 px-3 py-2 rounded-lg"
                              >
                                <Text className="text-white font-inter-semibold text-sm">
                                  Miss
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </Card>
          )}

          {/* My Medications */}
          <Card variant="elevated" className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-inter-bold text-earie-black">
                My Medications
              </Text>
              <TouchableOpacity
                onPress={() => setShowAddForm(true)}
                className="bg-royal-palm w-10 h-10 rounded-full items-center justify-center"
              >
                <Plus size={20} color="white" />
              </TouchableOpacity>
            </View>

            {medications.length === 0 ? (
              <View className="items-center py-8">
                <Pill size={48} color="#B8DCDC" />
                <Text className="text-royal-palm font-inter text-center mt-4 mb-2">
                  No medications added yet
                </Text>
                <Text className="text-earie-black/60 font-inter text-center text-sm">
                  Add your medications to get reminders and track adherence
                </Text>
              </View>
            ) : (
              <View className="gap-3">
                {medications.map((medication) => {
                  const frequencyLabel = frequencyOptions.find(f => f.value === medication.frequency)?.label;
                  
                  return (
                    <View key={medication.id} className="bg-flaxseed rounded-xl p-4">
                      <View className="flex-row items-start justify-between">
                        <View className="flex-1">
                          <Text className="font-inter-bold text-earie-black text-lg">
                            {medication.name}
                          </Text>
                          <Text className="text-royal-palm font-inter">
                            {medication.dosage}
                          </Text>
                          <Text className="text-royal-palm font-inter text-sm">
                            {frequencyLabel}
                          </Text>
                          {medication.times.length > 0 && (
                            <Text className="text-earie-black/60 font-inter text-sm mt-1">
                              Times: {medication.times.join(', ')}
                            </Text>
                          )}
                          {medication.notes && (
                            <Text className="text-earie-black/60 font-inter text-sm mt-1">
                              Notes: {medication.notes}
                            </Text>
                          )}
                        </View>
                        
                        <View className="w-10 h-10 bg-royal-palm/20 rounded-full items-center justify-center">
                          <Pill size={20} color="#418D84" />
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </Card>

          {/* Add Medication Form */}
          {showAddForm && (
            <Card variant="elevated" className="mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-inter-bold text-earie-black">
                  Add New Medication
                </Text>
                <TouchableOpacity
                  onPress={() => setShowAddForm(false)}
                  className="w-8 h-8 items-center justify-center"
                >
                  <X size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View className="gap-4">
                <Input
                  label="Medication Name"
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  placeholder="e.g., Aspirin"
                />

                <Input
                  label="Dosage"
                  value={formData.dosage}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, dosage: text }))}
                  placeholder="e.g., 81mg"
                />

                <View>
                  <Text className="text-earie-black font-inter-semibold mb-2">
                    Frequency
                  </Text>
                  <View className="gap-2">
                    {frequencyOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => setFormData(prev => ({ ...prev, frequency: option.value }))}
                        className={`p-3 rounded-xl border ${
                          formData.frequency === option.value
                            ? 'bg-royal-palm border-royal-palm'
                            : 'bg-turtle-cream-100 border-turtle-teal-300'
                        }`}
                      >
                        <Text className={`font-inter ${
                          formData.frequency === option.value ? 'text-chalk' : 'text-earie-black'
                        }`}>
                          {option.label}
                        </Text>
                        {option.times.length > 0 && (
                          <Text className={`font-inter text-sm ${
                            formData.frequency === option.value ? 'text-chalk/80' : 'text-royal-palm'
                          }`}>
                            Times: {option.times.join(', ')}
                          </Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <Input
                  label="Notes (Optional)"
                  value={formData.notes}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                  placeholder="Any special instructions..."
                  multiline
                />

                <Button
                  onPress={addMedication}
                  variant="primary"
                  size="lg"
                  className="mt-2"
                >
                  Add Medication
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
                  Medication Tips
                </Text>
                <Text className="text-turtle-indigo-700 font-inter text-base leading-relaxed">
                  "Taking medications consistently helps your recovery. Set up a routine, use pill organizers, and don't hesitate to ask your healthcare team if you have questions about your medications."
                </Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}