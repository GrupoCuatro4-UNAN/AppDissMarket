import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/ContextoAuth';
import LogoDissmar from '../components/LogoDissmar';


export default function PantallaEditarPerfil({ navigation }) {
  const { datosUsuario, actualizarPerfil } = useAuth();
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Cargar datos actuales del usuario
  useEffect(() => {
    if (datosUsuario) {
      setNombreCompleto(datosUsuario.nombreCompleto || '');
      setTelefono(datosUsuario.telefono || '');
      setDireccion(datosUsuario.direccion || '');
    }
  }, [datosUsuario]);

  // Función para validar los datos
  const validarDatos = () => {
    if (!nombreCompleto.trim()) {
      Alert.alert('Error', 'El nombre completo es obligatorio');
      return false;
    }
    if (!telefono.trim()) {
      Alert.alert('Error', 'El teléfono es obligatorio');
      return false;
    }
    if (!direccion.trim()) {
      Alert.alert('Error', 'La dirección es obligatoria');
      return false;
    }
    return true;
  };

  // Función para guardar cambios
  const manejarGuardarCambios = async () => {
    if (!validarDatos()) return;

    setGuardando(true);
    
    try {
      const resultado = await actualizarPerfil({
        nombreCompleto: nombreCompleto.trim(),
        telefono: telefono.trim(),
        direccion: direccion.trim()
      });

      if (resultado.success) {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
    } finally {
      setGuardando(false);
    }
  };

  // Función para cancelar edición
  const manejarCancelar = () => {
    Alert.alert(
      'Cancelar edición',
      '¿Estás seguro de que deseas cancelar? Los cambios no guardados, se perderán.',
      [
        {
          text: 'Continuar editando',
          style: 'cancel',
        },
        {
          text: 'Cancelar',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.contenedor}>
      {/* Header con navegación */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.botonAtras}
          onPress={manejarCancelar}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.tituloHeader}>
          <Text style={styles.textoTitulo}>Editar perfil</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.botonCancelar}
          onPress={manejarCancelar}
        >
          <Text style={styles.textoCancelar}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Logo y título */}
        <View style={styles.logoContainer}>
          <LogoDissmar size="medium" />
          <Text style={styles.eslogan}>Tu Distribuidora de Confianza</Text>
        </View>

        {/* Formulario de edición */}
        <View style={styles.formulario}>
          <Text style={styles.tituloFormulario}>Datos Personales</Text>
          
          {/* Campo Nombre */}
          <View style={styles.campoContainer}>
            <Ionicons name="person-outline" size={24} color="#666" style={styles.icono} />
            <View style={styles.inputContainer}>
              <Text style={styles.etiqueta}>Nombre</Text>
              <TextInput
                style={styles.input}
                value={nombreCompleto}
                onChangeText={setNombreCompleto}
                placeholder="Tu nombre completo"
                placeholderTextColor="#999"
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Campo Teléfono */}
          <View style={styles.campoContainer}>
            <Ionicons name="call-outline" size={24} color="#666" style={styles.icono} />
            <View style={styles.inputContainer}>
              <Text style={styles.etiqueta}>Teléfono</Text>
              <TextInput
                style={styles.input}
                value={telefono}
                onChangeText={setTelefono}
                placeholder="+505 8888-8888"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Campo Dirección */}
          <View style={styles.campoContainer}>
            <Ionicons name="location-outline" size={24} color="#666" style={styles.icono} />
            <View style={styles.inputContainer}>
              <Text style={styles.etiqueta}>Dirección</Text>
              <TextInput
                style={[styles.input, styles.inputMultilinea]}
                value={direccion}
                onChangeText={setDireccion}
                placeholder="Tu dirección completa"
                placeholderTextColor="#999"
                autoCapitalize="words"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Botón Guardar Cambios */}
          <TouchableOpacity 
            style={[styles.botonGuardar, guardando && styles.botonDeshabilitado]}
            onPress={manejarGuardarCambios}
            disabled={guardando}
          >
            {guardando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.textoBotonGuardar}>Guardar Cambios</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  botonAtras: {
    padding: 5,
  },
  tituloHeader: {
    flex: 1,
    alignItems: 'center',
  },
  textoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  botonCancelar: {
    padding: 5,
  },
  textoCancelar: {
    fontSize: 16,
    color: '#8B4513',
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 30,
    marginBottom: 20,
  },
  logoCirculo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoTexto: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoNombre: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 1,
  },
  eslogan: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 5,
  },
  formulario: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 20,
  },
  tituloFormulario: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 25,
  },
  campoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f8f8',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  icono: {
    marginRight: 15,
    marginTop: 5,
  },
  inputContainer: {
    flex: 1,
  },
  etiqueta: {
    fontSize: 12,
    color: '#8B4513',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 5,
  },
  inputMultilinea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  botonGuardar: {
    backgroundColor: '#8B4513',
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  botonDeshabilitado: {
    backgroundColor: '#ccc',
  },
  textoBotonGuardar: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});