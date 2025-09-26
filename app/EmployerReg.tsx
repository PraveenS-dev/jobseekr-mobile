import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import LottieView from 'lottie-react-native';
import { useTheme } from '@/services/Theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, "EmployerReg">;

const EmployerReg: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();

  return (
    <ScrollView contentContainerStyle={[styles.container]}>
      <LottieView
        source={require('@/assets/animations/coming-soon.json')}
        autoPlay
        loop
        style={[styles.animation]}
      />
      <Text style={[styles.title,]}>
        Coming Soon!
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Employer registration page is under construction. Stay tuned!
      </Text>

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
        >
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.accent }]}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Register' }] })}
        >
          <Text style={styles.buttonText}>Go to Register</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default EmployerReg;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  animation: {
    width: 250,
    height: 250,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
