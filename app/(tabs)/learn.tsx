import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BookOpen, Brain, CircleCheck as CheckCircle, ChevronRight, Clock, Heart, Moon, Play } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import TurtleCompanion from '@/components/TurtleCompanion';
import { supabase } from '@/lib/supabase';

interface Lesson {
  id: string;
  title: string;
  category: 'basics' | 'lifestyle' | 'exercises' | 'mental-health';
  difficulty: 'beginner' | 'intermediate';
  duration: number;
  description: string;
}

const lessons: Lesson[] = [
  {
    id: 'understanding-stroke',
    title: 'Understanding Stroke Recovery',
    category: 'basics',
    difficulty: 'beginner',
    duration: 8,
    description: 'Learn the basics of stroke and the recovery process'
  },
  {
    id: 'nutrition-healing',
    title: 'Nutrition for Healing',
    category: 'lifestyle',
    difficulty: 'beginner',
    duration: 6,
    description: 'Foods that support brain health and recovery'
  },
  {
    id: 'emotional-wellbeing',
    title: 'Managing Emotions After Stroke',
    category: 'mental-health',
    difficulty: 'intermediate',
    duration: 10,
    description: 'Understanding and coping with emotional changes'
  },
  {
    id: 'sleep-recovery',
    title: 'Sleep and Recovery',
    category: 'lifestyle',
    difficulty: 'beginner',
    duration: 7,
    description: 'The importance of good sleep for healing'
  },
  {
    id: 'building-confidence',
    title: 'Building Confidence After Stroke',
    category: 'mental-health',
    difficulty: 'intermediate',
    duration: 12,
    description: 'Rebuilding self-confidence and independence'
  },
  {
    id: 'communication-strategies',
    title: 'Communication Strategies',
    category: 'basics',
    difficulty: 'intermediate',
    duration: 9,
    description: 'Effective ways to communicate after stroke'
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
  const router = useRouter();
  const { user } = useAuth();
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

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

  const navigateToLesson = (lessonId: string) => {
    router.push(`/lesson/${lessonId}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-chalk" edges={['top', 'left', 'right']}>
      <ScrollView 
        className="flex-1 px-6" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }} // Add padding for tab bar
      >
        <View className="py-6">
          <View className="items-center mb-6">
            <TurtleCompanion
              size={100}
              mood="idea"
              message="Learning something new today? I love discovering things together with you!"
              showMessage={false}
              animate={true}
            />
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
                You've completed {completedLessons.length} lesson{completedLessons.length > 1 ? 's' : ''}! Keep up the
                great work!
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
                  onPress={() => navigateToLesson(lesson.id)}
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
                            <Clock size={10} color="#418D84" /> {lesson.duration} min read
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
                        <View className="bg-blue-glass px-2 py-1 rounded ml-2">
                          <Text className="text-royal-palm font-inter text-xs capitalize">
                            {lesson.difficulty}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row items-center mt-2">
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
                        <View className="bg-blue-glass px-2 py-1 rounded ml-2">
                          <Text className="text-royal-palm font-inter text-xs capitalize">
                            {lesson.difficulty}
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
              "Take your time with each lesson - there's no rush! Understanding comes gradually, just like everything in
              recovery. I'll be here whenever you're ready to learn something new."
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}