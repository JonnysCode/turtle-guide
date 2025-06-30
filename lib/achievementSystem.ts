import { supabase } from './supabase';

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  category: 'exercise' | 'consistency' | 'learning' | 'milestone' | 'mood' | 'special';
  requirement: string;
  points: number;
  checkCondition: (stats: UserStats) => boolean;
}

export interface UserStats {
  totalExercises: number;
  totalLessons: number;
  currentStreak: number;
  longestStreak: number;
  moodTrackingDays: number;
  exercisesThisWeek: number;
  lessonsThisWeek: number;
  userId: string;
}

export const achievementDefinitions: AchievementDefinition[] = [
  {
    id: 'first_exercise',
    title: 'First Steps',
    description: 'Completed your very first exercise',
    category: 'exercise',
    requirement: 'Complete 1 exercise',
    points: 10,
    checkCondition: (stats) => stats.totalExercises >= 1
  },
  {
    id: 'exercise_streak_3',
    title: 'Building Momentum',
    description: 'Exercised for 3 days in a row',
    category: 'consistency',
    requirement: '3-day exercise streak',
    points: 25,
    checkCondition: (stats) => stats.currentStreak >= 3
  },
  {
    id: 'exercise_streak_7',
    title: 'Week Warrior',
    description: 'Maintained a 7-day exercise streak',
    category: 'consistency',
    requirement: '7-day exercise streak',
    points: 50,
    checkCondition: (stats) => stats.currentStreak >= 7
  },
  {
    id: 'exercise_master_10',
    title: 'Getting Started',
    description: 'Completed 10 total exercises',
    category: 'milestone',
    requirement: 'Complete 10 exercises',
    points: 30,
    checkCondition: (stats) => stats.totalExercises >= 10
  },
  {
    id: 'exercise_master_25',
    title: 'Exercise Champion',
    description: 'Completed 25 total exercises',
    category: 'milestone',
    requirement: 'Complete 25 exercises',
    points: 75,
    checkCondition: (stats) => stats.totalExercises >= 25
  },
  {
    id: 'exercise_master_50',
    title: 'Fitness Guru',
    description: 'Completed 50 total exercises',
    category: 'milestone',
    requirement: 'Complete 50 exercises',
    points: 100,
    checkCondition: (stats) => stats.totalExercises >= 50
  },
  {
    id: 'learning_enthusiast',
    title: 'Knowledge Seeker',
    description: 'Completed 3 learning modules',
    category: 'learning',
    requirement: 'Complete 3 lessons',
    points: 40,
    checkCondition: (stats) => stats.totalLessons >= 3
  },
  {
    id: 'learning_master',
    title: 'Wisdom Collector',
    description: 'Completed 5 learning modules',
    category: 'learning',
    requirement: 'Complete 5 lessons',
    points: 60,
    checkCondition: (stats) => stats.totalLessons >= 5
  },
  {
    id: 'mood_tracker_7',
    title: 'Self-Aware Soul',
    description: 'Tracked your mood for 7 consecutive days',
    category: 'mood',
    requirement: 'Track mood for 7 days',
    points: 30,
    checkCondition: (stats) => stats.moodTrackingDays >= 7
  },
  {
    id: 'weekly_warrior',
    title: 'Weekly Warrior',
    description: 'Completed 5 exercises in one week',
    category: 'special',
    requirement: '5 exercises in one week',
    points: 35,
    checkCondition: (stats) => stats.exercisesThisWeek >= 5
  }
];

export async function getUserStats(userId: string): Promise<UserStats> {
  try {
    console.log('Getting user stats for:', userId);

    // Get total exercises - this is the most important for "First Steps"
    const { count: totalExercises } = await supabase
      .from('exercise_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('completed', true);

    console.log('Total exercises found:', totalExercises);

    // Get total lessons
    const { count: totalLessons } = await supabase
      .from('education_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('completed', true);

    // Get daily progress for streak calculation
    const { data: progressData } = await supabase
      .from('daily_progress')
      .select('date, exercises_completed, mood_rating')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30);

    // Calculate streaks and mood tracking
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let moodTrackingDays = 0;

    if (progressData && progressData.length > 0) {
      const today = new Date();
      const sortedData = [...progressData].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // Calculate current streak - only count days with exercises > 0
      for (let i = 0; i < sortedData.length; i++) {
        const progressDate = new Date(sortedData[i].date);
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);

        // Check if this is the expected consecutive day AND has exercises
        if (progressDate.toDateString() === expectedDate.toDateString() && 
            sortedData[i].exercises_completed > 0) {
          currentStreak++;
        } else if (progressDate.toDateString() === expectedDate.toDateString() && 
                   sortedData[i].exercises_completed === 0) {
          // If it's the expected day but no exercises, break the streak
          break;
        }
        // If it's not the expected day, we might have a gap, so break
        else if (progressDate.toDateString() !== expectedDate.toDateString()) {
          break;
        }
      }

      // Calculate longest streak and mood tracking days
      for (const progress of sortedData) {
        if (progress.exercises_completed > 0) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }

        if (progress.mood_rating !== null) {
          moodTrackingDays++;
        }
      }
    }

    // Get exercises this week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const { count: exercisesThisWeek } = await supabase
      .from('exercise_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('completed', true)
      .gte('created_at', weekStart.toISOString());

    // Get lessons this week
    const { count: lessonsThisWeek } = await supabase
      .from('education_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('completed', true)
      .gte('completed_at', weekStart.toISOString());

    const stats = {
      totalExercises: totalExercises || 0,
      totalLessons: totalLessons || 0,
      currentStreak,
      longestStreak,
      moodTrackingDays,
      exercisesThisWeek: exercisesThisWeek || 0,
      lessonsThisWeek: lessonsThisWeek || 0,
      userId
    };

    console.log('Final user stats:', stats);
    return stats;
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      totalExercises: 0,
      totalLessons: 0,
      currentStreak: 0,
      longestStreak: 0,
      moodTrackingDays: 0,
      exercisesThisWeek: 0,
      lessonsThisWeek: 0,
      userId
    };
  }
}

export async function checkAndAwardAchievements(userId: string): Promise<string[]> {
  try {
    console.log('Checking achievements for user:', userId);

    // Get current user stats
    const stats = await getUserStats(userId);
    console.log('User stats for achievement check:', stats);

    // Get already unlocked achievements
    const { data: existingAchievements } = await supabase
      .from('achievements')
      .select('achievement_type')
      .eq('user_id', userId);

    const unlockedAchievementIds = existingAchievements?.map(a => a.achievement_type) || [];
    console.log('Already unlocked achievements:', unlockedAchievementIds);

    // Check which achievements should be unlocked
    const newAchievements: string[] = [];

    for (const achievement of achievementDefinitions) {
      const isAlreadyUnlocked = unlockedAchievementIds.includes(achievement.id);
      const shouldBeUnlocked = achievement.checkCondition(stats);
      
      console.log(`Checking ${achievement.id}:`, {
        isAlreadyUnlocked,
        shouldBeUnlocked,
        condition: achievement.checkCondition.toString()
      });

      if (!isAlreadyUnlocked && shouldBeUnlocked) {
        console.log(`Awarding achievement: ${achievement.title}`);
        
        // Award the achievement
        const { error } = await supabase
          .from('achievements')
          .insert({
            user_id: userId,
            achievement_type: achievement.id,
            unlocked_at: new Date().toISOString()
          });

        if (!error) {
          newAchievements.push(achievement.id);
          console.log(`Successfully awarded: ${achievement.title}`);
        } else {
          console.error('Error awarding achievement:', achievement.id, error);
        }
      }
    }

    console.log('New achievements awarded:', newAchievements);
    return newAchievements;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
}

export async function getAchievementProgress(userId: string) {
  const stats = await getUserStats(userId);
  const { data: unlockedAchievements } = await supabase
    .from('achievements')
    .select('achievement_type')
    .eq('user_id', userId);

  const unlockedIds = unlockedAchievements?.map(a => a.achievement_type) || [];

  return achievementDefinitions.map(achievement => {
    const isUnlocked = unlockedIds.includes(achievement.id);
    const progress = isUnlocked ? 1 : getProgressTowardsAchievement(achievement, stats);
    
    return {
      ...achievement,
      isUnlocked,
      progress
    };
  });
}

function getProgressTowardsAchievement(achievement: AchievementDefinition, stats: UserStats): number {
  switch (achievement.id) {
    case 'first_exercise':
      return Math.min(stats.totalExercises / 1, 1);
    case 'exercise_streak_3':
      return Math.min(stats.currentStreak / 3, 1);
    case 'exercise_streak_7':
      return Math.min(stats.currentStreak / 7, 1);
    case 'exercise_master_10':
      return Math.min(stats.totalExercises / 10, 1);
    case 'exercise_master_25':
      return Math.min(stats.totalExercises / 25, 1);
    case 'exercise_master_50':
      return Math.min(stats.totalExercises / 50, 1);
    case 'learning_enthusiast':
      return Math.min(stats.totalLessons / 3, 1);
    case 'learning_master':
      return Math.min(stats.totalLessons / 5, 1);
    case 'mood_tracker_7':
      return Math.min(stats.moodTrackingDays / 7, 1);
    case 'weekly_warrior':
      return Math.min(stats.exercisesThisWeek / 5, 1);
    default:
      return 0;
  }
}