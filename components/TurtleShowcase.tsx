import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TurtleCompanion, { TurtleMood, TurtleCompanionPresets } from './TurtleCompanion';

// This is a demo component to showcase the different turtle moods and interactions
// You can use this component for testing or as a mood reference

const allMoods: TurtleMood[] = [
  'main', 'excited', 'great', 'hi', 'idea', 'love', 
  'meditation', 'questioning', 'sad', 'speech', 
  'wave-left', 'wave-right', 'writing'
];

export default function TurtleShowcase() {
  const [selectedMood, setSelectedMood] = useState<TurtleMood>('main');
  const [showMessage, setShowMessage] = useState(true);

  const moodDescriptions: Record<TurtleMood, string> = {
    main: "The default friendly turtle - perfect for general interactions",
    excited: "High energy and enthusiastic - great for exercises and achievements",
    great: "Celebrating success - ideal for completions and positive feedback",
    hi: "Welcoming and greeting - perfect for app launch and welcome screens",
    idea: "Thoughtful and inspiring - excellent for learning and tips",
    love: "Warm and supportive - ideal for encouragement and emotional support",
    meditation: "Calm and peaceful - perfect for breathing exercises and relaxation",
    questioning: "Curious and attentive - great for check-ins and gathering input",
    sad: "Empathetic and understanding - appropriate for difficult moments",
    speech: "Communication focused - ideal for speech therapy and verbal exercises",
    'wave-left': "Friendly greeting gesture - perfect for onboarding",
    'wave-right': "Farewell gesture - great for endings and goodbyes",
    writing: "Sharing wisdom - excellent for tips, advice, and educational content"
  };

  return (
    <SafeAreaView className="flex-1 bg-chalk">
      <ScrollView className="flex-1 px-6 py-6">
        <Text className="text-2xl font-inter-bold text-earie-black text-center mb-2">
          Turtle Companion Showcase
        </Text>
        <Text className="text-royal-palm font-inter text-center mb-8">
          Explore different moods and interactions
        </Text>

        {/* Current Turtle Display */}
        <View className="items-center mb-8">
          <TurtleCompanion
            size={160}
            mood={selectedMood}
            message={moodDescriptions[selectedMood]}
            showMessage={showMessage}
            animate={true}
            onTap={() => setShowMessage(!showMessage)}
            className="mb-4"
          />
          
          <Text className="text-lg font-inter-bold text-earie-black capitalize mb-2">
            {selectedMood.replace('-', ' ')} Turtle
          </Text>
          
          <TouchableOpacity
            onPress={() => setShowMessage(!showMessage)}
            className="bg-royal-palm px-4 py-2 rounded-xl"
          >
            <Text className="text-chalk font-inter-semibold">
              {showMessage ? 'Hide Message' : 'Show Message'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Mood Selection Grid */}
        <Text className="text-lg font-inter-bold text-earie-black mb-4">
          Choose a Mood:
        </Text>
        
        <View className="flex-row flex-wrap gap-3 mb-8">
          {allMoods.map((mood) => (
            <TouchableOpacity
              key={mood}
              onPress={() => setSelectedMood(mood)}
              className={`px-4 py-2 rounded-xl ${
                selectedMood === mood 
                  ? 'bg-royal-palm' 
                  : 'bg-turtle-cream-100 border border-turtle-teal-300'
              }`}
            >
              <Text
                className={`font-inter text-sm capitalize ${
                  selectedMood === mood ? 'text-chalk' : 'text-earie-black'
                }`}
              >
                {mood.replace('-', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Preset Examples */}
        <Text className="text-lg font-inter-bold text-earie-black mb-4">
          Common Scenarios:
        </Text>

        <View className="gap-4">
          {Object.entries(TurtleCompanionPresets).map(([key, preset]) => (
            <TouchableOpacity
              key={key}
              onPress={() => {
                setSelectedMood(preset.mood);
                setShowMessage(preset.showMessage);
              }}
              className="bg-turtle-cream-100 border border-turtle-teal-300 rounded-xl p-4"
            >
              <Text className="font-inter-bold text-earie-black capitalize mb-1">
                {key} Scenario
              </Text>
              <Text className="text-royal-palm font-inter text-sm mb-2">
                Mood: {preset.mood.replace('-', ' ')}
              </Text>
              <Text className="text-earie-black/80 font-inter text-sm">
                "{preset.message}"
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Usage Tips */}
        <View className="bg-blue-glass border border-royal-palm rounded-xl p-6 mt-8">
          <Text className="text-royal-palm font-inter-bold text-lg mb-3">
            💡 Usage Tips
          </Text>
          <View className="gap-2">
            <Text className="text-earie-black font-inter">
              • Use <Text className="font-inter-bold">'excited'</Text> for exercise motivation
            </Text>
            <Text className="text-earie-black font-inter">
              • Use <Text className="font-inter-bold">'great'</Text> for celebrating achievements
            </Text>
            <Text className="text-earie-black font-inter">
              • Use <Text className="font-inter-bold">'meditation'</Text> for calming activities
            </Text>
            <Text className="text-earie-black font-inter">
              • Use <Text className="font-inter-bold">'sad'</Text> for supportive moments
            </Text>
            <Text className="text-earie-black font-inter">
              • Use <Text className="font-inter-bold">'idea'</Text> for learning and tips
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}