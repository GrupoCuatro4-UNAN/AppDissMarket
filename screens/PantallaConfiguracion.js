import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { updatePassword, deleteUser } from 'firebase/auth';
import { doc, deleteDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { auth, db } from '../firebase';
import LogoDissmar from '../components/LogoDissmar';
import { useAuth } from '../contexts/ContextoAuth';

export default function PantallaConfiguracion({ navigation }) {
  const [notificaciones, setNotificaciones] = useState(true);
  const [notificacionesPedidos, setNotificacionesPedidos] = useState(true);
  const [notificacionesOfertas, setNotificacionesOfertas] = useState(false);
  const [mostrarCambiarContraseña, setMostrarCambiarContraseña] = useState(false);
  const [contraseñaActual, setContraseñaActual] = useState('');
  const [contraseñaNueva, setContraseñaNueva] = useState('');
  const [confirmarContraseña, setConfirmarContraseña] = useState('');
  const [cambiandoContraseña, setCambiandoContraseña] = useState(false);

  const { usuarioActual, cerrarSesion } = useAuth();

  const cambiarContraseña = async () => {
    if (!contraseñaActual || !contraseñaNueva || !confirmarContraseña) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    if (contraseñaNueva !== confirmarContraseña) {
      Alert.alert('Error', 'Las contraseñas nuevas no coinciden');
      return;
    }

    if (contraseñaNueva.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setCambiandoContraseña(true);
    
    try {
      await updatePassword(auth.currentUser, contraseñaNueva);
      Alert.alert(
        '¡Éxito!', 
        'Contraseña cambiada correctamente',
        [{ text: 'OK', onPress: () => {
          setMostrarCambiarContraseña(false);
          setContraseñaActual('');
          setContraseñaNueva('');
          setConfirmarContraseña('');
        }}]
      );
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      let mensaje = 'Error al cambiar la contraseña';
      
      if (error.code === 'auth/requires-recent-login') {
        mensaje = 'Necesitas iniciar sesión nuevamente para cambiar la contraseña';
      }
      
      Alert.alert('Error', mensaje);
    } finally {
      setCambiandoContraseña(false);
    }
  };

 const eliminarCuenta = () => {
  Alert.alert(
    '¿Eliminar cuenta?',
    'Esta acción no se puede deshacer. Se eliminarán todos tus datos, pedidos e información personal.',
    [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Eliminar', 
        style: 'destructive',
        onPress: () => eliminarCuentaCompleta()
      }
    ]
  );
};
 
  
  const eliminarCuentaCompleta = async () => {
    if (!usuarioActual) {
      Alert.alert('Error', 'No hay usuario autenticado');
      return;
    }

    try {
      Alert.alert('Eliminando cuenta...', 'Por favor espera mientras eliminamos todos tus datos.');

      const batch = writeBatch(db);
      const userId = usuarioActual.uid;

      
      const userDoc = doc(db, 'usuarios', userId);
      batch.delete(userDoc);

     
      const favoritosDoc = doc(db, 'favoritos', userId);
      batch.delete(favoritosDoc);

     
      const carritoDoc = doc(db, 'carritos', userId);
      batch.delete(carritoDoc);

      
      const pedidosQuery = query(
        collection(db, 'pedidos'),
        where('usuarioId', '==', userId)
      );
      const pedidosSnapshot = await getDocs(pedidosQuery);
      
      pedidosSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      
      await deleteUser(usuarioActual);

      Alert.alert(
        'Cuenta eliminada',
        'Tu cuenta y todos tus datos han sido eliminados permanentemente.',
        [
          {
            text: 'OK',
            onPress: () => {
              // La app automáticamente regresará al login
              // Ya que el usuario fue eliminado
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
      
      let mensajeError = 'No se pudo eliminar la cuenta';
      
      if (error.code === 'auth/requires-recent-login') {
        mensajeError = 'Necesitas iniciar sesión nuevamente antes de eliminar la cuenta. Cierra sesión, inicia sesión nuevamente e intenta otra vez.';
      }
      
      Alert.alert('Error', mensajeError);
    }
  };

  return (
    <SafeAreaView style={styles.contenedor}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.botonAtras}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.tituloHeader}>
          <Text style={styles.textoTitulo}>Configuración</Text>
        </View>
        
        <View style={styles.espacioVacio} />
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Logo de dissmar */}
        <View style={styles.logoContainer}>
          <LogoDissmar size="medium" />
          <Text style={styles.eslogan}>Tu Distribuidora de Confianza</Text>
        </View>

        {/* Seguridad */}
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Seguridad</Text>
          
          <TouchableOpacity 
            style={styles.opcion}
            onPress={() => setMostrarCambiarContraseña(!mostrarCambiarContraseña)}
          >
            <Ionicons name="lock-closed-outline" size={24} color="#8B4513" />
            <Text style={styles.textoOpcion}>Cambiar contraseña</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
          </TouchableOpacity>

          {mostrarCambiarContraseña && (
            <View style={styles.formularioContraseña}>
              <TextInput
                style={styles.inputContraseña}
                placeholder="Contraseña actual"
                secureTextEntry
                value={contraseñaActual}
                onChangeText={setContraseñaActual}
              />
              <TextInput
                style={styles.inputContraseña}
                placeholder="Nueva contraseña"
                secureTextEntry
                value={contraseñaNueva}
                onChangeText={setContraseñaNueva}
              />
              <TextInput
                style={styles.inputContraseña}
                placeholder="Confirmar nueva contraseña"
                secureTextEntry
                value={confirmarContraseña}
                onChangeText={setConfirmarContraseña}
              />
              
              <View style={styles.botonesContraseña}>
                <TouchableOpacity 
                  style={styles.botonCancelar}
                  onPress={() => {
                    setMostrarCambiarContraseña(false);
                    setContraseñaActual('');
                    setContraseñaNueva('');
                    setConfirmarContraseña('');
                  }}
                >
                  <Text style={styles.textoBotonCancelar}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.botonGuardar, cambiandoContraseña && styles.botonDeshabilitado]}
                  onPress={cambiarContraseña}
                  disabled={cambiandoContraseña}
                >
                  {cambiandoContraseña ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.textoBotonGuardar}>Cambiar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Notificaciones */}
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Notificaciones</Text>
          
          <View style={styles.opcionSwitch}>
            <View style={styles.infoOpcion}>
              <Ionicons name="notifications-outline" size={24} color="#8B4513" />
              <View style={styles.textoOpcionContainer}>
                <Text style={styles.textoOpcion}>Notificaciones generales</Text>
                <Text style={styles.subtextoOpcion}>Recibir todas las notificaciones</Text>
              </View>
            </View>
            <Switch
              value={notificaciones}
              onValueChange={setNotificaciones}
              trackColor={{ false: '#ccc', true: '#8B4513' }}
            />
          </View>

          <View style={styles.opcionSwitch}>
            <View style={styles.infoOpcion}>
              <Ionicons name="receipt-outline" size={24} color="#8B4513" />
              <View style={styles.textoOpcionContainer}>
                <Text style={styles.textoOpcion}>Estado de pedidos</Text>
                <Text style={styles.subtextoOpcion}>Actualización de tus pedidos</Text>
              </View>
            </View>
            <Switch
              value={notificacionesPedidos}
              onValueChange={setNotificacionesPedidos}
              trackColor={{ false: '#ccc', true: '#8B4513' }}
            />
          </View>

          <View style={styles.opcionSwitch}>
            <View style={styles.infoOpcion}>
              <Ionicons name="pricetag-outline" size={24} color="#8B4513" />
              <View style={styles.textoOpcionContainer}>
                <Text style={styles.textoOpcion}>Ofertas y promociones</Text>
                <Text style={styles.subtextoOpcion}>Descuentos especiales</Text>
              </View>
            </View>
            <Switch
              value={notificacionesOfertas}
              onValueChange={setNotificacionesOfertas}
              trackColor={{ false: '#ccc', true: '#8B4513' }}
            />
          </View>
        </View>

      

        {/* Zona peligrosa */}
        <View style={[styles.seccion, styles.seccionPeligrosa]}>
          <Text style={styles.tituloSeccionPeligrosa}>Zona de riesgo</Text>
          
          <TouchableOpacity style={styles.opcionPeligrosa} onPress={eliminarCuenta}>
            <Ionicons name="trash-outline" size={24} color="#ff4757" />
            <Text style={styles.textoOpcionPeligrosa}>Eliminar cuenta</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
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
  espacioVacio: {
    width: 34,
  },
  scrollContainer: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 20,
    justifyContent: 'center', 
    marginBottom: 20,
  },
  eslogan: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
     textAlign: 'center',
  },
  seccion: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  seccionPeligrosa: {
    borderWidth: 1,
    borderColor: '#ffebee',
    backgroundColor: '#fffafa',
  },
  tituloSeccion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  tituloSeccionPeligrosa: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff4757',
    marginBottom: 15,
  },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  opcionPeligrosa: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  opcionSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoOpcion: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textoOpcionContainer: {
    marginLeft: 15,
  },
  textoOpcion: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
    flex: 1,
  },
  textoOpcionPeligrosa: {
    fontSize: 16,
    color: '#ff4757',
    marginLeft: 15,
    flex: 1,
  },
  subtextoOpcion: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  formularioContraseña: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  inputContraseña: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  botonesContraseña: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  botonCancelar: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginRight: 10,
  },
  textoBotonCancelar: {
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
  },
  botonGuardar: {
    backgroundColor: '#8B4513',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginLeft: 10,
  },
  botonDeshabilitado: {
    backgroundColor: '#ccc',
  },
  textoBotonGuardar: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
});