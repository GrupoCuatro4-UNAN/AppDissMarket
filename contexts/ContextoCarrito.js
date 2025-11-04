import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './ContextoAuth';
import { Alert } from 'react-native';

const ContextoCarrito = createContext();

export const useCarrito = () => {
  return useContext(ContextoCarrito);
};

export const ProveedorCarrito = ({ children }) => {
  const [itemsCarrito, setItemsCarrito] = useState([]);
  const [cargandoCarrito, setCargandoCarrito] = useState(false);
  const { usuarioActual } = useAuth();
  
  //   bloqueos para el modo 'invitado' (no permitir
  //   agregar, no guardar/cargar en Firestore, bloquear pedidos).

  // Función para agregar productos al carrito
  const agregarAlCarrito = async (producto, cantidad = 1) => {
    console.log('Agregando al carrito:', { producto, cantidad });
    // No permitir agregar al carrito si no hay usuario real (incluye invitado)
    if (!usuarioActual || usuarioActual.uid === 'invitado') {
      Alert.alert('Inicia sesión', 'Debes iniciar sesión o crear una cuenta para agregar productos al carrito');
      return;
    }

   
    if (!producto.id || !producto.nombre || !producto.precio) {
      console.error('Producto inválido:', producto);
      Alert.alert('Error', 'El producto no tiene la información necesaria');
      return;
    }

    try {
      const itemExistente = itemsCarrito.find(item => item.id === producto.id);
      let nuevosItems;

      if (itemExistente) {
        // Si el producto ya existe, actualizar cantidad
        nuevosItems = itemsCarrito.map(item =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      } else {
       
        nuevosItems = [...itemsCarrito, {
          id: producto.id,
          nombre: producto.nombre,
          precio: Number(producto.precio), 
          imagenUrl: producto.imagenUrl || '',
          cantidad: Number(cantidad) 
        }];
      }

      setItemsCarrito(nuevosItems);
      await guardarCarritoEnFirestore(nuevosItems);
      
      // Alert solo para productos individuales, no para reorden 
      if (cantidad === 1) {
        Alert.alert('¡Agregado!', `${producto.nombre} agregado al carrito`);
      }
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      throw error; 
    }
  };

  // Función para eliminar producto del carrito
  const removerDelCarrito = async (productoId) => {
    try {
      const nuevosItems = itemsCarrito.filter(item => item.id !== productoId);
      setItemsCarrito(nuevosItems);
      await guardarCarritoEnFirestore(nuevosItems);
    } catch (error) {
      console.error('Error al eliminar del carrito:', error);
      Alert.alert('Error', 'No se pudo eliminar el producto');
    }
  };

  // Función para actualizar cantidad de un producto
  const actualizarCantidad = async (productoId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      await removerDelCarrito(productoId);
      return;
    }

    try {
      const nuevosItems = itemsCarrito.map(item =>
        item.id === productoId
          ? { ...item, cantidad: nuevaCantidad }
          : item
      );
      
      setItemsCarrito(nuevosItems);
      await guardarCarritoEnFirestore(nuevosItems);
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
    }
  };

  // Función para limpiar el carrito
  const limpiarCarrito = async () => {
    try {
      setItemsCarrito([]);
      await guardarCarritoEnFirestore([]);
    } catch (error) {
      console.error('Error al limpiar carrito:', error);
    }
  };

  // Función para calcular el total del carrito
  const calcularTotal = () => {
    return itemsCarrito.reduce((total, item) => {
      return total + (item.precio * item.cantidad);
    }, 0);
  };

  // Función para obtener la cantidad total de productos
  const obtenerCantidadTotal = () => {
    return itemsCarrito.reduce((total, item) => total + item.cantidad, 0);
  };

  // Función para realizar pedido
  // crea documento 'pedidos' en Firestore con items y datos.
  //  bloquea la acción si el usuario es 'invitado'.
  const realizarPedido = async (direccionEnvio) => {
    console.log('Iniciando proceso de pedido...', { usuarioActual, itemsCarrito });
    
    if (!usuarioActual || usuarioActual.uid === 'invitado') {
      Alert.alert('Error', 'Debes iniciar sesión para realizar pedidos');
      return { success: false };
    }
    
    if (itemsCarrito.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega productos al carrito para realizar un pedido');
      return { success: false };
    }

    try {
      console.log('Creando pedido...');
      setCargandoCarrito(true);
      
      const pedido = {
        usuarioId: usuarioActual.uid,
        items: itemsCarrito,
        total: calcularTotal(),
        direccionEnvio: direccionEnvio,
        estado: 'pendiente',
        fechaPedido: new Date(),
        fechaEntrega: null
      };

      console.log('Datos del pedido:', pedido);

      // Guardar pedido en la base de datos
      const docRef = await addDoc(collection(db, 'pedidos'), pedido);
      console.log('Pedido guardado con ID:', docRef.id);
      
      // Limpiar carrito después del pedido exitoso
      await limpiarCarrito();
      
      Alert.alert(
        '¡Pedido realizado!', 
        `Tu pedido #${docRef.id.substring(0, 8)} ha sido enviado correctamente. Total: C$ ${calcularTotal().toFixed(2)}`,
        [
          {
            text: 'Ver Pedidos',
            onPress: () => console.log('Ir a pedidos')
          },
          {
            text: 'OK',
            style: 'default'
          }
        ]
      );
      
      return { success: true, pedidoId: docRef.id };
    } catch (error) {
      console.error('Error al realizar pedido:', error);
      Alert.alert('Error', `No se pudo realizar el pedido: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setCargandoCarrito(false);
    }
  };

  // Función para guardar carrito en la base de datos
  // no guardar para usuarios invitados (uid === 'invitado'). Esto evita escribir
  const guardarCarritoEnFirestore = async (items) => {
    // No guardar carrito en Firestore para usuarios invitados
    if (!usuarioActual || usuarioActual.uid === 'invitado') return;
    
    try {
      const carritoRef = doc(db, 'carritos', usuarioActual.uid);
      await setDoc(carritoRef, {
        items: items,
        fechaActualizacion: new Date()
      });
    } catch (error) {
      console.error('Error al guardar carrito:', error);
    }
  };

  // Función para cargar carrito desde la base de datos
  // no cargar datos para usuarios invitados; el carrito del invitado se mantiene
  const cargarCarritoDesdeFirestore = async () => {
    // No cargar carrito de Firestore para usuarios invitados
    if (!usuarioActual || usuarioActual.uid === 'invitado') {
      setItemsCarrito([]);
      return;
    }

    try {
      setCargandoCarrito(true);
      const carritoRef = doc(db, 'carritos', usuarioActual.uid);
      const carritoSnap = await getDoc(carritoRef);
      
      if (carritoSnap.exists()) {
        const data = carritoSnap.data();
        setItemsCarrito(data.items || []);
      } else {
        setItemsCarrito([]);
      }
    } catch (error) {
      console.error('Error al cargar carrito:', error);
      setItemsCarrito([]);
    } finally {
      setCargandoCarrito(false);
    }
  };

  // Efecto para cargar carrito cuando el usuario cambie
  useEffect(() => {
    cargarCarritoDesdeFirestore();
  }, [usuarioActual]);

  const valor = {
    itemsCarrito,
    cargandoCarrito,
    agregarAlCarrito,
    removerDelCarrito,
    actualizarCantidad,
    limpiarCarrito,
    calcularTotal,
    obtenerCantidadTotal,
    realizarPedido
  };

  return (
    <ContextoCarrito.Provider value={valor}>
      {children}
    </ContextoCarrito.Provider>
  );
};
