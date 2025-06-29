import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, BookOpen, CircleCheck as CheckCircle, ChevronRight, Clock } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import TurtleCompanion from '@/components/TurtleCompanion';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { supabase } from '@/lib/supabase';
import { checkAndAwardAchievements } from '@/lib/achievementSystem';

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
  },
  {
    id: 'building-confidence',
    title: 'Building Confidence After Stroke',
    category: 'mental-health',
    difficulty: 'intermediate',
    duration: 12,
    description: 'Rebuilding self-confidence and independence',
    content: {
      introduction: 'Stroke can shake your confidence, but it doesn\'t define your worth or potential. Building confidence is a gradual process that happens one small victory at a time.',
      sections: [
        {
          title: 'Understanding Confidence Changes',
          content: 'It\'s natural for confidence to fluctuate after a stroke. Your brain is adapting to changes, and you\'re learning new ways to do familiar tasks.',
          tips: [
            'Confidence often returns gradually as you practice new skills',
            'It\'s okay to feel uncertain about abilities that have changed',
            'Your worth isn\'t measured by what you can or can\'t do'
          ]
        },
        {
          title: 'Building Confidence Daily',
          content: 'Confidence grows through small, consistent actions and celebrating progress, no matter how small.',
          tips: [
            'Set small, achievable goals each day',
            'Celebrate every accomplishment, no matter the size',
            'Practice self-compassion when things feel difficult',
            'Focus on what you CAN do, not what feels harder now'
          ]
        },
        {
          title: 'Getting Support',
          content: 'Building confidence is easier when you have support from others who understand your journey.',
          tips: [
            'Connect with other stroke survivors who inspire you',
            'Work with therapists who believe in your potential',
            'Let family and friends know how they can best support you',
            'Consider joining support groups or online communities'
          ]
        }
      ],
      keyTakeaways: [
        'Confidence can be rebuilt through small daily actions',
        'Your worth isn\'t defined by your abilities',
        'Support from others makes the journey easier',
        'Every small step forward is meaningful progress'
      ],
      turtleWisdom: 'I may move slowly, but I never doubt my ability to reach my destination. Your pace doesn\'t matter - what matters is that you keep moving forward with kindness toward yourself.'
    }
  },
  {
    id: 'communication-strategies',
    title: 'Communication Strategies',
    category: 'basics',
    difficulty: 'intermediate',
    duration: 9,
    description: 'Effective ways to communicate after stroke',
    content: {
      introduction: 'Communication changes after stroke are common and can be frustrating. There are many strategies and tools that can help you express yourself and connect with others.',
      sections: [
        {
          title: 'Types of Communication Changes',
          content: 'Stroke can affect different aspects of communication, from finding words to understanding speech or reading.',
          tips: [
            'Aphasia affects language but not intelligence',
            'Dysarthria affects speech clarity but not thinking',
            'Some people have trouble with reading or writing'
          ]
        },
        {
          title: 'Helpful Communication Strategies',
          content: 'There are many ways to improve communication and help others understand you better.',
          tips: [
            'Take your time - there\'s no rush to speak quickly',
            'Use gestures, pictures, or writing to supplement speech',
            'Ask others to speak slowly and give you time to respond',
            'Practice important words or phrases when you\'re relaxed'
          ]
        },
        {
          title: 'Technology and Tools',
          content: 'Modern technology offers many tools to support communication.',
          tips: [
            'Speech therapy apps can provide daily practice',
            'Communication boards help express common needs',
            'Voice amplifiers can help if speech is quiet',
            'Text-to-speech apps can help when writing is easier than speaking'
          ]
        }
      ],
      keyTakeaways: [
        'Communication changes don\'t affect your intelligence',
        'Many strategies can help improve communication',
        'Technology offers helpful tools and support',
        'Practice and patience lead to improvement'
      ],
      turtleWisdom: 'Sometimes the most important communication happens without words at all. Your presence, your effort, and your heart speak volumes about who you are.'
    }
  }
];

const categoryColors = {
  basics: '#9381FF',
  lifestyle: '#418D84',
  exercises: '#418D84',
  'mental-health': '#9381FF'
};

export default function LessonDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const foundLesson = lessons.find(l => l.id === id);
    if (foundLesson) {
      setLesson(foundLesson);
      checkIfCompleted(foundLesson.id);
    }
  }, [id]);

  const checkIfCompleted = async (lessonId: string) => {
    if (!user) return;

    const { data } = await supabase
      .from('education_progress')
      .select('completed')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .single();

    if (data?.completed) {
      setIsCompleted(true);
    }
  };

  const completeLesson = async () => {
    if (!user || !lesson) return;

    try {
      const { error } = await supabase
        .from('education_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lesson.id,
          completed: true,
          completed_at: new Date().toISOString()
        });

      if (error) {
        Alert.alert('Error', 'Failed to mark lesson as complete');
        return;
      }

      // Check for new achievements
      const newAchievements = await checkAndAwardAchievements(user.id);

      setIsCompleted(true);

      const message = newAchievements.length > 0
        ? `Great job! You completed the lesson and earned ${newAchievements.length} new badge${newAchievements.length > 1 ? 's' : ''}! 🏆`
        : 'Great job! You\'ve completed another step in your learning journey.';

      Alert.alert(
        'Lesson Complete! 🎉',
        message,
        [
          {
            text: 'Continue Learning',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error completing lesson:', error);
      Alert.alert('Error', 'Failed to mark lesson as complete. Please try again.');
    }
  };

  if (!lesson) {
    return (
      <SafeAreaView className="flex-1 bg-chalk" edges={['top', 'left', 'right', 'bottom']}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-earie-black font-inter text-lg">Lesson not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const categoryColor = categoryColors[lesson.category];
  const totalSections = lesson.content.sections.length + 2; // +2 for intro and summary
  const isIntroduction = currentSection === 0;
  const isSummary = currentSection === totalSections - 1;
  const currentSectionData = !isIntroduction && !isSummary 
    ? lesson.content.sections[currentSection - 1] 
    : null;

  return (
    <SafeAreaView className="flex-1 bg-turtle-cream-50" edges={['top', 'left', 'right', 'bottom']}>
      {/* Header with back button */}
      <View className="px-6 py-4 border-b border-turtle-teal-300">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-12 h-12 bg-turtle-cream-100 border border-turtle-teal-300 rounded-full items-center justify-center mr-4"
          >
            <ArrowLeft size={24} color="#1A1F16" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-inter-bold text-earie-black">
              {lesson.title}
            </Text>
            <View className="flex-row items-center mt-1">
              <Clock size={14} color="#418D84" />
              <Text className="text-royal-palm font-inter text-sm ml-1 mr-3">
                {lesson.duration} min read
              </Text>
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
          {isCompleted && (
            <View className="w-12 h-12 bg-royal-palm rounded-full items-center justify-center">
              <CheckCircle size={24} color="#F6F4F1" />
            </View>
          )}
        </View>

        {/* Progress indicator */}
        <View className="flex-row items-center mt-4">
          <View className="flex-1 bg-blue-glass h-2 rounded-full">
            <View
              className="bg-royal-palm h-2 rounded-full"
              style={{ width: `${((currentSection + 1) / totalSections) * 100}%` }}
            />
          </View>
          <Text className="text-earie-black/70 font-inter text-sm ml-3">
            {currentSection + 1} of {totalSections}
          </Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-6 py-6 bg-chalk" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {isIntroduction ? (
          // Introduction
          <View>
            <View className="items-center mb-8">
              <TurtleCompanion
                size={140}
                mood="idea"
                message="Ready to learn something new? I love discovering things together with you!"
                showMessage={true}
                animate={true}
              />
            </View>
            
            <Card variant="elevated" className="mb-6">
              <Text className="text-2xl font-inter-bold text-earie-black mb-4">
                Welcome to this lesson!
              </Text>
              <Text className="text-earie-black font-inter text-lg leading-7 mb-6">
                {lesson.content.introduction}
              </Text>
              
              <View className="bg-flaxseed rounded-xl p-4">
                <Text className="text-royal-palm font-inter-bold mb-2">
                  📖 What you'll learn:
                </Text>
                {lesson.content.sections.map((section, index) => (
                  <View key={index} className="flex-row mb-2">
                    <Text className="text-royal-palm mr-2">•</Text>
                    <Text className="text-earie-black font-inter flex-1">
                      {section.title}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          </View>
        ) : isSummary ? (
          // Summary page
          <View>
            <View className="items-center mb-8">
              <TurtleCompanion
                size={140}
                mood="great"
                message="Fantastic! You completed another lesson. Your dedication to learning is inspiring!"
                showMessage={true}
                animate={true}
              />
              <Text className="text-2xl font-inter-bold text-earie-black mt-4">
                Lesson Complete! 🎉
              </Text>
            </View>

            <Card variant="elevated" className="mb-6">
              <Text className="text-royal-palm font-inter-bold mb-4 text-xl">
                🌟 Key Takeaways
              </Text>
              {lesson.content.keyTakeaways.map((takeaway, index) => (
                <View key={index} className="flex-row mb-4 p-3 bg-flaxseed rounded-xl">
                  <CheckCircle size={20} color="#418D84" className="mr-3 mt-1" />
                  <Text className="text-earie-black font-inter flex-1 text-base">
                    {takeaway}
                  </Text>
                </View>
              ))}
            </Card>

            <Card variant="flat" className="bg-blue-glass border-royal-palm">
              <View className="flex-row items-start">
                <Text className="text-3xl mr-3">🐢</Text>
                <View className="flex-1">
                  <Text className="text-royal-palm font-inter-bold mb-3 text-lg">
                    Turtle Wisdom
                  </Text>
                  <Text className="text-earie-black font-inter italic text-base leading-relaxed">
                    "{lesson.content.turtleWisdom}"
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        ) : (
          // Section content
          <View>
            <Text className="text-2xl font-inter-bold text-earie-black mb-6">
              {currentSectionData?.title}
            </Text>
            
            <Card variant="elevated" className="mb-6">
              <Text className="text-earie-black font-inter text-lg leading-7 mb-6">
                {currentSectionData?.content}
              </Text>

              {currentSectionData?.tips && (
                <View className="bg-flaxseed rounded-xl p-4">
                  <Text className="text-royal-palm font-inter-bold mb-3 text-lg">
                    💡 Key Tips
                  </Text>
                  {currentSectionData.tips.map((tip, index) => (
                    <View key={index} className="flex-row mb-3">
                      <Text className="text-royal-palm mr-2">•</Text>
                      <Text className="text-earie-black font-inter flex-1 text-base">
                        {tip}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          </View>
        )}
      </ScrollView>

      {/* Fixed bottom navigation */}
      <View
        className="px-6 pt-4 bg-turtle-cream-50 border-t border-turtle-teal-300"
        style={{
          paddingBottom: Platform.OS === 'android' ? Math.max(24, insets.bottom + 16) : 24
        }}
      >
        <View className="flex-row gap-4">
          {currentSection > 0 && (
            <Button
              onPress={() => setCurrentSection(prev => prev - 1)}
              variant="outline"
              size="lg"
              className="flex-1"
            >
              Previous
            </Button>
          )}

          <Button
            onPress={() => {
              if (isSummary) {
                if (!isCompleted) {
                  completeLesson();
                } else {
                  router.back();
                }
              } else {
                setCurrentSection(prev => prev + 1);
              }
            }}
            variant="primary"
            size="lg"
            className="flex-1"
            style={{ backgroundColor: categoryColor }}
            rightIcon={
              isSummary ? (
                isCompleted ? <ArrowLeft size={20} color="white" /> : <CheckCircle size={20} color="white" />
              ) : (
                <ChevronRight size={20} color="white" />
              )
            }
          >
            {isSummary 
              ? (isCompleted ? 'Back to Lessons' : 'Complete Lesson')
              : 'Continue'
            }
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}