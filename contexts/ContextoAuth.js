import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Alert } from 'react-native';

const ContextoAuth = createContext();

export const useAuth = () => {
  return useContext(ContextoAuth);
};

export const ProveedorAuth = ({ children }) => {
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [datosUsuario, setDatosUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Función para obtener datos del usuario desde Firestore
  const obtenerDatosUsuario = async (uid) => {
    try {
      const docRef = doc(db, 'usuarios', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const datos = docSnap.data();
        setDatosUsuario(datos);
        return datos;
      } else {
        console.log('No se encontraron datos del usuario en la base de datos');
        return null;
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      return null;
    }
  };

  // Función para actualizar perfil del usuario
  const actualizarPerfil = async (nuevosDatos) => {
    try {
      if (!usuarioActual) {
        Alert.alert('Error', 'No hay usuario autenticado');
        return { success: false };
      }
      
      const docRef = doc(db, 'usuarios', usuarioActual.uid);
      await updateDoc(docRef, {
        ...nuevosDatos,
        fechaActualizacion: new Date()
      });

      // Actualizar el estado local
      setDatosUsuario(prev => ({ ...prev, ...nuevosDatos }));
      
      Alert.alert('¡Éxito!', 'Perfil actualizado correctamente');
      return { success: true };
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil');
      return { success: false, error: error.message };
    }
  };

  // Función para cerrar sesión
  const cerrarSesion = async () => {
    try {
      await signOut(auth);
      setDatosUsuario(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Alert.alert('Error', 'No se pudo cerrar la sesión');
    }
  };

  // Efecto para manejar cambios en el estado de autenticación
  useEffect(() => {
    const desuscribir = onAuthStateChanged(auth, async (usuario) => {
      setUsuarioActual(usuario);
      
      if (usuario) {
        // Usuario autenticado - obtener sus datos
        await obtenerDatosUsuario(usuario.uid);
      } else {
        // Usuario no autenticado - limpiar datos
        setDatosUsuario(null);
      }
      
      setCargando(false);
    });

    return desuscribir;
  }, []);

  const valor = {
    usuarioActual,
    datosUsuario,
    cargando,
    obtenerDatosUsuario,
    actualizarPerfil,
    cerrarSesion
  };

  return (
    <ContextoAuth.Provider value={valor}>
      {children}
    </ContextoAuth.Provider>
  );
};