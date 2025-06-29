import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, User } from 'lucide-react-native';
import { useUser } from '@/contexts/UserContext';
import TurtleCompanion from '@/components/TurtleCompanion';
import Input from '@/components/Input';

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
  const [patientName, setPatientName] = useState('');
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
    if (!patientName.trim()) {
      Alert.alert('Please enter your name');
      return;
    }

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
        patient_name: patientName.trim(),
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
              <TurtleCompanion
                size={120}
                mood="hi"
                message="Nice to meet you! I'm so happy you're here. Let's start with your name so I can personalize your recovery journey."
                showMessage={true}
                animate={true}
              />
              <Text className="text-2xl font-inter-bold text-earie-black mt-4 text-center">
                Nice to Meet You!
              </Text>
              <Text className="text-royal-palm font-inter mt-2 text-center text-lg">
                What should I call you?
              </Text>
            </View>

            <View className="gap-6">
              <View>
                <Text className="text-earie-black font-inter-semibold mb-3 text-lg">
                  What should I call you?
                </Text>
                <View
                  className="relative bg-turtle-cream-100 py-4 px-4 pl-12 rounded-xl border border-turtle-teal-300 justify-center">
                  <Input
                    value={patientName}
                    onChangeText={setPatientName}
                    placeholder="Enter your first name"
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                  <View className="absolute left-4">
                    <User size={26} color="#418D84" />
                  </View>
                </View>
              </View>

              <View className="bg-turtle-cream-100 p-4 rounded-xl border border-turtle-teal-300 mb-8">
                <Text className="text-royal-palm font-inter-semibold mb-2">
                  🐢 Privacy Note
                </Text>
                <Text className="text-earie-black font-inter text-sm">
                  Your name helps me create a more personal experience. All your information is kept private and secure.
                </Text>
              </View>
            </View>
          </View>
        );

      case 2:
        return (
          <View className="flex-1">
            <View className="items-center mb-8">
              <TurtleCompanion
                size={120}
                mood="questioning"
                message={patientName ? `Hello ${patientName}! To help me support you better, could you tell me what type of stroke brought us together?` : 'Let\'s get to know each other better. What type of stroke brought us together?'}
                showMessage={true}
                animate={true}
              />
              <Text className="text-2xl font-inter-bold text-earie-black mt-4 text-center">
                {patientName ? `Hello ${patientName}!` : 'Let\'s Get to Know Each Other'}
              </Text>
              <Text className="text-royal-palm font-inter mt-2 text-center">
                This helps me understand your journey
              </Text>
            </View>

            <View className="gap-2 mb-8">
              {strokeTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => setStrokeType(type.id)}
                  className={`p-4 rounded-xl border ${
                    strokeType === type.id
                      ? 'bg-royal-palm border-royal-palm'
                      : 'bg-turtle-cream-100 border-turtle-teal-300'
                  }`}
                >
                  <Text className={`font-inter-semibold text-lg ${
                    strokeType === type.id ? 'text-chalk' : 'text-earie-black'
                  }`}>
                    {type.name}
                  </Text>
                  <Text className={`font-inter text-sm ${
                    strokeType === type.id ? 'text-chalk/80' : 'text-royal-palm'
                  }`}>
                    {type.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 3:
        return (
          <View className="flex-1 pb-8">
            <View className="items-center mb-8">
              <TurtleCompanion
                size={120}
                mood="meditation"
                message="Now, help me understand your current mobility level on a scale of 1-10. This helps me suggest the right exercises for you. Remember, every level is perfect - we're just starting where you are!"
                showMessage={true}
                animate={true}
              />
              <Text className="text-2xl font-inter-bold text-earie-black mt-4 text-center">
                Your Mobility Level
              </Text>
              <Text className="text-royal-palm font-inter mt-2 text-center">
                Help me understand where you are today
              </Text>
            </View>

            <View className="bg-turtle-cream-100 p-6 rounded-xl border border-turtle-teal-300">
              <Text className="text-center text-3xl font-inter-bold text-royal-palm mb-4">
                {mobilityLevel}
              </Text>

              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-earie-black font-inter text-sm">
                  Need help with most activities
                </Text>
                <Text className="text-earie-black font-inter text-sm">
                  Very independent
                </Text>
              </View>

              <View className="flex-row">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                  <TouchableOpacity
                    key={level}
                    onPress={() => setMobilityLevel(level)}
                    className={`flex-1 mx-1 h-8 rounded ${
                      level <= mobilityLevel ? 'bg-royal-palm' : 'bg-blue-glass'
                    }`}
                  />
                ))}
              </View>
            </View>

            <Text className="text-royal-palm font-inter text-sm text-center mt-4">
              Don't worry - this helps me personalize your exercises and we can adjust anytime!
            </Text>
          </View>
        );

      case 4:
        return (
          <View className="flex-1">
            <View className="items-center mb-8">
              <TurtleCompanion
                size={120}
                mood="idea"
                message="What matters most to you in your recovery? Choose any goals that resonate with you - these will help me personalize your experience and celebrate your progress!"
                showMessage={true}
                animate={true}
              />
              <Text className="text-2xl font-inter-bold text-earie-black mt-4 text-center">
                What Are Your Goals?
              </Text>
              <Text className="text-royal-palm font-inter mt-2 text-center">
                Select what matters most to you
              </Text>
            </View>

            <View className="grid grid-cols-2 gap-3 mb-8">
              {recoveryGoals.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  onPress={() => toggleGoal(goal.id)}
                  className={`p-4 rounded-xl border ${
                    selectedGoals.includes(goal.id)
                      ? 'bg-royal-palm border-royal-palm'
                      : 'bg-turtle-cream-100 border-turtle-teal-300'
                  }`}
                >
                  <Text className="text-2xl mb-2">{goal.icon}</Text>
                  <Text className={`font-inter-semibold ${
                    selectedGoals.includes(goal.id) ? 'text-chalk' : 'text-earie-black'
                  }`}>
                    {goal.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 5:
        return (
          <View className="flex-1 pb-8">
            <View className="items-center mb-8">
              <TurtleCompanion
                size={140}
                mood="love"
                message={`Perfect! I'm ${turtleName}, and I'm so honored to be your companion, cheerleader, and guide. Together, we'll take recovery one step at a time - just like a wise turtle should! ${patientName}, I believe in you completely.`}
                showMessage={true}
                animate={true}
              />
              <Text className="text-2xl font-inter-bold text-earie-black mt-4 text-center">
                Perfect! I'm {turtleName}
              </Text>
              <Text className="text-royal-palm font-inter mt-2 text-center">
                Your dedicated recovery companion
              </Text>
            </View>

            <View className="bg-turtle-cream-100 p-6 rounded-xl border border-turtle-teal-300 gap-4">
              <View className="flex-row justify-between">
                <Text className="text-royal-palm font-inter">Patient Name:</Text>
                <Text className="text-earie-black font-inter-semibold">{patientName}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-royal-palm font-inter">Stroke Type:</Text>
                <Text className="text-earie-black font-inter-semibold">
                  {strokeTypes.find(t => t.id === strokeType)?.name}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-royal-palm font-inter">Mobility Level:</Text>
                <Text className="text-earie-black font-inter-semibold">{mobilityLevel}/10</Text>
              </View>
              <View>
                <Text className="text-royal-palm font-inter mb-2">Recovery Goals:</Text>
                <View className="flex-row flex-wrap">
                  {selectedGoals.map(goalId => {
                    const goal = recoveryGoals.find(g => g.id === goalId);
                    return (
                      <View key={goalId} className="bg-blue-glass px-3 py-1 rounded-full mr-2 mb-2">
                        <Text className="text-royal-palm font-inter text-sm">
                          {goal?.icon} {goal?.name}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>

            <Text className="text-royal-palm font-inter text-sm text-center mt-6">
              🐢 "Remember, slow and steady wins the race. We're in this together, {patientName}!"
            </Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-chalk">
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {step > 1 && (
          <TouchableOpacity
            onPress={() => setStep(step - 1)}
            className="mt-4 ml-6 w-12 h-12 bg-turtle-cream-100 border border-turtle-teal-300 rounded-full items-center justify-center shadow-lg shadow-turtle-teal-300/50"
          >
            <ArrowLeft size={24} color="#1A1F16" />
          </TouchableOpacity>
        )}

        <ScrollView 
          className="flex-1 px-6" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
        {/* Progress indicator */}
        <View className="flex-row justify-center mb-8 mt-4">
          {[1, 2, 3, 4, 5].map((stepNum) => (
            <View
              key={stepNum}
              className={`w-3 h-3 rounded-full mx-1 ${
                stepNum <= step ? 'bg-royal-palm' : 'bg-blue-glass'
              }`}
            />
          ))}
        </View>

        {renderStepContent()}
      </ScrollView>

      <View className="px-6 pb-6 mt-2">
        <TouchableOpacity
          onPress={step === 5 ? handleComplete : () => setStep(step + 1)}
          disabled={loading || (step === 1 && !patientName.trim()) || (step === 2 && !strokeType) || (step === 4 && selectedGoals.length === 0)}
          className="bg-royal-palm py-4 px-8 rounded-2xl shadow-lg disabled:opacity-50 flex-row items-center justify-center"
        >
          <Text className="text-chalk text-lg font-inter-semibold mr-2">
            {loading ? 'Setting up...' : step === 5 ? 'Start My Journey!' : 'Continue'}
          </Text>
          {!loading && <ArrowRight size={20} color="white" />}
        </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}