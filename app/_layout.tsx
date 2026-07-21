import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0EA5E9',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Skin Health Assistant', headerLargeTitle: true }} />
      <Stack.Screen name="camera" options={{ title: 'Capture Image', presentation: 'fullScreenModal', headerShown: false }} />
      <Stack.Screen name="form" options={{ title: 'Symptoms & Context' }} />
      <Stack.Screen name="results" options={{ title: 'AI Analysis', headerLargeTitle: true }} />
    </Stack>
  );
}