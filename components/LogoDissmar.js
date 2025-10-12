import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

export default function LogoDissmar({ size = 'medium', showText = true }) {
  const logoSize = size === 'large' ? 100 : size === 'small' ? 40 : 60;
  const textSize = size === 'large' ? 24 : size === 'small' ? 16 : 20;

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/images/logo-dissmar.png')} 
        style={[styles.logo, { width: logoSize, height: logoSize }]}
        resizeMode="contain"
      />
      {showText && (
        <Text style={[styles.texto, { fontSize: textSize }]}>DISSMAR</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  logo: {
    marginBottom: 5,
  },
  texto: {
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 1,
  },
});