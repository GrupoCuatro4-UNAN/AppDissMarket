import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image
} from 'react-native';

export default function PantallaSplash() {
  return (
    <View style={styles.contenedor}>
      {/* Logo de DISSMAR */}
      <View style={styles.contenedorLogo}>
        <View style={styles.logoCirculo}>
          <Text style={styles.logoTextoGrande}>Dd</Text>
        </View>
        <Text style={styles.logoTexto}>DISSMAR</Text>
        <Text style={styles.logoSubtexto}>DISTRIBUIDORA</Text>
      </View>

      <Text style={styles.eslogan}>Tu Distribuidora de Confianza</Text>

      {/* Indicador de carga */}
      <ActivityIndicator 
        size="large" 
        color="#8B4513" 
        style={styles.cargando} 
      />
      
      <Text style={styles.textoCargando}>Cargando...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  contenedorLogo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCirculo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  logoTextoGrande: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoTexto: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 2,
  },
  logoSubtexto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    letterSpacing: 1,
    marginTop: 5,
  },
  eslogan: {
    fontSize: 18,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 50,
  },
  cargando: {
    marginVertical: 20,
  },
  textoCargando: {
    fontSize: 16,
    color: '#8B4513',
    fontWeight: '500',
  },
});