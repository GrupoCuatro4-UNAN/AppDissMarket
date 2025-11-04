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
  const [modoInvitado, setModoInvitado] = useState(false); // NUEVO

  const obtenerDatosUsuario = async (uid) => {
    try {
      const docRef = doc(db, 'usuarios', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const datos = docSnap.data();
        setDatosUsuario(datos);
        return datos;
      } else {
        console.log('No se encontraron datos del usuario');
        return null;
      }
    } catch (error) {
      console.error('Error al obtener datos:', error);
      return null;
    }
  };
  // actualizarPerfil: evita que un invitado modifique datos.
  const actualizarPerfil = async (nuevosDatos) => {
    if (modoInvitado) {
      // Mensaje UX para el invitado
      Alert.alert('Modo Invitado', 'No puedes editar el perfil como invitado');
      return { success: false };
    }
  };

  const cerrarSesion = async () => {
    try {
      if (!modoInvitado) {
        await signOut(auth);
      }
      setUsuarioActual(null);
      setDatosUsuario(null);
      setModoInvitado(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // entrarComoInvitado:
  // - Propósito (usuario): crear un usuario temporal en memoria con uid 'invitado' y datos por defecto.
  // - Uso: permite navegar por la app sin estar autenticado, con funciones limitadas.
  // - alerta para informar al usuario de las limitaciones.
  const entrarComoInvitado = () => {
    setUsuarioActual({ uid: 'invitado', email: 'invitado@dissmar.com' });
    setDatosUsuario({
      nombreCompleto: 'Invitado',
      telefono: 'No disponible',
      direccion: 'No disponible',
      esAdmin: false
    });
    setModoInvitado(true);
    setCargando(false);
    Alert.alert('Bienvenido', 'Has ingresado como invitado. Algunas funciones pueden estar limitadas.');
  };

  //   la dependencia [modoInvitado] evita que el observable sobrescriba
  //   el estado de invitado inmediatamente después de llamar entrarComoInvitado().
  useEffect(() => {
    const desuscribir = onAuthStateChanged(auth, async (usuario) => {
      if (usuario) {
        setUsuarioActual(usuario);
        setModoInvitado(false);
        await obtenerDatosUsuario(usuario.uid);
      } else {
        // Solo limpiar si no estamos en modo invitado (para no sobrescribir ese estado)
        if (!modoInvitado) {
          setUsuarioActual(null);
          setDatosUsuario(null);
        }
      }
      setCargando(false);
    });

    return desuscribir;
  }, [modoInvitado]);

  const valor = {
    usuarioActual,
    datosUsuario,
    cargando,
    modoInvitado,
    obtenerDatosUsuario,
    actualizarPerfil,
    cerrarSesion,
    entrarComoInvitado
  };

  return (
    <ContextoAuth.Provider value={valor}>
      {children}
    </ContextoAuth.Provider>
  );
};
