import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Skin Assistant</Text>
        <Text style={styles.subtitle}>
          Get instant, AI-powered insights about your skin health. Please choose what you would like to analyze today.
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => router.push({ pathname: '/camera', params: { type: 'face' } })}
          >
            <Text style={styles.buttonText}>Analyze Face</Text>
            <Text style={styles.buttonSubText}>Auto-detects and crops to your face</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => router.push({ pathname: '/camera', params: { type: 'body' } })}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Analyze Body</Text>
            <Text style={[styles.buttonSubText, styles.secondaryButtonText]}>Standard image capture</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#0EA5E9',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  buttonSubText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  secondaryButtonText: {
    color: '#0F172A',
  },
});