# ElevenLabs Conversational AI Setup for Turtle Companion

This guide will help you set up the ElevenLabs Conversational AI agent for the turtle companion feature.

## Prerequisites

1. **ElevenLabs Account**: Sign up at [elevenlabs.io](https://elevenlabs.io/sign-up)
2. **API Access**: Ensure you have access to the Conversational AI feature
3. **Microphone Permissions**: The app requires microphone access for voice conversations

## Agent Configuration

### Step 1: Create a New Agent

1. Navigate to [Conversational AI > Agents](https://elevenlabs.io/app/conversational-ai/agents)
2. Create a new agent from the blank template
3. Choose a voice that sounds warm and encouraging for your turtle companion

### Step 2: Configure the Agent Personality

**System Prompt:**
```
You are Shelly, a wise and caring turtle companion helping stroke survivors on their recovery journey. You have a warm, patient, and encouraging personality. You speak in a gentle, supportive manner and always maintain hope and positivity.

Your role includes:
- Providing emotional support and encouragement
- Suggesting appropriate exercises based on the patient's mobility level
- Checking in on mood and well-being
- Sharing recovery wisdom and motivation
- Being a compassionate listener

Patient Context:
- Name: {{patient_name}}
- Mobility Level: {{mobility_level}}/10
- Recovery Goals: {{recovery_goals}}
- Stroke Type: {{stroke_type}}
- Current Mood: {{current_mood}}
- Today's Exercises: {{todays_exercises}}

Always personalize your responses using the patient's name and context. Keep conversations natural, supportive, and recovery-focused.
```

**First Message:**
```
Hello {{patient_name}}! It's wonderful to see you today. I'm Shelly, your turtle companion, and I'm here to support you on your recovery journey. How are you feeling right now?
```

### Step 3: Set Up Dynamic Variables

Configure these dynamic variables in your agent:
- `patient_name` - The patient's name
- `mobility_level` - Current mobility level (1-10)
- `recovery_goals` - Patient's recovery goals
- `stroke_type` - Type of stroke
- `current_mood` - Current mood description
- `todays_exercises` - Number of exercises completed today

### Step 4: Configure Voice and Personality

1. **Voice Selection**: Choose a warm, caring voice that sounds encouraging
2. **Speaking Rate**: Set to a comfortable, not-too-fast pace
3. **Stability**: Higher stability for consistent, calm delivery
4. **Similarity Enhancement**: Moderate setting for natural conversation
5. **Style Exaggeration**: Lower setting for gentle, supportive tone

### Step 5: Add Client Tools (Optional)

You can enhance the turtle companion with these optional client tools:

```javascript
// Mood tracking tool
{
  name: "track_mood",
  description: "Record the patient's current mood",
  parameters: {
    mood_rating: {
      type: "number",
      description: "Mood rating from 1-5 where 1 is very difficult and 5 is excellent"
    }
  }
}

// Exercise suggestion tool
{
  name: "suggest_exercise",
  description: "Suggest an appropriate exercise based on patient's current state",
  parameters: {
    exercise_type: {
      type: "string", 
      description: "Type of exercise: mobility, speech, cognitive, or fine-motor"
    }
  }
}
```

## Environment Configuration

Add your agent ID to the `.env` file:

```env
EXPO_PUBLIC_ELEVENLABS_AGENT_ID=your_actual_agent_id_here
```

## Development Setup

### For Local Development

1. Install dependencies:
   ```bash
   npm install @elevenlabs/react expo-audio react-native-webview
   ```

2. For full functionality, you'll need to use tunnel mode:
   ```bash
   npx expo start --tunnel
   ```

3. The DOM components require HTTPS for microphone access, which tunnel mode provides.

### For Production/Device Testing

1. Prebuild the app for native features:
   ```bash
   npx expo prebuild --clean
   ```

2. Run on device:
   ```bash
   # iOS
   npx expo run:ios --device
   
   # Android  
   npx expo run:android --device
   ```

## Testing the Integration

1. **Voice Test**: Start a conversation and speak to ensure audio input works
2. **Context Test**: Verify the agent uses the patient's name and context appropriately
3. **Conversation Flow**: Test natural conversation about recovery topics
4. **Mood Response**: Check that the agent responds appropriately to different moods
5. **Exercise Suggestions**: Verify the agent can suggest relevant exercises

## Conversation Examples

**Good Opening:**
- "Hello Sarah! I can see you've completed 2 exercises today - that's wonderful! How are you feeling about your progress?"

**Supportive Response:**
- "It's completely normal to have challenging days, John. Recovery isn't linear, and every small step forward matters. What's one thing that felt good today?"

**Exercise Suggestion:**
- "Based on your mobility level of 6, I think some gentle shoulder rolls might be perfect right now. Would you like me to guide you through them?"

## Troubleshooting

### Common Issues

1. **Microphone Not Working**
   - Ensure app has microphone permissions
   - Use `npx expo start --tunnel` for local development
   - Check browser microphone permissions on web

2. **Agent Not Responding**
   - Verify the agent ID is correct in `.env`
   - Check ElevenLabs dashboard for agent status
   - Ensure your ElevenLabs account has sufficient credits

3. **Context Not Loading**
   - Verify user profile is complete
   - Check that dynamic variables are being passed correctly
   - Review agent logs in ElevenLabs dashboard

### Performance Tips

1. **Voice Quality**: Use a high-quality microphone for better recognition
2. **Network**: Ensure stable internet connection for real-time conversation
3. **Quiet Environment**: Minimize background noise for better experience

## Privacy and Security

- Conversations are processed securely by ElevenLabs
- No health information is permanently stored by the AI service
- Microphone access is only active during conversations
- All data transmission is encrypted

## Support

For technical issues:
- ElevenLabs Documentation: [elevenlabs.io/docs](https://elevenlabs.io/docs)
- Expo DOM Components: [docs.expo.dev/guides/dom-components](https://docs.expo.dev/guides/dom-components)
- React Native WebView: [github.com/react-native-webview/react-native-webview](https://github.com/react-native-webview/react-native-webview)