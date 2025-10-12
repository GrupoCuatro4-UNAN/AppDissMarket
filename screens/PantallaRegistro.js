import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import LogoDissmar from '../components/LogoDissmar';


export default function PantallaRegistro({ navigation }) {
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [email, setEmail] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  const [cargando, setCargando] = useState(false);

  const validarFormulario = () => {
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
    if (!email.trim()) {
      Alert.alert('Error', 'El correo electrónico es obligatorio');
      return false;
    }
    if (!contraseña.trim()) {
      Alert.alert('Error', 'La contraseña es obligatoria');
      return false;
    }
    if (contraseña.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    return true;
  };

  const manejarRegistro = async () => {
    if (!validarFormulario()) return;

    setCargando(true);
    
    try {
      // Crear usuario en Firebase
      const { user } = await createUserWithEmailAndPassword(
        auth, 
        email.trim(), 
        contraseña
      );
      
      // Actualizar el perfil del usuario
      await updateProfile(user, {
        displayName: nombreCompleto.trim()
      });

      // Guardar datos adicionales en la base de datos
      await setDoc(doc(db, 'usuarios', user.uid), {
        email: email.trim().toLowerCase(),
        nombreCompleto: nombreCompleto.trim(),
        telefono: telefono.trim(),
        direccion: direccion.trim(),
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      });

      Alert.alert(
        '¡Registro exitoso!', 
        'Tu cuenta ha sido creada correctamente',
        [
          {
            text: 'OK',
            onPress: () => {
              
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      let mensajeError = 'Error al crear la cuenta';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          mensajeError = 'Este correo electrónico ya está registrado';
          break;
        case 'auth/weak-password':
          mensajeError = 'La contraseña debe tener al menos 6 caracteres';
          break;
        case 'auth/invalid-email':
          mensajeError = 'Correo electrónico inválido';
          break;
        case 'auth/network-request-failed':
          mensajeError = 'Error de conexión. Verifica tu internet';
          break;
        default:
          mensajeError = 'Error desconocido. Intenta nuevamente';
      }
      
      Alert.alert('Error', mensajeError);
    } finally {
      setCargando(false);
    }
  };

  return (
    <SafeAreaView style={styles.contenedor}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header con logo */}
        <View style={styles.header}>
          <LogoDissmar size="large" />
          <Text style={styles.eslogan}>Tu Distribuidora de Confianza</Text>
        </View>

        {/* Formulario de registro */}
        <View style={styles.formulario}>
          <Text style={styles.titulo}>Crear cuenta</Text>
          <Text style={styles.subtitulo}>Completa tus datos para registrarte</Text>

          {/* Campo de nombre completo */}
          <View style={styles.campoContainer}>
            <Ionicons name="person-outline" size={24} color="#666" style={styles.icono} />
            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              placeholderTextColor="#999"
              value={nombreCompleto}
              onChangeText={setNombreCompleto}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          {/* Campo de teléfono */}
          <View style={styles.campoContainer}>
            <Ionicons name="call-outline" size={24} color="#666" style={styles.icono} />
            <TextInput
              style={styles.input}
              placeholder="Teléfono"
              placeholderTextColor="#999"
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
              autoCorrect={false}
            />
          </View>

          {/* Campo de dirección */}
          <View style={styles.campoContainer}>
            <Ionicons name="location-outline" size={24} color="#666" style={styles.icono} />
            <TextInput
              style={styles.input}
              placeholder="Dirección"
              placeholderTextColor="#999"
              value={direccion}
              onChangeText={setDireccion}
              autoCapitalize="words"
              multiline
            />
          </View>

          {/* Campo de correo electrónico */}
          <View style={styles.campoContainer}>
            <Ionicons name="mail-outline" size={24} color="#666" style={styles.icono} />
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Campo de contraseña */}
          <View style={styles.campoContainer}>
            <Ionicons name="lock-closed-outline" size={24} color="#666" style={styles.icono} />
            <TextInput
              style={[styles.input, styles.inputContraseña]}
              placeholder="Contraseña"
              placeholderTextColor="#999"
              value={contraseña}
              onChangeText={setContraseña}
              secureTextEntry={!mostrarContraseña}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity 
              onPress={() => setMostrarContraseña(!mostrarContraseña)}
              style={styles.iconoOjo}
            >
              <Ionicons 
                name={mostrarContraseña ? "eye-outline" : "eye-off-outline"} 
                size={24} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>

          {/* Botón de crear cuenta */}
          <TouchableOpacity 
            style={[styles.botonCrear, cargando && styles.botonDeshabilitado]} 
            onPress={manejarRegistro}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.textoBotonCrear}>Crear Cuenta</Text>
            )}
          </TouchableOpacity>

          {/* Botón para regresar al login */}
          <TouchableOpacity 
            style={styles.botonRegresar}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back-outline" size={20} color="#8B4513" />
            <Text style={styles.textoBotonRegresar}>Ya tengo cuenta</Text>
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoCirculo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
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
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitulo: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
  },
  campoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  icono: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
  },
  inputContraseña: {
    paddingRight: 50,
  },
  iconoOjo: {
    position: 'absolute',
    right: 15,
  },
  botonCrear: {
    backgroundColor: '#8B4513',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  botonDeshabilitado: {
    backgroundColor: '#ccc',
  },
  textoBotonCrear: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  botonRegresar: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotonRegresar: {
    color: '#8B4513',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});