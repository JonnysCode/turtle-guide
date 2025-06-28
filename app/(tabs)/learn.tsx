import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, Brain, CheckCircle, ChevronRight, Heart, Moon, Play } from 'lucide-react-native';
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
      introduction: 'Understanding what happened during a stroke and how recovery works is an important first step in your journey.',
      sections: [
        {
          title: 'What is a Stroke?',
          content: 'A stroke happens when blood flow to part of the brain is interrupted. This can be due to a blockage (ischemic stroke) or bleeding (hemorrhagic stroke). When brain cells don\'t get enough oxygen, they can be damaged or die.',
          tips: [
            'Every stroke is different and affects people differently',
            'The brain has amazing ability to heal and adapt (neuroplasticity)',
            'Recovery is possible at any age'
          ]
        },
        {
          title: 'The Recovery Process',
          content: 'Recovery from stroke is not linear - it happens in waves with good days and challenging days. Your brain is working hard to create new pathways and restore function.',
          tips: [
            'Most recovery happens in the first 6 months, but improvement can continue for years',
            'Repetition and practice help create new brain pathways',
            'Rest is just as important as exercise'
          ]
        }
      ],
      keyTakeaways: [
        'Every stroke survivor\'s journey is unique',
        'The brain can heal and adapt throughout life',
        'Recovery takes time, patience, and consistent effort',
        'You are not alone in this journey'
      ],
      turtleWisdom: 'Just like how I carry my home on my back, you carry strength within you. Recovery isn\'t about returning to who you were - it\'s about discovering who you\'re becoming.'
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
      introduction: 'Good nutrition is like fuel for your recovery. The right foods can help your brain heal and give you energy for daily activities.',
      sections: [
        {
          title: 'Brain-Healthy Foods',
          content: 'Certain foods are especially good for brain health and recovery. Think of colorful fruits and vegetables, fish rich in omega-3s, and whole grains.',
          tips: [
            'Blueberries and dark leafy greens are brain superfoods',
            'Salmon, walnuts, and flaxseeds provide healthy fats',
            'Whole grains give steady energy to your brain'
          ]
        },
        {
          title: 'Staying Hydrated',
          content: 'Your brain is about 75% water, so staying hydrated is crucial for thinking clearly and feeling your best.',
          tips: [
            'Aim for 8 glasses of water daily',
            'Herbal teas and broths count too',
            'If swallowing is difficult, try thickened liquids as recommended by your speech therapist'
          ]
        }
      ],
      keyTakeaways: [
        'Colorful, whole foods support brain healing',
        'Hydration is essential for brain function',
        'Small, frequent meals can help maintain energy',
        'Work with a dietitian if you have special needs'
      ],
      turtleWisdom: 'I move slowly and eat mindfully - there\'s wisdom in taking time with nourishment. Every healthy bite is a gift to your healing brain.'
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
      introduction: 'It\'s completely normal to experience a range of emotions after a stroke. Feeling sad, frustrated, anxious, or angry doesn\'t mean you\'re not strong - it means you\'re human.',
      sections: [
        {
          title: 'Common Emotional Changes',
          content: 'Many stroke survivors experience changes in emotions. This can be due to brain changes, the stress of recovery, or grief for abilities that have changed.',
          tips: [
            'Crying or feeling sad is a normal part of processing what happened',
            'Frustration with new limitations is understandable',
            'Some emotional changes are due to brain injury itself (pseudobulbar affect)'
          ]
        },
        {
          title: 'Coping Strategies',
          content: 'There are many ways to support your emotional health during recovery. Finding what works for you is important.',
          tips: [
            'Talk to trusted friends, family, or a counselor',
            'Practice gentle breathing exercises',
            'Celebrate small victories every day',
            'Join a stroke support group to connect with others who understand'
          ]
        }
      ],
      keyTakeaways: [
        'Emotional changes after stroke are normal and common',
        'It\'s okay to grieve and feel frustrated',
        'Professional support can be very helpful',
        'You are not alone in these feelings'
      ],
      turtleWisdom: 'Even turtles sometimes need to retreat into their shells. Taking time to process emotions isn\'t weakness - it\'s wisdom. I\'m here with you through all the feelings.'
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
      introduction: 'Sleep is when your brain does its most important healing work. Getting good quality sleep can significantly impact your recovery progress.',
      sections: [
        {
          title: 'Why Sleep Matters',
          content: 'During sleep, your brain clears out toxins, consolidates memories, and repairs itself. For stroke recovery, sleep is especially important for neuroplasticity - your brain\'s ability to form new connections.',
          tips: [
            'Deep sleep is when most brain repair happens',
            'REM sleep helps process emotions and memories',
            'Even short naps can be beneficial for recovery'
          ]
        },
        {
          title: 'Creating Good Sleep Habits',
          content: 'Good sleep doesn\'t always come naturally after a stroke, but there are ways to improve it.',
          tips: [
            'Keep a consistent bedtime and wake time',
            'Create a calm, dark sleeping environment',
            'Avoid screens for 1 hour before bed',
            'Try gentle stretching or meditation before sleep'
          ]
        }
      ],
      keyTakeaways: [
        'Sleep is crucial for brain healing and recovery',
        'Consistent sleep schedule helps regulate your body',
        'Good sleep hygiene makes a big difference',
        'Talk to your doctor if sleep problems persist'
      ],
      turtleWisdom: 'We turtles are experts at rest! Remember, healing happens during quiet moments too. Your brain is working hard even when you\'re sleeping peacefully.'
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
  basics: '#9381FF',
  lifestyle: '#418D84',
  exercises: '#418D84',
  'mental-health': '#9381FF'
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
      <SafeAreaView className="flex-1 bg-chalk">
        <View className="flex-1">
          {/* Header */}
          <View className="px-6 py-4 bg-chalk shadow-sm">
            <TouchableOpacity
              onPress={() => {
                setSelectedLesson(null);
                setCurrentSection(0);
              }}
              className="mb-2"
            >
              <Text className="text-royal-palm font-inter">← Back to Lessons</Text>
            </TouchableOpacity>
            <Text className="text-xl font-inter-bold text-earie-black">
              {selectedLesson.title}
            </Text>
            <View className="flex-row items-center mt-2">
              <View className="flex-1 bg-blue-glass h-2 rounded-full">
                <View
                  className="bg-royal-palm h-2 rounded-full"
                  style={{ width: `${((currentSection + 1) / (selectedLesson.content.sections.length + 1)) * 100}%` }}
                />
              </View>
              <Text className="text-earie-black/70 font-inter text-sm ml-3">
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
                  <Text className="text-lg font-inter text-royal-palm text-center mt-4">
                    {selectedLesson.content.introduction}
                  </Text>
                </View>
              </View>
            ) : currentSection <= selectedLesson.content.sections.length ? (
              // Section content
              <View>
                <Text className="text-2xl font-inter-bold text-earie-black mb-4">
                  {currentSectionData.title}
                </Text>
                <Text className="text-earie-black font-inter text-lg leading-7 mb-6">
                  {currentSectionData.content}
                </Text>

                {currentSectionData.tips && (
                  <View className="bg-flaxseed rounded-2xl p-6 shadow-sm border border-royal-palm">
                    <Text className="text-royal-palm font-inter-semibold mb-3">
                      💡 Key Tips
                    </Text>
                    {currentSectionData.tips.map((tip, index) => (
                      <View key={index} className="flex-row mb-2">
                        <Text className="text-royal-palm mr-2">•</Text>
                        <Text className="text-earie-black font-inter flex-1">{tip}</Text>
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
                  <Text className="text-2xl font-inter-bold text-earie-black mt-4">
                    Lesson Complete! 🎉
                  </Text>
                </View>

                <View className="bg-chalk rounded-2xl p-6 mb-6 shadow-sm border border-royal-palm">
                  <Text className="text-royal-palm font-inter-bold mb-4">
                    🌟 Key Takeaways
                  </Text>
                  {selectedLesson.content.keyTakeaways.map((takeaway, index) => (
                    <View key={index} className="flex-row mb-3">
                      <CheckCircle size={20} color="#418D84" className="mr-3 mt-1" />
                      <Text className="text-earie-black font-inter flex-1">{takeaway}</Text>
                    </View>
                  ))}
                </View>

                <View className="bg-blue-glass rounded-2xl p-6 border border-royal-palm">
                  <Text className="text-royal-palm font-inter-semibold mb-3">
                    🐢 Turtle Wisdom
                  </Text>
                  <Text className="text-earie-black font-inter italic">
                    "{selectedLesson.content.turtleWisdom}"
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Navigation */}
          <View className="px-6 pb-6 bg-chalk">
            <View className="flex-row gap-4">
              {currentSection > 0 && (
                <TouchableOpacity
                  onPress={() => setCurrentSection(prev => prev - 1)}
                  className="flex-1 bg-blue-glass py-4 rounded-2xl"
                >
                  <Text className="text-earie-black font-inter-semibold text-center">
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
                className="flex-1 bg-royal-palm py-4 rounded-2xl"
              >
                <Text className="text-chalk font-inter-semibold text-center">
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
    <SafeAreaView className="flex-1 bg-chalk">
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="py-6">
          <View className="items-center mb-6">
            <TurtleAvatar size={80} mood="thinking" />
            <Text className="text-2xl font-inter-bold text-earie-black mt-3">
              Learning Center
            </Text>
            <Text className="text-royal-palm font-inter text-center mt-1">
              Knowledge is power on your recovery journey
            </Text>
          </View>

          {completedLessons.length > 0 && (
            <View
              className="bg-emerald-50 border border-emerald-300 px-6 py-4 rounded-2xl mb-6">
              <View className="flex-row items-center mb-2">
                <Text className="text-emerald-700 font-inter-bold text-lg flex-1">
                  🎓 Learning Progress
                </Text>
              </View>
              <Text className="text-emerald-600 font-inter">
                You've completed {completedLessons.length} lesson{completedLessons.length > 1 ? 's' : ''}! Keep up the great work!
              </Text>
            </View>
          )}

          <Text className="text-lg font-inter-bold text-earie-black mb-4">
            Available Lessons
          </Text>

          <View className="gap-4">
            {lessons.map((lesson) => {
              const isCompleted = completedLessons.includes(lesson.id);
              const IconComponent = categoryIcons[lesson.category];
              const categoryColor = categoryColors[lesson.category];

              return (
                <TouchableOpacity
                  key={lesson.id}
                  onPress={() => setSelectedLesson(lesson)}
                  className="bg-turtle-cream-100 border border-turtle-teal-300 rounded-2xl p-6 shadow-lg shadow-turtle-teal-300/50"
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-2">
                        <View
                          className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                          style={{ backgroundColor: `${categoryColor}30` }}
                        >
                          <IconComponent size={16} color={categoryColor} />
                        </View>
                        <Text className="text-lg font-inter-bold text-earie-black flex-1">
                          {lesson.title}
                        </Text>
                        {isCompleted && (
                          <CheckCircle size={20} color="#418D84" />
                        )}
                      </View>
                      <Text className="text-royal-palm font-inter text-sm mb-3">
                        {lesson.description}
                      </Text>
                      <View className="flex-row items-center">
                        <View className="bg-blue-glass px-2 py-1 rounded mr-3">
                          <Text className="text-royal-palm font-inter text-xs">
                            {lesson.duration} min read
                          </Text>
                        </View>
                        <View
                          className="px-2 py-1 rounded"
                          style={{ backgroundColor: `${categoryColor}25` }}
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
                        <View
                          className="w-14 h-14 bg-royal-palm rounded-full items-center justify-center shadow-lg shadow-turtle-cream-300/70">
                          <CheckCircle size={26} color="#F6F4F1" />
                        </View>
                      ) : (
                        <View
                          className="w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-turtle-cream-300/70"
                          style={{ backgroundColor: categoryColor }}
                        >
                          <BookOpen size={22} color="#F6F4F1" />
                        </View>
                      )}
                    </View>
                  </View>

                  <View className="flex-row justify-end">
                    <ChevronRight size={20} color="#418D84" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View
            className="bg-turtle-indigo-50 border border-turtle-indigo-200 rounded-3xl px-6 py-4 mt-8">
            <View className="flex-row items-start mb-2">
              <View className="flex-1">
                <Text className="text-turtle-indigo-700 font-inter-bold text-lg ml-1">
                  🐢 Learning Tip
                </Text>
              </View>
            </View>
            <Text
              className="text-turtle-indigo-700 font-inter text-base leading-relaxed italic">
              "Take your time with each lesson - there's no rush! Understanding comes gradually, just like everything in recovery. I'll be here whenever you're ready to learn something new."
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}