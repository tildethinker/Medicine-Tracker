import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { LoginScreen } from './LoginScreen';
import { SignUpScreen } from './SignUpScreen';

export const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <View style={styles.container}>
      {isLogin ? (
        <LoginScreen onSwitchToSignUp={() => setIsLogin(false)} />
      ) : (
        <SignUpScreen onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
