'use dom';

import { useConversation } from '@elevenlabs/react';
import { Mic, MicOff, PhoneOff } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

async function requestMicrophonePermission() {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    return true;
  } catch (error) {
    console.error('Microphone permission denied:', error);
    return false;
  }
}

export default function TurtleConversationAI({
                                               patientName,
                                               mobilityLevel,
                                               recoveryGoals,
                                               strokeType,
                                               currentMood,
                                               todaysExercises,
                                               onEndConversation
                                             }: {
  dom?: import('expo/dom').DOMProps;
  patientName: string;
  mobilityLevel: number;
  recoveryGoals: string[];
  strokeType: string;
  currentMood: string;
  todaysExercises: number;
  onEndConversation: () => void;
}) {
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  const conversation = useConversation({
    onConnect: () => {
      console.log('Turtle AI Connected');
      setConnectionStatus('connected');
    },
    onDisconnect: () => {
      console.log('Turtle AI Disconnected');
      setConnectionStatus('disconnected');
    },
    onMessage: (message) => {
      console.log('Turtle AI Message:', message);
    },
    onError: (error) => {
      console.error('Turtle AI Error:', error);
      setConnectionStatus('disconnected');
    }
  });

  const startConversation = useCallback(async () => {
    try {
      setConnectionStatus('connecting');

      // Request microphone permission
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        Alert.alert('Microphone Permission Required', 'Please allow microphone access to chat with your turtle companion.');
        setConnectionStatus('disconnected');
        return;
      }

      // Start the conversation with your turtle agent
      await conversation.startSession({
        agentId: process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID || 'YOUR_AGENT_ID', // Replace with your agent ID
        dynamicVariables: {
          patient_name: patientName,
          mobility_level: mobilityLevel.toString(),
          recovery_goals: recoveryGoals.join(', '),
          stroke_type: strokeType,
          current_mood: currentMood,
          todays_exercises: todaysExercises.toString()
        },
        clientTools: {
          // Add any client tools you want the turtle to access
        }
      });
    } catch (error) {
      console.error('Failed to start turtle conversation:', error);
      setConnectionStatus('disconnected');
      Alert.alert('Connection Error', 'Failed to connect to your turtle companion. Please try again.');
    }
  }, [conversation, patientName, mobilityLevel, recoveryGoals, strokeType, currentMood, todaysExercises]);

  const endConversation = useCallback(async () => {
    try {
      await conversation.endSession();
      onEndConversation();
    } catch (error) {
      console.error('Failed to end conversation:', error);
      onEndConversation();
    }
  }, [conversation, onEndConversation]);

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connecting':
        return 'Connecting to your turtle...';
      case 'connected':
        return 'Your turtle is listening...';
      default:
        return 'Tap to start talking with your turtle';
    }
  };

  const getButtonColor = () => {
    switch (connectionStatus) {
      case 'connecting':
        return '#F59E0B';
      case 'connected':
        return '#EF4444';
      default:
        return '#418D84';
    }
  };

  const getButtonIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <MicOff size={32} color="#F6F4F1" />;
      default:
        return <Mic size={32} color="#F6F4F1" />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.statusText}>{getStatusText()}</Text>

        <Pressable
          style={[
            styles.micButton,
            { backgroundColor: getButtonColor() },
            connectionStatus === 'connecting' && styles.pulsing
          ]}
          onPress={connectionStatus === 'disconnected' ? startConversation : endConversation}
          disabled={connectionStatus === 'connecting'}
        >
          {getButtonIcon()}
        </Pressable>

        {connectionStatus === 'connected' && (
          <Pressable
            style={styles.endButton}
            onPress={endConversation}
          >
            <PhoneOff size={20} color="#EF4444" />
            <Text style={styles.endButtonText}>End Chat</Text>
          </Pressable>
        )}

        <Text style={styles.instructionText}>
          {connectionStatus === 'connected'
            ? 'Speak naturally - your turtle companion is here to help!'
            : 'Your turtle companion can help with exercises, mood check-ins, and recovery support.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  content: {
    alignItems: 'center',
    maxWidth: 300
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1F16',
    textAlign: 'center',
    marginBottom: 32
  },
  micButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  pulsing: {
    opacity: 0.8
  },
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 24
  },
  endButtonText: {
    color: '#EF4444',
    fontWeight: '600',
    marginLeft: 8
  },
  instructionText: {
    fontSize: 14,
    color: '#418D84',
    textAlign: 'center',
    lineHeight: 20
  }
});