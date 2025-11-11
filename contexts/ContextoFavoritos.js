import React, { createContext, useContext, useState, useEffect,  useRef } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './ContextoAuth';
import { Alert } from 'react-native';



const ContextoFavoritos = createContext();

export const useFavoritos = () => {
  return useContext(ContextoFavoritos);
};

export const ProveedorFavoritos = ({ children }) => {
  const [favoritos, setFavoritos] = useState([]);
  const [cargandoFavoritos, setCargandoFavoritos] = useState(false);
  const { usuarioActual } = useAuth();

   const montado = useRef(true);
  
  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  //  bloqueo para usuarios invitados en agregar/guardar/cargar.
  // Función para verificar si un producto es favorito
  const esFavorito = (productoId) => {
    return favoritos.some(fav => fav.id === productoId);
  };

  // Función para agregar producto a favoritos
  const agregarAFavoritos = async (producto) => {
    // No permitir agregar favoritos si no hay usuario real (incluye invitado)
    if (!usuarioActual || usuarioActual.uid === 'invitado') {
      Alert.alert('Inicia sesión', 'Debes iniciar sesión o crear una cuenta para agregar favoritos');
      return;
    }

    try {
      if (esFavorito(producto.id)) {
        Alert.alert('Ya es favorito', 'Este producto ya está en tus favoritos');
        return;
      }

      const nuevoFavorito = {
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        imagenUrl: producto.imagenUrl || '',
        fechaAgregado: new Date()
      };

      const nuevosFavoritos = [...favoritos, nuevoFavorito];
      setFavoritos(nuevosFavoritos);
      await guardarFavoritosEnFirestore(nuevosFavoritos);
      
    } catch (error) {
      console.error('Error al agregar a favoritos:', error);
      Alert.alert('Error', 'No se pudo agregar a favoritos');
    }
  };

  // Función para eliminar producto de favoritos
  const removerDeFavoritos = async (productoId) => {
    try {
      const nuevosFavoritos = favoritos.filter(fav => fav.id !== productoId);
      setFavoritos(nuevosFavoritos);
      await guardarFavoritosEnFirestore(nuevosFavoritos);
    } catch (error) {
      console.error('Error al eliminar de favoritos:', error);
      Alert.alert('Error', 'No se pudo eliminar de favoritos');
    }
  };

  // Función para alternar favorito (agregar o eliminar)
  const alternarFavorito = async (producto) => {
    if (esFavorito(producto.id)) {
      await removerDeFavoritos(producto.id);
    } else {
      await agregarAFavoritos(producto);
    }
  };

  // Función para limpiar todos los favoritos
  const limpiarFavoritos = async () => {
    try {
      setFavoritos([]);
      await guardarFavoritosEnFirestore([]);
      Alert.alert('Favoritos limpiados', 'Se han eliminado todos los favoritos');
    } catch (error) {
      console.error('Error al limpiar favoritos:', error);
      Alert.alert('Error', 'No se pudieron limpiar los favoritos');
    }
  };

  // Función para obtener cantidad de favoritos
  const obtenerCantidadFavoritos = () => {
    return favoritos.length;
  };

  // Función para guardar favoritos en la base de datos
  // no guardar favoritos para usuarios invitados (evita escribir con uid 'invitado').
  const guardarFavoritosEnFirestore = async (favoritosArray) => {
    // No guardar favoritos para usuarios invitados
    if (!usuarioActual || usuarioActual.uid === 'invitado') return;
    
    try {
      const favoritosRef = doc(db, 'favoritos', usuarioActual.uid);
      await setDoc(favoritosRef, {
        productos: favoritosArray,
        fechaActualizacion: new Date()
      });
    } catch (error) {
      console.error('Error al guardar favoritos:', error);
    }
  };

  // Función para cargar favoritos desde la base de datos
  // evitar cargar favoritos desde Firestore para usuarios invitados.
  const cargarFavoritosDesdeFirestore = async () => {
    // No cargar favoritos para usuarios invitados
    if (!usuarioActual || usuarioActual.uid === 'invitado') {
      setFavoritos([]);
      return;
    }

    try {
      setCargandoFavoritos(true);
      const favoritosRef = doc(db, 'favoritos', usuarioActual.uid);
      const favoritosSnap = await getDoc(favoritosRef);
      
      if (favoritosSnap.exists()) {
        const data = favoritosSnap.data();
        setFavoritos(data.productos || []);
      } else {
        setFavoritos([]);
      }
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
      setFavoritos([]);
    } finally {
      setCargandoFavoritos(false);
    }
  };

  // Efecto para cargar favoritos cuando el usuario cambie
 useEffect(() => {
    let montado = true;
    
    const cargar = async () => {
      if (montado) {
        await cargarFavoritosDesdeFirestore();
      }
    };
    
    cargar();
    
    return () => {
      montado = false;
    };
  }, [usuarioActual]);
  // FIN DE CAMBIO

  const valor = {
    favoritos,
    cargandoFavoritos,
    esFavorito,
    agregarAFavoritos,
    removerDeFavoritos,
    alternarFavorito,
    limpiarFavoritos,
    obtenerCantidadFavoritos
  };

  return (
    <ContextoFavoritos.Provider value={valor}>
      {children}
    </ContextoFavoritos.Provider>
  );
};