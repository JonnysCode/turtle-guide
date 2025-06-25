import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { useUser } from '@/contexts/UserContext';
import TurtleAvatar from '@/components/TurtleAvatar';

const strokeTypes = [
  { id: 'ischemic', name: 'Ischemic Stroke', description: 'Caused by blocked blood flow' },
  { id: 'hemorrhagic', name: 'Hemorrhagic Stroke', description: 'Caused by bleeding in the brain' },
  { id: 'tia', name: 'TIA (Mini-Stroke)', description: 'Temporary blockage of blood flow' },
  { id: 'unknown', name: 'Not Sure', description: 'I\'ll learn more with my medical team' }
];

const recoveryGoals = [
  { id: 'mobility', name: 'Improve Mobility', icon: '🚶' },
  { id: 'speech', name: 'Speech Recovery', icon: '💬' },
  { id: 'cognitive', name: 'Cognitive Function', icon: '🧠' },
  { id: 'independence', name: 'Daily Independence', icon: '🏠' },
  { id: 'social', name: 'Social Connections', icon: '👥' },
  { id: 'emotional', name: 'Emotional Well-being', icon: '💝' }
];

export default function Onboarding() {
  const router = useRouter();
  const { updateProfile } = useUser();
  const [step, setStep] = useState(1);
  const [strokeType, setStrokeType] = useState('');
  const [strokeDate, setStrokeDate] = useState('');
  const [mobilityLevel, setMobilityLevel] = useState(5);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [turtleName, setTurtleName] = useState('Shelly');
  const [loading, setLoading] = useState(false);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleComplete = async () => {
    if (!strokeType) {
      Alert.alert('Please select your stroke type or "Not Sure"');
      return;
    }

    if (selectedGoals.length === 0) {
      Alert.alert('Please select at least one recovery goal');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        stroke_type: strokeType,
        stroke_date: strokeDate || null,
        mobility_level: mobilityLevel,
        recovery_goals: selectedGoals,
        turtle_name: turtleName
      });
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <View className="flex-1">
            <View className="items-center mb-8">
              <TurtleAvatar size={100} mood="welcoming" />
              <Text className="text-2xl font-inter-bold text-turtle-slate mt-4 text-center">
                Let's Get to Know Each Other
              </Text>
              <Text className="text-turtle-slate/70 font-inter mt-2 text-center">
                What type of stroke brought us together?
              </Text>
            </View>

            <View className="space-y-3">
              {strokeTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => setStrokeType(type.id)}
                  className={`p-4 rounded-xl border ${
                    strokeType === type.id 
                      ? 'bg-turtle-teal border-turtle-teal' 
                      : 'bg-white border-turtle-teal/20'
                  }`}
                >
                  <Text className={`font-inter-semibold text-lg ${
                    strokeType === type.id ? 'text-white' : 'text-turtle-slate'
                  }`}>
                    {type.name}
                  </Text>
                  <Text className={`font-inter text-sm ${
                    strokeType === type.id ? 'text-white/80' : 'text-turtle-slate/70'
                  }`}>
                    {type.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 2:
        return (
          <View className="flex-1">
            <View className="items-center mb-8">
              <TurtleAvatar size={100} mood="encouraging" />
              <Text className="text-2xl font-inter-bold text-turtle-slate mt-4 text-center">
                Your Mobility Level
              </Text>
              <Text className="text-turtle-slate/70 font-inter mt-2 text-center">
                Help me understand where you are today (1-10 scale)
              </Text>
            </View>

            <View className="bg-white p-6 rounded-xl border border-turtle-teal/20">
              <Text className="text-center text-3xl font-inter-bold text-turtle-teal mb-4">
                {mobilityLevel}
              </Text>
              
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-turtle-slate/70 font-inter text-sm">
                  Need help with most activities
                </Text>
                <Text className="text-turtle-slate/70 font-inter text-sm">
                  Very independent
                </Text>
              </View>

              <View className="flex-row">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                  <TouchableOpacity
                    key={level}
                    onPress={() => setMobilityLevel(level)}
                    className={`flex-1 mx-1 h-8 rounded ${
                      level <= mobilityLevel ? 'bg-turtle-teal' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </View>
            </View>

            <Text className="text-turtle-slate/60 font-inter text-sm text-center mt-4">
              Don't worry - this helps me personalize your exercises and we can adjust anytime!
            </Text>
          </View>
        );

      case 3:
        return (
          <View className="flex-1">
            <View className="items-center mb-8">
              <TurtleAvatar size={100} mood="thinking" />
              <Text className="text-2xl font-inter-bold text-turtle-slate mt-4 text-center">
                What Are Your Goals?
              </Text>
              <Text className="text-turtle-slate/70 font-inter mt-2 text-center">
                Select what matters most to you (choose multiple)
              </Text>
            </View>

            <View className="grid grid-cols-2 gap-3">
              {recoveryGoals.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  onPress={() => toggleGoal(goal.id)}
                  className={`p-4 rounded-xl border ${
                    selectedGoals.includes(goal.id)
                      ? 'bg-turtle-teal border-turtle-teal'
                      : 'bg-white border-turtle-teal/20'
                  }`}
                >
                  <Text className="text-2xl mb-2">{goal.icon}</Text>
                  <Text className={`font-inter-semibold ${
                    selectedGoals.includes(goal.id) ? 'text-white' : 'text-turtle-slate'
                  }`}>
                    {goal.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 4:
        return (
          <View className="flex-1">
            <View className="items-center mb-8">
              <TurtleAvatar size={120} mood="happy" />
              <Text className="text-2xl font-inter-bold text-turtle-slate mt-4 text-center">
                Perfect! I'm {turtleName}
              </Text>
              <Text className="text-turtle-slate/70 font-inter mt-2 text-center">
                I'll be your companion, cheerleader, and guide. Together, we'll take recovery one step at a time - just like a wise turtle should!
              </Text>
            </View>

            <View className="bg-white p-6 rounded-xl border border-turtle-teal/20 space-y-4">
              <View className="flex-row justify-between">
                <Text className="text-turtle-slate/70 font-inter">Stroke Type:</Text>
                <Text className="text-turtle-slate font-inter-semibold">
                  {strokeTypes.find(t => t.id === strokeType)?.name}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-turtle-slate/70 font-inter">Mobility Level:</Text>
                <Text className="text-turtle-slate font-inter-semibold">{mobilityLevel}/10</Text>
              </View>
              <View>
                <Text className="text-turtle-slate/70 font-inter mb-2">Recovery Goals:</Text>
                <View className="flex-row flex-wrap">
                  {selectedGoals.map(goalId => {
                    const goal = recoveryGoals.find(g => g.id === goalId);
                    return (
                      <View key={goalId} className="bg-turtle-teal/10 px-3 py-1 rounded-full mr-2 mb-2">
                        <Text className="text-turtle-teal font-inter text-sm">
                          {goal?.icon} {goal?.name}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>

            <Text className="text-turtle-slate/60 font-inter text-sm text-center mt-6">
              🐢 "Remember, slow and steady wins the race. We're in this together!"
            </Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-turtle-cream">
      {step > 1 && (
        <TouchableOpacity
          onPress={() => setStep(step - 1)}
          className="mt-4 ml-6 w-12 h-12 bg-white rounded-full items-center justify-center shadow-sm"
        >
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
      )}

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Progress indicator */}
        <View className="flex-row justify-center mb-8 mt-4">
          {[1, 2, 3, 4].map((stepNum) => (
            <View
              key={stepNum}
              className={`w-3 h-3 rounded-full mx-1 ${
                stepNum <= step ? 'bg-turtle-teal' : 'bg-gray-300'
              }`}
            />
          ))}
        </View>

        {renderStepContent()}
      </ScrollView>

      <View className="px-6 pb-6">
        <TouchableOpacity
          onPress={step === 4 ? handleComplete : () => setStep(step + 1)}
          disabled={loading || (step === 1 && !strokeType) || (step === 3 && selectedGoals.length === 0)}
          className="bg-turtle-teal py-4 px-8 rounded-2xl shadow-lg disabled:opacity-50 flex-row items-center justify-center"
        >
          <Text className="text-white text-lg font-inter-semibold mr-2">
            {loading ? 'Setting up...' : step === 4 ? 'Start My Journey!' : 'Continue'}
          </Text>
          {!loading && <ArrowRight size={20} color="white" />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}