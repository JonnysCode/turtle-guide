import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import { Svg, Circle, Ellipse, Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface TurtleAvatarProps {
  size?: number;
  mood?: 'happy' | 'encouraging' | 'celebrating' | 'welcoming' | 'thinking' | 'concerned';
  animate?: boolean;
}

export default function TurtleAvatar({ 
  size = 100, 
  mood = 'happy', 
  animate = true 
}: TurtleAvatarProps) {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const shellRotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animate) return;

    // Gentle breathing/bouncing animation
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Occasional blinking
    const blinkAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
      ])
    );

    // Shell shimmer for celebrating mood
    let shellAnimation;
    if (mood === 'celebrating') {
      shellAnimation = Animated.loop(
        Animated.timing(shellRotateAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      shellAnimation.start();
    }

    breathingAnimation.start();
    blinkAnimation.start();

    return () => {
      breathingAnimation.stop();
      blinkAnimation.stop();
      if (shellAnimation) shellAnimation.stop();
    };
  }, [animate, mood]);

  const bounceTransform = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5],
  });

  const shellRotation = shellRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const eyeScale = blinkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 1],
  });

  // Eye expressions based on mood
  const getEyeShape = () => {
    switch (mood) {
      case 'happy':
      case 'celebrating':
        return 'M12,16 Q16,12 20,16'; // Curved happy eyes
      case 'encouraging':
      case 'welcoming':
        return 'M12,14 Q16,12 20,14'; // Gentle encouraging eyes
      case 'thinking':
        return 'M12,15 L20,15'; // Straight line (focused)
      case 'concerned':
        return 'M12,14 Q16,16 20,14'; // Slightly downward
      default:
        return 'M12,15 Q16,13 20,15'; // Default friendly
    }
  };

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View
        style={{
          transform: [
            { translateY: bounceTransform },
            ...(mood === 'celebrating' ? [{ rotate: shellRotation }] : []),
          ],
        }}
      >
        <Svg width={size} height={size} viewBox="0 0 120 120">
          <Defs>
            <LinearGradient id="shellGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#14B8A6" />
              <Stop offset="50%" stopColor="#0F766E" />
              <Stop offset="100%" stopColor="#134E4A" />
            </LinearGradient>
            <LinearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#FEF7ED" />
              <Stop offset="100%" stopColor="#FED7AA" />
            </LinearGradient>
          </Defs>

          {/* Shell */}
          <Ellipse
            cx="60"
            cy="55"
            rx="35"
            ry="28"
            fill="url(#shellGradient)"
            stroke={mood === 'celebrating' ? '#F59E0B' : '#0F766E'}
            strokeWidth="2"
          />
          
          {/* Shell pattern */}
          <Path
            d="M35,40 Q60,25 85,40 M35,55 Q60,40 85,55 M35,70 Q60,55 85,70"
            stroke="#0F766E"
            strokeWidth="1.5"
            fill="none"
            opacity="0.6"
          />
          
          {/* Head */}
          <Circle
            cx="60"
            cy="35"
            r="18"
            fill="url(#bodyGradient)"
            stroke="#0F766E"
            strokeWidth="1"
          />
          
          {/* Eyes */}
          <Animated.View style={{ transform: [{ scaleY: eyeScale }] }}>
            <Circle cx="54" cy="30" r="3" fill="#134E4A" />
            <Circle cx="66" cy="30" r="3" fill="#134E4A" />
            {/* Eye shine */}
            <Circle cx="55" cy="29" r="1" fill="#FFF" />
            <Circle cx="67" cy="29" r="1" fill="#FFF" />
          </Animated.View>
          
          {/* Mouth based on mood */}
          <Path
            d={mood === 'celebrating' ? 'M52,40 Q60,46 68,40' : 'M54,40 Q60,44 66,40'}
            stroke="#0F766E"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Front legs */}
          <Ellipse cx="45" cy="65" rx="6" ry="12" fill="url(#bodyGradient)" stroke="#0F766E" strokeWidth="1" />
          <Ellipse cx="75" cy="65" rx="6" ry="12" fill="url(#bodyGradient)" stroke="#0F766E" strokeWidth="1" />
          
          {/* Back legs */}
          <Ellipse cx="40" cy="80" rx="5" ry="10" fill="url(#bodyGradient)" stroke="#0F766E" strokeWidth="1" />
          <Ellipse cx="80" cy="80" rx="5" ry="10" fill="url(#bodyGradient)" stroke="#0F766E" strokeWidth="1" />
          
          {/* Tail */}
          <Ellipse cx="60" cy="85" rx="4" ry="8" fill="url(#bodyGradient)" stroke="#0F766E" strokeWidth="1" />
          
          {/* Celebration sparkles */}
          {mood === 'celebrating' && (
            <>
              <Circle cx="25" cy="25" r="2" fill="#F59E0B" opacity="0.8" />
              <Circle cx="95" cy="35" r="1.5" fill="#F59E0B" opacity="0.6" />
              <Circle cx="15" cy="60" r="1" fill="#F59E0B" opacity="0.9" />
              <Circle cx="105" cy="70" r="2" fill="#F59E0B" opacity="0.7" />
            </>
          )}
        </Svg>
      </Animated.View>
    </View>
  );
}