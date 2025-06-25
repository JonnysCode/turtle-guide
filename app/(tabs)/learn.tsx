import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, Play, CheckCircle, ChevronRight, Brain, Heart, Utensils, Moon } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import TurtleAvatar from '@/components/TurtleAvatar';
import { supabase } from '@/lib/supabase';

interface Lesson {
  id: string;
  title: string;
  category: 'basics' | 'lifestyle' | 'exercises' | 'mental-health';
  difficulty: 'beginner' | 'intermediate';
  duration: number;
  description: string;
  content: LessonContent;
}

interface LessonContent {
  introduction: string;
  sections: {
    title: string;
    content: string;
    tips?: string[];
  }[];
  keyTakeaways: string[];
  turtleWisdom: string;
}

const lessons: Lesson[] = [
  {
    id: 'understanding-stroke',
    title: 'Understanding Stroke Recovery',
    category: 'basics',
    difficulty: 'beginner',
    duration: 8,
    description: 'Learn the basics of stroke and the recovery process',
    content: {
      introduction: "Understanding what happened during a stroke and how recovery works is an important first step in your journey.",
      sections: [
        {
          title: "What is a Stroke?",
          content: "A stroke happens when blood flow to part of the brain is interrupted. This can be due to a blockage (ischemic stroke) or bleeding (hemorrhagic stroke). When brain cells don't get enough oxygen, they can be damaged or die.",
          tips: [
            "Every stroke is different and affects people differently",
            "The brain has amazing ability to heal and adapt (neuroplasticity)",
            "Recovery is possible at any age"
          ]
        },
        {
          title: "The Recovery Process",
          content: "Recovery from stroke is not linear - it happens in waves with good days and challenging days. Your brain is working hard to create new pathways and restore function.",
          tips: [
            "Most recovery happens in the first 6 months, but improvement can continue for years",
            "Repetition and practice help create new brain pathways",
            "Rest is just as important as exercise"
          ]
        }
      ],
      keyTakeaways: [
        "Every stroke survivor's journey is unique",
        "The brain can heal and adapt throughout life",
        "Recovery takes time, patience, and consistent effort",
        "You are not alone in this journey"
      ],
      turtleWisdom: "Just like how I carry my home on my back, you carry strength within you. Recovery isn't about returning to who you were - it's about discovering who you're becoming."
    }
  },
  {
    id: 'nutrition-healing',
    title: 'Nutrition for Healing',
    category: 'lifestyle',
    difficulty: 'beginner',
    duration: 6,
    description: 'Foods that support brain health and recovery',
    content: {
      introduction: "Good nutrition is like fuel for your recovery. The right foods can help your brain heal and give you energy for daily activities.",
      sections: [
        {
          title: "Brain-Healthy Foods",
          content: "Certain foods are especially good for brain health and recovery. Think of colorful fruits and vegetables, fish rich in omega-3s, and whole grains.",
          tips: [
            "Blueberries and dark leafy greens are brain superfoods",
            "Salmon, walnuts, and flaxseeds provide healthy fats",
            "Whole grains give steady energy to your brain"
          ]
        },
        {
          title: "Staying Hydrated",
          content: "Your brain is about 75% water, so staying hydrated is crucial for thinking clearly and feeling your best.",
          tips: [
            "Aim for 8 glasses of water daily",
            "Herbal teas and broths count too",
            "If swallowing is difficult, try thickened liquids as recommended by your speech therapist"
          ]
        }
      ],
      keyTakeaways: [
        "Colorful, whole foods support brain healing",
        "Hydration is essential for brain function",
        "Small, frequent meals can help maintain energy",
        "Work with a dietitian if you have special needs"
      ],
      turtleWisdom: "I move slowly and eat mindfully - there's wisdom in taking time with nourishment. Every healthy bite is a gift to your healing brain."
    }
  },
  {
    id: 'emotional-wellbeing',
    title: 'Managing Emotions After Stroke',
    category: 'mental-health',
    difficulty: 'intermediate',
    duration: 10,
    description: 'Understanding and coping with emotional changes',
    content: {
      introduction: "It's completely normal to experience a range of emotions after a stroke. Feeling sad, frustrated, anxious, or angry doesn't mean you're not strong - it means you're human.",
      sections: [
        {
          title: "Common Emotional Changes",
          content: "Many stroke survivors experience changes in emotions. This can be due to brain changes, the stress of recovery, or grief for abilities that have changed.",
          tips: [
            "Crying or feeling sad is a normal part of processing what happened",
            "Frustration with new limitations is understandable",
            "Some emotional changes are due to brain injury itself (pseudobulbar affect)"
          ]
        },
        {
          title: "Coping Strategies",
          content: "There are many ways to support your emotional health during recovery. Finding what works for you is important.",
          tips: [
            "Talk to trusted friends, family, or a counselor",
            "Practice gentle breathing exercises",
            "Celebrate small victories every day",
            "Join a stroke support group to connect with others who understand"
          ]
        }
      ],
      keyTakeaways: [
        "Emotional changes after stroke are normal and common",
        "It's okay to grieve and feel frustrated",
        "Professional support can be very helpful",
        "You are not alone in these feelings"
      ],
      turtleWisdom: "Even turtles sometimes need to retreat into their shells. Taking time to process emotions isn't weakness - it's wisdom. I'm here with you through all the feelings."
    }
  },
  {
    id: 'sleep-recovery',
    title: 'Sleep and Recovery',
    category: 'lifestyle',
    difficulty: 'beginner',
    duration: 7,
    description: 'The importance of good sleep for healing',
    content: {
      introduction: "Sleep is when your brain does its most important healing work. Getting good quality sleep can significantly impact your recovery progress.",
      sections: [
        {
          title: "Why Sleep Matters",
          content: "During sleep, your brain clears out toxins, consolidates memories, and repairs itself. For stroke recovery, sleep is especially important for neuroplasticity - your brain's ability to form new connections.",
          tips: [
            "Deep sleep is when most brain repair happens",
            "REM sleep helps process emotions and memories",
            "Even short naps can be beneficial for recovery"
          ]
        },
        {
          title: "Creating Good Sleep Habits",
          content: "Good sleep doesn't always come naturally after a stroke, but there are ways to improve it.",
          tips: [
            "Keep a consistent bedtime and wake time",
            "Create a calm, dark sleeping environment",
            "Avoid screens for 1 hour before bed",
            "Try gentle stretching or meditation before sleep"
          ]
        }
      ],
      keyTakeaways: [
        "Sleep is crucial for brain healing and recovery",
        "Consistent sleep schedule helps regulate your body",
        "Good sleep hygiene makes a big difference",
        "Talk to your doctor if sleep problems persist"
      ],
      turtleWisdom: "We turtles are experts at rest! Remember, healing happens during quiet moments too. Your brain is working hard even when you're sleeping peacefully."
    }
  }
];

const categoryIcons = {
  basics: Brain,
  lifestyle: Heart,
  exercises: Play,
  'mental-health': Moon
};

const categoryColors = {
  basics: '#8B5CF6',
  lifestyle: '#10B981',
  exercises: '#14B8A6',
  'mental-health': '#6366F1'
};

export default function Learn() {
  const { user } = useAuth();
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    fetchCompletedLessons();
  }, [user]);

  const fetchCompletedLessons = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('education_progress')
      .select('lesson_id')
      .eq('user_id', user.id)
      .eq('completed', true);

    if (data) {
      setCompletedLessons(data.map(progress => progress.lesson_id));
    }
  };

  const completeLesson = async (lessonId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('education_progress')
      .upsert({
        user_id: user.id,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString()
      });

    if (!error) {
      setCompletedLessons(prev => [...prev, lessonId]);
      setSelectedLesson(null);
      setCurrentSection(0);
    }
  };

  if (selectedLesson) {
    const currentSectionData = selectedLesson.content.sections[currentSection];
    const isLastSection = currentSection === selectedLesson.content.sections.length - 1;

    return (
      <SafeAreaView className="flex-1 bg-turtle-cream">
        <View className="flex-1">
          {/* Header */}
          <View className="px-6 py-4 bg-white shadow-sm">
            <TouchableOpacity
              onPress={() => {
                setSelectedLesson(null);
                setCurrentSection(0);
              }}
              className="mb-2"
            >
              <Text className="text-turtle-teal font-inter">← Back to Lessons</Text>
            </TouchableOpacity>
            <Text className="text-xl font-inter-bold text-turtle-slate">
              {selectedLesson.title}
            </Text>
            <View className="flex-row items-center mt-2">
              <View className="flex-1 bg-gray-200 h-2 rounded-full">
                <View 
                  className="bg-turtle-teal h-2 rounded-full"
                  style={{ width: `${((currentSection + 1) / (selectedLesson.content.sections.length + 1)) * 100}%` }}
                />
              </View>
              <Text className="text-turtle-slate/70 font-inter text-sm ml-3">
                {currentSection + 1} of {selectedLesson.content.sections.length + 1}
              </Text>
            </View>
          </View>

          <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
            {currentSection === 0 ? (
              // Introduction
              <View>
                <View className="items-center mb-6">
                  <TurtleAvatar size={100} mood="thinking" />
                  <Text className="text-lg font-inter text-turtle-slate/70 text-center mt-4">
                    {selectedLesson.content.introduction}
                  </Text>
                </View>
              </View>
            ) : currentSection <= selectedLesson.content.sections.length ? (
              // Section content
              <View>
                <Text className="text-2xl font-inter-bold text-turtle-slate mb-4">
                  {currentSectionData.title}
                </Text>
                <Text className="text-turtle-slate font-inter text-lg leading-7 mb-6">
                  {currentSectionData.content}
                </Text>
                
                {currentSectionData.tips && (
                  <View className="bg-white rounded-2xl p-6 shadow-sm border border-turtle-teal/10">
                    <Text className="text-turtle-teal font-inter-semibold mb-3">
                      💡 Key Tips
                    </Text>
                    {currentSectionData.tips.map((tip, index) => (
                      <View key={index} className="flex-row mb-2">
                        <Text className="text-turtle-teal mr-2">•</Text>
                        <Text className="text-turtle-slate font-inter flex-1">{tip}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ) : (
              // Summary page
              <View>
                <View className="items-center mb-6">
                  <TurtleAvatar size={120} mood="celebrating" />
                  <Text className="text-2xl font-inter-bold text-turtle-slate mt-4">
                    Lesson Complete! 🎉
                  </Text>
                </View>

                <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-turtle-teal/10">
                  <Text className="text-turtle-teal font-inter-bold mb-4">
                    🌟 Key Takeaways
                  </Text>
                  {selectedLesson.content.keyTakeaways.map((takeaway, index) => (
                    <View key={index} className="flex-row mb-3">
                      <CheckCircle size={20} color="#14B8A6" className="mr-3 mt-1" />
                      <Text className="text-turtle-slate font-inter flex-1">{takeaway}</Text>
                    </View>
                  ))}
                </View>

                <View className="bg-turtle-teal/5 rounded-2xl p-6 border border-turtle-teal/20">
                  <Text className="text-turtle-teal font-inter-semibold mb-3">
                    🐢 Turtle Wisdom
                  </Text>
                  <Text className="text-turtle-slate font-inter italic">
                    "{selectedLesson.content.turtleWisdom}"
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Navigation */}
          <View className="px-6 pb-6 bg-white">
            <View className="flex-row space-x-4">
              {currentSection > 0 && (
                <TouchableOpacity
                  onPress={() => setCurrentSection(prev => prev - 1)}
                  className="flex-1 bg-gray-200 py-4 rounded-2xl"
                >
                  <Text className="text-turtle-slate font-inter-semibold text-center">
                    Previous
                  </Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                onPress={() => {
                  if (currentSection === selectedLesson.content.sections.length) {
                    completeLesson(selectedLesson.id);
                  } else {
                    setCurrentSection(prev => prev + 1);
                  }
                }}
                className="flex-1 bg-turtle-teal py-4 rounded-2xl"
              >
                <Text className="text-white font-inter-semibold text-center">
                  {currentSection === selectedLesson.content.sections.length ? 'Complete Lesson' : 'Continue'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-turtle-cream">
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="py-6">
          <View className="items-center mb-6">
            <TurtleAvatar size={80} mood="thinking" />
            <Text className="text-2xl font-inter-bold text-turtle-slate mt-3">
              Learning Center
            </Text>
            <Text className="text-turtle-slate/70 font-inter text-center mt-1">
              Knowledge is power on your recovery journey
            </Text>
          </View>

          {completedLessons.length > 0 && (
            <View className="bg-turtle-green/10 p-4 rounded-xl mb-6 border border-turtle-green/20">
              <Text className="text-turtle-green font-inter-semibold mb-1">
                🎓 Learning Progress
              </Text>
              <Text className="text-turtle-slate font-inter">
                You've completed {completedLessons.length} lesson{completedLessons.length > 1 ? 's' : ''}! Keep up the great work!
              </Text>
            </View>
          )}

          <Text className="text-lg font-inter-bold text-turtle-slate mb-4">
            Available Lessons
          </Text>

          <View className="space-y-4">
            {lessons.map((lesson) => {
              const isCompleted = completedLessons.includes(lesson.id);
              const IconComponent = categoryIcons[lesson.category];
              const categoryColor = categoryColors[lesson.category];
              
              return (
                <TouchableOpacity
                  key={lesson.id}
                  onPress={() => setSelectedLesson(lesson)}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-turtle-teal/10"
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-2">
                        <View 
                          className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                          style={{ backgroundColor: `${categoryColor}20` }}
                        >
                          <IconComponent size={16} color={categoryColor} />
                        </View>
                        <Text className="text-lg font-inter-bold text-turtle-slate flex-1">
                          {lesson.title}
                        </Text>
                        {isCompleted && (
                          <CheckCircle size={20} color="#10B981" />
                        )}
                      </View>
                      <Text className="text-turtle-slate/70 font-inter text-sm mb-3">
                        {lesson.description}
                      </Text>
                      <View className="flex-row items-center">
                        <View className="bg-gray-100 px-2 py-1 rounded mr-3">
                          <Text className="text-turtle-slate/70 font-inter text-xs">
                            {lesson.duration} min read
                          </Text>
                        </View>
                        <View 
                          className="px-2 py-1 rounded"
                          style={{ backgroundColor: `${categoryColor}15` }}
                        >
                          <Text 
                            className="font-inter text-xs capitalize"
                            style={{ color: categoryColor }}
                          >
                            {lesson.category.replace('-', ' ')}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View className="items-center ml-4">
                      {isCompleted ? (
                        <View className="w-12 h-12 bg-turtle-green/10 rounded-full items-center justify-center">
                          <CheckCircle size={24} color="#10B981" />
                        </View>
                      ) : (
                        <View className="w-12 h-12 bg-turtle-teal/10 rounded-full items-center justify-center">
                          <BookOpen size={20} color="#14B8A6" />
                        </View>
                      )}
                    </View>
                  </View>
                  
                  <View className="flex-row justify-end">
                    <ChevronRight size={20} color="#64748B" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View className="bg-white rounded-2xl p-6 mt-6 shadow-sm border border-turtle-teal/10">
            <Text className="text-turtle-slate font-inter-semibold mb-2">
              🐢 Learning Tip
            </Text>
            <Text className="text-turtle-slate/70 font-inter">
              "Take your time with each lesson - there's no rush! Understanding comes gradually, just like everything in recovery. I'll be here whenever you're ready to learn something new."
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}