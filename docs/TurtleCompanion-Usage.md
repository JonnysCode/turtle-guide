# TurtleCompanion Usage Guide

The TurtleCompanion component brings your turtle mascot images to life as an interactive app companion that users can speak and interact with throughout their recovery journey.

## Basic Usage

```tsx
import TurtleCompanion from '@/components/TurtleCompanion';

// Simple turtle companion
<TurtleCompanion 
  size={120}
  mood="main"
  message="Hello! I'm here to help you on your recovery journey."
  animate={true}
/>
```

## Available Moods

Each mood corresponds to a PNG image in `assets/images/turtle/`:

- **main** - Default friendly turtle (turtle-main.png)
- **excited** - High energy for exercises (turtle-excited.png)
- **great** - Celebrating success (turtle-great.png)
- **hi** - Welcoming greeting (turtle-hi.png)
- **idea** - Thoughtful and inspiring (turtle-idea.png)
- **love** - Warm and supportive (turtle-love.png)
- **meditation** - Calm and peaceful (turtle-meditation.png)
- **questioning** - Curious and attentive (turtle-questioning.png)
- **sad** - Empathetic and understanding (turtle-sad.png)
- **speech** - Communication focused (turtle-speech.png)
- **wave-left** - Greeting gesture (turtle-wave-left.png)
- **wave-right** - Farewell gesture (turtle-wave-right.png)
- **writing** - Sharing wisdom (turtle-writing.png)

## Interactive Features

### Speech Bubbles
```tsx
<TurtleCompanion 
  mood="excited"
  message="Great job on completing that exercise!"
  showMessage={true}
  onTap={() => console.log('Turtle tapped!')}
/>
```

### Speech Synthesis (Optional)
```tsx
<TurtleCompanion 
  mood="speech"
  message="Let's practice some words together!"
  enableSpeech={true}
  onSpeech={(text) => {
    // Implement text-to-speech here
    console.log('Speaking:', text);
  }}
/>
```

## Predefined Presets

Use common scenarios with the `TurtleCompanionPresets`:

```tsx
import TurtleCompanion, { TurtleCompanionPresets } from '@/components/TurtleCompanion';

// Welcome scenario
<TurtleCompanion {...TurtleCompanionPresets.welcome} />

// Exercise motivation
<TurtleCompanion {...TurtleCompanionPresets.exercise} />

// Celebration
<TurtleCompanion {...TurtleCompanionPresets.celebration} />
```

## Smart Mood Selection

Use the helper function for context-aware mood selection:

```tsx
import { getTurtleMoodForContext } from '@/components/TurtleCompanion';

const mood = getTurtleMoodForContext('exercise'); // Returns 'excited'
const mood2 = getTurtleMoodForContext('meditation'); // Returns 'meditation'
```

## Real-World Examples

### Home Page Welcome
```tsx
<TurtleCompanion
  size={140}
  mood="hi"
  message="Good morning! How are you feeling today?"
  showMessage={true}
  onTap={() => openChatInterface()}
  animate={true}
/>
```

### Exercise Encouragement
```tsx
<TurtleCompanion
  size={120}
  mood={isExercising ? "excited" : "meditation"}
  message={isExercising ? "You're doing amazing!" : "Take your time and breathe."}
  showMessage={isExercising}
  animate={true}
/>
```

### Learning Support
```tsx
<TurtleCompanion
  size={100}
  mood="idea"
  message="Ready to learn something new? I love discovering things with you!"
  showMessage={false}
  onTap={() => setShowMessage(true)}
/>
```

### Progress Celebration
```tsx
<TurtleCompanion
  size={160}
  mood="great"
  message="Look at all you've accomplished! Your progress makes my shell sparkle!"
  showMessage={true}
  animate={true}
/>
```

## Animation Options

The component includes several built-in animations:

- **Floating animation** - Gentle up/down movement
- **Pulse animation** - Subtle scale breathing effect
- **Speech indicators** - Visual feedback during speech
- **Tap feedback** - Scale animation on interaction

Disable animations for performance:
```tsx
<TurtleCompanion animate={false} />
```

## Styling & Layout

The component is designed for vertical aspect ratio images and automatically calculates proper dimensions:

```tsx
// Customize size (maintains aspect ratio)
<TurtleCompanion size={200} /> // 200px height, ~150px width

// Add custom styling
<TurtleCompanion className="mb-8 mx-auto" />
```

## Integration Tips

1. **Context-Appropriate Moods**: Match turtle mood to user's current activity
2. **Message Timing**: Use `showMessage` strategically to avoid overwhelming users
3. **Accessibility**: Ensure message text is readable and provides value
4. **Performance**: Use `animate={false}` on lower-end devices if needed
5. **User Agency**: Always provide ways for users to interact with or dismiss the turtle

## Emotional Support Guidelines

When using the turtle for emotional support:

- Use **'sad'** mood for difficult moments with empathetic messages
- Use **'love'** mood for encouragement and support
- Use **'questioning'** mood for check-ins and gathering feedback
- Always provide hope and forward-looking messages
- Keep messages personal but not overwhelming

This companion system creates a consistent, supportive presence throughout the user's recovery journey while maintaining the calming, nature-bound experience of the app.