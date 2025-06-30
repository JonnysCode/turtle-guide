import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Activity, Heart, Plus, TrendingUp, Weight, Thermometer, Droplets, X } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import TurtleCompanion from '@/components/TurtleCompanion';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { supabase } from '@/lib/supabase';

interface HealthMetric {
  id: string;
  metric_type: string;
  value: any;
  unit: string;
  recorded_at: string;
  notes?: string;
}

interface SymptomLog {
  id: string;
  symptom_type: string;
  severity: number;
  duration_minutes?: number;
  triggers?: string[];
  notes?: string;
  recorded_at: string;
}

const metricTypes = [
  {
    type: 'blood_pressure',
    name: 'Blood Pressure',
    icon: Heart,
    color: '#EF4444',
    unit: 'mmHg',
    fields: ['systolic', 'diastolic'],
    placeholders: ['120', '80']
  },
  {
    type: 'heart_rate',
    name: 'Heart Rate',
    icon: Activity,
    color: '#F59E0B',
    unit: 'bpm',
    fields: ['rate'],
    placeholders: ['72']
  },
  {
    type: 'weight',
    name: 'Weight',
    icon: Weight,
    color: '#8B5CF6',
    unit: 'lbs',
    fields: ['weight'],
    placeholders: ['150']
  },
  {
    type: 'temperature',
    name: 'Temperature',
    icon: Thermometer,
    color: '#EC4899',
    unit: '°F',
    fields: ['temp'],
    placeholders: ['98.6']
  },
  {
    type: 'blood_sugar',
    name: 'Blood Sugar',
    icon: Droplets,
    color: '#10B981',
    unit: 'mg/dL',
    fields: ['glucose'],
    placeholders: ['100']
  },
  {
    type: 'oxygen_saturation',
    name: 'Oxygen Saturation',
    icon: Activity,
    color: '#3B82F6',
    unit: '%',
    fields: ['spo2'],
    placeholders: ['98']
  }
];

const commonSymptoms = [
  'Headache', 'Fatigue', 'Dizziness', 'Nausea', 'Pain', 'Weakness',
  'Confusion', 'Speech Difficulty', 'Vision Changes', 'Balance Issues'
];

export default function HealthTracking() {
  const router = useRouter();
  const { user } = useAuth();
  const [recentMetrics, setRecentMetrics] = useState<HealthMetric[]>([]);
  const [recentSymptoms, setRecentSymptoms] = useState<SymptomLog[]>([]);
  const [showMetricForm, setShowMetricForm] = useState(false);
  const [showSymptomForm, setShowSymptomForm] = useState(false);
  const [selectedMetricType, setSelectedMetricType] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Form states
  const [metricValues, setMetricValues] = useState<{ [key: string]: string }>({});
  const [metricNotes, setMetricNotes] = useState('');
  const [symptomType, setSymptomType] = useState('');
  const [symptomSeverity, setSymptomSeverity] = useState(5);
  const [symptomNotes, setSymptomNotes] = useState('');

  useEffect(() => {
    if (user) {
      fetchRecentData();
    }
  }, [user]);

  const fetchRecentData = async () => {
    if (!user) return;

    try {
      // Fetch recent health metrics
      const { data: metricsData } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })
        .limit(10);

      // Fetch recent symptoms
      const { data: symptomsData } = await supabase
        .from('symptom_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })
        .limit(10);

      setRecentMetrics(metricsData || []);
      setRecentSymptoms(symptomsData || []);
    } catch (error) {
      console.error('Error fetching health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addHealthMetric = async () => {
    if (!user || !selectedMetricType) return;

    const metricType = metricTypes.find(m => m.type === selectedMetricType);
    if (!metricType) return;

    // Validate required fields
    const hasAllValues = metricType.fields.every(field => metricValues[field]?.trim());
    if (!hasAllValues) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      // Prepare value object based on metric type
      let value: any = {};
      metricType.fields.forEach(field => {
        value[field] = parseFloat(metricValues[field]) || 0;
      });

      const { error } = await supabase
        .from('health_metrics')
        .insert({
          user_id: user.id,
          metric_type: selectedMetricType,
          value,
          unit: metricType.unit,
          notes: metricNotes.trim() || null
        });

      if (error) {
        Alert.alert('Error', 'Failed to save health metric');
        return;
      }

      // Reset form
      setMetricValues({});
      setMetricNotes('');
      setSelectedMetricType('');
      setShowMetricForm(false);
      fetchRecentData();
    } catch (error) {
      console.error('Error adding health metric:', error);
      Alert.alert('Error', 'Failed to save health metric');
    }
  };

  const addSymptomLog = async () => {
    if (!user || !symptomType.trim()) {
      Alert.alert('Error', 'Please enter a symptom type');
      return;
    }

    try {
      const { error } = await supabase
        .from('symptom_logs')
        .insert({
          user_id: user.id,
          symptom_type: symptomType.trim(),
          severity: symptomSeverity,
          notes: symptomNotes.trim() || null
        });

      if (error) {
        Alert.alert('Error', 'Failed to save symptom log');
        return;
      }

      // Reset form
      setSymptomType('');
      setSymptomSeverity(5);
      setSymptomNotes('');
      setShowSymptomForm(false);
      fetchRecentData();
    } catch (error) {
      console.error('Error adding symptom log:', error);
      Alert.alert('Error', 'Failed to save symptom log');
    }
  };

  const formatMetricValue = (metric: HealthMetric) => {
    const metricType = metricTypes.find(m => m.type === metric.metric_type);
    if (!metricType) return '';

    if (metric.metric_type === 'blood_pressure') {
      return `${metric.value.systolic}/${metric.value.diastolic} ${metric.unit}`;
    } else if (metricType.fields.length === 1) {
      const field = metricType.fields[0];
      return `${metric.value[field]} ${metric.unit}`;
    }
    return JSON.stringify(metric.value);
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return '#10B981';
    if (severity <= 6) return '#F59E0B';
    return '#EF4444';
  };

  const getSeverityLabel = (severity: number) => {
    if (severity <= 3) return 'Mild';
    if (severity <= 6) return 'Moderate';
    return 'Severe';
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-chalk" edges={['top', 'left', 'right']}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-earie-black font-inter text-lg">Loading health data...</Text>
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
                Health Tracking
              </Text>
              <Text className="text-royal-palm font-inter">
                Monitor your vital signs and symptoms
              </Text>
            </View>
          </View>

          {/* Turtle Companion */}
          <View className="items-center mb-6">
            <TurtleCompanion
              size={120}
              mood="writing"
              message="Tracking your health helps you and your medical team understand your recovery progress. Every data point is valuable!"
              showMessage={false}
              animate={true}
            />
          </View>

          {/* Quick Actions */}
          <View className="flex-row gap-4 mb-6">
            <TouchableOpacity
              onPress={() => setShowMetricForm(true)}
              className="flex-1 bg-royal-palm p-4 rounded-2xl shadow-lg"
            >
              <View className="flex-row items-center justify-center">
                <Activity size={24} color="white" />
                <Text className="text-chalk font-inter-bold ml-2">
                  Log Vitals
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowSymptomForm(true)}
              className="flex-1 bg-tropical-indigo p-4 rounded-2xl shadow-lg"
            >
              <View className="flex-row items-center justify-center">
                <Heart size={24} color="white" />
                <Text className="text-chalk font-inter-bold ml-2">
                  Log Symptom
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Recent Health Metrics */}
          <Card variant="elevated" className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-inter-bold text-earie-black">
                Recent Vital Signs
              </Text>
              <TrendingUp size={20} color="#418D84" />
            </View>

            {recentMetrics.length === 0 ? (
              <View className="items-center py-8">
                <Activity size={48} color="#B8DCDC" />
                <Text className="text-royal-palm font-inter text-center mt-4 mb-2">
                  No vital signs recorded yet
                </Text>
                <Text className="text-earie-black/60 font-inter text-center text-sm">
                  Start tracking your health metrics
                </Text>
              </View>
            ) : (
              <View className="gap-3">
                {recentMetrics.slice(0, 5).map((metric) => {
                  const metricType = metricTypes.find(m => m.type === metric.metric_type);
                  const IconComponent = metricType?.icon || Activity;
                  const recordedDate = new Date(metric.recorded_at);
                  
                  return (
                    <View key={metric.id} className="bg-flaxseed rounded-xl p-4">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1">
                          <View 
                            className="w-10 h-10 rounded-full items-center justify-center mr-3"
                            style={{ backgroundColor: `${metricType?.color}20` }}
                          >
                            <IconComponent size={20} color={metricType?.color} />
                          </View>
                          <View className="flex-1">
                            <Text className="font-inter-bold text-earie-black">
                              {metricType?.name}
                            </Text>
                            <Text className="text-royal-palm font-inter text-lg">
                              {formatMetricValue(metric)}
                            </Text>
                            <Text className="text-earie-black/60 font-inter text-sm">
                              {recordedDate.toLocaleDateString()} at {recordedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                          </View>
                        </View>
                      </View>
                      {metric.notes && (
                        <Text className="text-earie-black/80 font-inter text-sm mt-2 italic">
                          "{metric.notes}"
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </Card>

          {/* Recent Symptoms */}
          <Card variant="elevated" className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-inter-bold text-earie-black">
                Recent Symptoms
              </Text>
              <Heart size={20} color="#418D84" />
            </View>

            {recentSymptoms.length === 0 ? (
              <View className="items-center py-8">
                <Heart size={48} color="#B8DCDC" />
                <Text className="text-royal-palm font-inter text-center mt-4 mb-2">
                  No symptoms recorded yet
                </Text>
                <Text className="text-earie-black/60 font-inter text-center text-sm">
                  Track symptoms to help your medical team
                </Text>
              </View>
            ) : (
              <View className="gap-3">
                {recentSymptoms.slice(0, 5).map((symptom) => {
                  const recordedDate = new Date(symptom.recorded_at);
                  const severityColor = getSeverityColor(symptom.severity);
                  
                  return (
                    <View key={symptom.id} className="bg-flaxseed rounded-xl p-4">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className="font-inter-bold text-earie-black text-lg">
                            {symptom.symptom_type}
                          </Text>
                          <View className="flex-row items-center mt-1">
                            <View 
                              className="px-3 py-1 rounded-full mr-3"
                              style={{ backgroundColor: severityColor }}
                            >
                              <Text className="text-white font-inter-bold text-sm">
                                {symptom.severity}/10
                              </Text>
                            </View>
                            <Text className="text-royal-palm font-inter">
                              {getSeverityLabel(symptom.severity)}
                            </Text>
                          </View>
                          <Text className="text-earie-black/60 font-inter text-sm mt-1">
                            {recordedDate.toLocaleDateString()} at {recordedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                      </View>
                      {symptom.notes && (
                        <Text className="text-earie-black/80 font-inter text-sm mt-2 italic">
                          "{symptom.notes}"
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </Card>

          {/* Add Health Metric Form */}
          {showMetricForm && (
            <Card variant="elevated" className="mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-inter-bold text-earie-black">
                  Log Vital Signs
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowMetricForm(false);
                    setSelectedMetricType('');
                    setMetricValues({});
                    setMetricNotes('');
                  }}
                  className="w-8 h-8 items-center justify-center"
                >
                  <X size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {!selectedMetricType ? (
                <View className="gap-3">
                  <Text className="text-earie-black font-inter-semibold mb-2">
                    Select Metric Type
                  </Text>
                  {metricTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <TouchableOpacity
                        key={type.type}
                        onPress={() => setSelectedMetricType(type.type)}
                        className="bg-flaxseed rounded-xl p-4 flex-row items-center"
                      >
                        <View 
                          className="w-10 h-10 rounded-full items-center justify-center mr-3"
                          style={{ backgroundColor: `${type.color}20` }}
                        >
                          <IconComponent size={20} color={type.color} />
                        </View>
                        <Text className="font-inter-semibold text-earie-black">
                          {type.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <View className="gap-4">
                  {(() => {
                    const metricType = metricTypes.find(m => m.type === selectedMetricType);
                    if (!metricType) return null;

                    return (
                      <>
                        <View className="flex-row items-center mb-4">
                          <View 
                            className="w-10 h-10 rounded-full items-center justify-center mr-3"
                            style={{ backgroundColor: `${metricType.color}20` }}
                          >
                            <metricType.icon size={20} color={metricType.color} />
                          </View>
                          <Text className="font-inter-bold text-earie-black text-lg">
                            {metricType.name}
                          </Text>
                        </View>

                        {metricType.fields.map((field, index) => (
                          <Input
                            key={field}
                            label={field.charAt(0).toUpperCase() + field.slice(1)}
                            value={metricValues[field] || ''}
                            onChangeText={(text) => setMetricValues(prev => ({ ...prev, [field]: text }))}
                            placeholder={metricType.placeholders[index]}
                            keyboardType="numeric"
                          />
                        ))}

                        <Input
                          label="Notes (Optional)"
                          value={metricNotes}
                          onChangeText={setMetricNotes}
                          placeholder="Any additional observations..."
                          multiline
                        />

                        <View className="flex-row gap-3">
                          <Button
                            onPress={() => {
                              setSelectedMetricType('');
                              setMetricValues({});
                            }}
                            variant="outline"
                            size="md"
                            className="flex-1"
                          >
                            Back
                          </Button>
                          <Button
                            onPress={addHealthMetric}
                            variant="primary"
                            size="md"
                            className="flex-1"
                          >
                            Save
                          </Button>
                        </View>
                      </>
                    );
                  })()}
                </View>
              )}
            </Card>
          )}

          {/* Add Symptom Form */}
          {showSymptomForm && (
            <Card variant="elevated" className="mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-inter-bold text-earie-black">
                  Log Symptom
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowSymptomForm(false);
                    setSymptomType('');
                    setSymptomSeverity(5);
                    setSymptomNotes('');
                  }}
                  className="w-8 h-8 items-center justify-center"
                >
                  <X size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View className="gap-4">
                <View>
                  <Text className="text-earie-black font-inter-semibold mb-2">
                    Symptom Type
                  </Text>
                  <Input
                    value={symptomType}
                    onChangeText={setSymptomType}
                    placeholder="Enter symptom (e.g., Headache)"
                  />
                  <View className="flex-row flex-wrap gap-2 mt-2">
                    {commonSymptoms.map((symptom) => (
                      <TouchableOpacity
                        key={symptom}
                        onPress={() => setSymptomType(symptom)}
                        className="bg-blue-glass px-3 py-1 rounded-full"
                      >
                        <Text className="text-royal-palm font-inter text-sm">
                          {symptom}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View>
                  <Text className="text-earie-black font-inter-semibold mb-2">
                    Severity (1-10)
                  </Text>
                  <View className="bg-flaxseed rounded-xl p-4">
                    <Text className="text-center text-3xl font-inter-bold text-royal-palm mb-4">
                      {symptomSeverity}
                    </Text>
                    <View className="flex-row justify-between items-center mb-4">
                      <Text className="text-earie-black font-inter text-sm">
                        Mild
                      </Text>
                      <Text className="text-earie-black font-inter text-sm">
                        Severe
                      </Text>
                    </View>
                    <View className="flex-row">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                        <TouchableOpacity
                          key={level}
                          onPress={() => setSymptomSeverity(level)}
                          className={`flex-1 mx-1 h-8 rounded ${
                            level <= symptomSeverity ? 'bg-royal-palm' : 'bg-blue-glass'
                          }`}
                        />
                      ))}
                    </View>
                  </View>
                </View>

                <Input
                  label="Notes (Optional)"
                  value={symptomNotes}
                  onChangeText={setSymptomNotes}
                  placeholder="Describe the symptom, triggers, or other details..."
                  multiline
                />

                <Button
                  onPress={addSymptomLog}
                  variant="primary"
                  size="lg"
                  className="mt-2"
                >
                  Save Symptom
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
                  Health Tracking Tips
                </Text>
                <Text className="text-turtle-indigo-700 font-inter text-base leading-relaxed">
                  "Regular health tracking helps you and your medical team spot patterns and adjust treatments. Take measurements at consistent times, and don't forget to bring this data to your appointments!"
                </Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}