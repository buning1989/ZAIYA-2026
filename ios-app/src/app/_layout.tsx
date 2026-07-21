import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: true,
          headerBackTitle: '返回',
          headerTitleStyle: { fontSize: 17 },
          contentStyle: { backgroundColor: '#FFFFFF' },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="chat" options={{ title: '和在在说说' }} />
        <Stack.Screen name="sleep" options={{ title: '记一下睡眠' }} />
        <Stack.Screen name="review" options={{ title: '回头看看' }} />
      </Stack>
    </ThemeProvider>
  );
}
