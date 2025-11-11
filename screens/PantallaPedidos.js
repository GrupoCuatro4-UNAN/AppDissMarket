import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import LogoDissmar from '../components/LogoDissmar';
import { useCarrito } from '../contexts/ContextoCarrito';
import { useAuth } from '../contexts/ContextoAuth';


export default function PantallaPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const { usuarioActual } = useAuth();
  const { agregarAlCarrito } = useCarrito();

  // Función para cargar pedidos del usuario
  const cargarPedidos = async () => {
    if (!usuarioActual) {
      setPedidos([]);
      setCargando(false);
      return;
    }

    try {
      setCargando(true);
      const q = query(
        collection(db, 'pedidos'),
        where('usuarioId', '==', usuarioActual.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const pedidosData = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        pedidosData.push({
          id: doc.id,
          ...data,
          fechaPedido: data.fechaPedido?.toDate(),
          fechaEntrega: data.fechaEntrega?.toDate()
        });
      });

      // Ordenar por fecha de pedido (más recientes primero)
      pedidosData.sort((a, b) => {
        if (!a.fechaPedido && !b.fechaPedido) return 0;
        if (!a.fechaPedido) return 1;
        if (!b.fechaPedido) return -1;
        return b.fechaPedido - a.fechaPedido;
      });

      setPedidos(pedidosData);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      Alert.alert('Error', 'No se pudieron cargar los pedidos');
    } finally {
      setCargando(false);
    }
  };

  // Función para refrescar pedidos
  const onRefresh = async () => {
    setRefrescando(true);
    await cargarPedidos();
    setRefrescando(false);
  };

  // Función para reordenar un pedido
  const reordenar = async (pedido) => {
    Alert.alert(
      'Reordenar',
      `¿Deseas realizar el mismo pedido nuevamente?\n\nTotal: C$ ${pedido.total.toFixed(2)}`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Reordenar',
          onPress: async () => {
            try {
              console.log('Iniciando reorden del pedido:', pedido);
              
              let productosAgregados = 0;
              let errores = 0;
              
              // Agregar cada producto del pedido al carrito
              for (const item of pedido.items) {
                try {
                  // Crear objeto producto compatible con agregarAlCarrito
                  const productoParaCarrito = {
                    id: item.productId || item.id || `temp-${Date.now()}-${Math.random()}`,
                    nombre: item.nombre,
                    precio: item.precio,
                    imagenUrl: item.imagenUrl || ''
                  };
                  
                  console.log('Agregando producto al carrito:', productoParaCarrito);
                  await agregarAlCarrito(productoParaCarrito, item.cantidad);
                  productosAgregados++;
                } catch (error) {
                  console.error('Error al agregar producto individual:', error);
                  errores++;
                }
              }
              
              if (productosAgregados > 0) {
                Alert.alert(
                  '¡Productos agregados!', 
                  `${productosAgregados} productos del pedido #${pedido.id.substring(0, 8)} han sido agregados al carrito.${errores > 0 ? `\n\n${errores} productos no se pudieron agregar.` : ''}\n\nVe a la pestaña "Carrito" para completar tu nuevo pedido.`,
                  [
                    {
                      text: 'OK',
                      style: 'default'
                    }
                  ]
                );
              } else {
                Alert.alert('Error', 'No se pudieron agregar productos al carrito. Intenta nuevamente.');
              }
              
            } catch (error) {
              console.error('Error  al reordenar:', error);
              Alert.alert('Error', 'Ocurrió un problema al reordenar el pedido');
            }
          },
        },
      ]
    );
  };

   const confirmarRecepcion = async (pedido) => {
    // Solo permitir confirmar si el estado es "entregado" y no ha sido confirmado
    if (pedido.estado !== 'entregado') {
      Alert.alert('No disponible', 'Solo puedes confirmar pedidos que ya fueron entregados');
      return;
    }

    if (pedido.clienteConfirmoRecepcion) {
      Alert.alert('Ya confirmado', 'Ya has confirmado la recepción de este pedido');
      return;
    }

    Alert.alert(
      '¿Recibiste tu pedido?',
      `Por favor confirma que recibiste el pedido #${pedido.id.substring(0, 8)} correctamente.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sí, lo recibí',
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'pedidos', pedido.id), {
                clienteConfirmoRecepcion: true,
                fechaConfirmacionCliente: new Date()
              });

              Alert.alert(
                '¡Gracias!',
                'Has confirmado la recepción de tu pedido. ¡Gracias por tu compra!'
              );

              cargarPedidos(); // Recargar para mostrar la confirmación
            } catch (error) {
              console.error('Error al confirmar recepción:', error);
              Alert.alert('Error', 'No se pudo confirmar la recepción del pedido');
            }
          },
        },
      ]
    );
  };
  // Función para obtener el color del estado
  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'pendiente':
        return '#ff9500';
      case 'entregado':
        return '#4CAF50';
      case 'cancelado':
        return '#ff4757';
      default:
        return '#666';
    }
  };

  // Función para obtener el texto del estado
  const obtenerTextoEstado = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'entregado':
        return 'Entregado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return estado;
    }
  };

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Componente para renderizar cada pedido
  const TarjetaPedido = ({ item }) => (
    <View style={styles.tarjetaPedido}>
      <View style={styles.encabezadoPedido}>
        <Text style={styles.numeroPedido}>Pedido #{item.id.substring(0, 8)}</Text>
        <View style={[styles.estadoBadge, { backgroundColor: obtenerColorEstado(item.estado) }]}>
          <Text style={styles.textoEstado}>{obtenerTextoEstado(item.estado)}</Text>
        </View>
      </View>

      <Text style={styles.fechaPedido}>{formatearFecha(item.fechaPedido)}</Text>

      <View style={styles.itemsPedido}>
        {item.items.map((producto, index) => (
          <Text key={index} style={styles.itemTexto}>
            {producto.cantidad}x {producto.nombre}
          </Text>
        ))}
      </View>

      {/* NUEVO: Mostrar si el cliente ya confirmó recepción */}
      {item.clienteConfirmoRecepcion && (
        <View style={styles.confirmacionRecepcion}>
          <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
          <Text style={styles.textoConfirmacion}>
            Recibido el {formatearFecha(item.fechaConfirmacionCliente?.toDate?.() || item.fechaConfirmacionCliente)}
          </Text>
        </View>
      )}

      <View style={styles.piePedido}>
        <Text style={styles.totalPedido}>Total: C$ {item.total.toFixed(2)}</Text>
        
        <View style={styles.botonesAccion}>
          <TouchableOpacity 
            style={styles.botonVer}
            onPress={() => Alert.alert('Detalles', `Pedido #${item.id.substring(0, 8)}\n\nEstado: ${obtenerTextoEstado(item.estado)}\nFecha: ${formatearFecha(item.fechaPedido)}\nTotal: C$ ${item.total.toFixed(2)}`)}
          >
            <Text style={styles.textoBotonVer}>Ver Detalles</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.botonReordenar}
            onPress={() => reordenar(item)}
          >
            <Text style={styles.textoBotonReordenar}>Reordenar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* NUEVO: Botón para confirmar recepción (solo si está entregado y no confirmado) */}
      {item.estado === 'entregado' && !item.clienteConfirmoRecepcion && (
        <TouchableOpacity 
          style={styles.botonConfirmarRecepcion}
          onPress={() => confirmarRecepcion(item)}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
          <Text style={styles.textoBotonConfirmar}>¡Recibí mi pedido!</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Cargar pedidos al montar el componente
  useEffect(() => {
    cargarPedidos();
  }, [usuarioActual]);

  return (
    <SafeAreaView style={styles.contenedor}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <LogoDissmar size="small" showText={false} style={{ marginRight: 10 }} />
          <Text style={styles.logoNombre}>DISSMAR</Text>
        </View>
        <Text style={styles.eslogan}>Tu Distribuidora de Confianza</Text>
      </View>

      {/* Título de la sección */}
      <View style={styles.tituloContainer}>
        <Text style={styles.titulo}>Mis Pedidos</Text>
        <Text style={styles.subtitulo}>Historial de pedidos</Text>
      </View>

      {/* Contenido principal */}
      {cargando ? (
        <View style={styles.cargandoContainer}>
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={styles.textoCargando}>Cargando pedidos...</Text>
        </View>
      ) : pedidos.length === 0 ? (
        <View style={styles.sinPedidos}>
          <Ionicons name="receipt-outline" size={80} color="#ccc" />
          <Text style={styles.textoSinPedidos}>No tienes pedidos aún</Text>
          <Text style={styles.subtextoSinPedidos}>
            Tus pedidos aparecerán aquí una vez que realices compras
          </Text>
        </View>
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TarjetaPedido item={item} />}
          contentContainerStyle={styles.listaPedidos}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refrescando}
              onRefresh={onRefresh}
              colors={['#8B4513']}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', 
    marginBottom: 5,
  },
  logoCirculo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoTexto: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoNombre: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 1,
  },
  eslogan: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginLeft: 10,
     textAlign: 'center',
  },
  tituloContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitulo: {
    fontSize: 16,
    color: '#666',
  },
  cargandoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoCargando: {
    marginTop: 10,
    fontSize: 16,
    color: '#8B4513',
  },
  sinPedidos: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  textoSinPedidos: {
    fontSize: 24,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtextoSinPedidos: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
  listaPedidos: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tarjetaPedido: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  encabezadoPedido: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  numeroPedido: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  textoEstado: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fechaPedido: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  itemsPedido: {
    marginBottom: 15,
  },
  itemTexto: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
    confirmacionRecepcion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  textoConfirmacion: {
    fontSize: 13,
    color: '#8B4513',
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  botonConfirmarRecepcion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B4513',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  textoBotonConfirmar: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  piePedido: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 15,
  },
  totalPedido: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 15,
  },
  botonesAccion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  botonVer: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    flex: 1,
    marginRight: 10,
  },
  textoBotonVer: {
    color: '#8B4513',
    fontWeight: '600',
    textAlign: 'center',
  },
  botonReordenar: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    flex: 1,
    marginLeft: 10,
  },
  textoBotonReordenar: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
});