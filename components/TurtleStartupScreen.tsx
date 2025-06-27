import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import TurtleIntroduction from './TurtleIntroduction';
import { supabase } from '@/lib/supabase';

export default function TurtleStartupScreen() {
  const { user, showTurtleIntro, completeTurtleIntro } = useAuth();
  const { updateProfile } = useUser();

  const handleTurtleIntroComplete = async (mood: string | null) => {
    // Save mood to daily progress if provided
    if (mood && user) {
      const moodMap: { [key: string]: number } = {
        'positive': 5,
        'hopeful': 4,
        'neutral': 3,
        'tired': 2,
        'frustrated': 1
      };
      
      const rating = moodMap[mood] || 3;
      const today = new Date().toISOString().split('T')[0];
      
      try {
        await supabase
          .from('daily_progress')
          .upsert({
            user_id: user.id,
            date: today,
            mood_rating: rating,
            exercises_completed: 0
          });
      } catch (error) {
        console.error('Error saving mood:', error);
      }
    }
    
    // Complete the turtle intro
    completeTurtleIntro();
  };

  // Only show if user is logged in and turtle intro should be shown
  if (!user || !showTurtleIntro) {
    return null;
  }

  return (
    <TurtleIntroduction 
      onComplete={handleTurtleIntroComplete}
      isStartupScreen={true}
    />
  );
}