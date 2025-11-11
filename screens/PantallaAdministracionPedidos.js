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
  Alert,
  Modal,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc,
  getDoc 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/ContextoAuth';
import LogoDissmar from '../components/LogoDissmar';

export default function PantallaAdministracionPedidos({ navigation }) {
  const { datosUsuario } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('Todos'); // Todos, Pendientes, En Camino, Entregados
  const [modalDetalle, setModalDetalle] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [clienteInfo, setClienteInfo] = useState(null);

  // Verificar permisos de admin
  const noEsAdmin = !datosUsuario?.esAdmin;

  useEffect(() => {
    if (!noEsAdmin) {
      cargarPedidos();
    }
  }, [noEsAdmin]);

  // Verificar permisos de admin DESPUÉS de todos los hooks
  if (noEsAdmin) {
    return (
      <SafeAreaView style={styles.contenedor}>
        <View style={styles.noAutorizado}>
          <Ionicons name="lock-closed-outline" size={80} color="#ff4757" />
          <Text style={styles.textoNoAutorizado}>Acceso Denegado</Text>
          <Text style={styles.subtextoNoAutorizado}>
            No tienes permisos de administrador
          </Text>
          <TouchableOpacity 
            style={styles.botonVolver}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.textoBotonVolver}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Función para cargar todos los pedidos (sin filtro por usuario)
  const cargarPedidos = async () => {
    try {
      setCargando(true);
      const q = query(
        collection(db, 'pedidos'),
        orderBy('fechaPedido', 'desc')
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

      setPedidos(pedidosData);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      Alert.alert('Error', 'No se pudieron cargar los pedidos');
    } finally {
      setCargando(false);
    }
  };

  // Función para refrescar
  const onRefresh = async () => {
    setRefrescando(true);
    await cargarPedidos();
    setRefrescando(false);
  };

  // Función para cambiar estado del pedido
  const cambiarEstadoPedido = async (pedidoId, nuevoEstado) => {
    try {
      const updates = {
        estado: nuevoEstado,
        fechaActualizacion: new Date()
      };

      // Si se marca como entregado, guardar fecha de entrega
      if (nuevoEstado === 'entregado') {
        updates.fechaEntrega = new Date();
      }

      await updateDoc(doc(db, 'pedidos', pedidoId), updates);
      
      Alert.alert('¡Actualizado!', `El pedido ahora está: ${nuevoEstado}`);
      cargarPedidos();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      Alert.alert('Error', 'No se pudo actualizar el estado del pedido');
    }
  };

  // Función para obtener información del cliente
  const obtenerInfoCliente = async (usuarioId) => {
    try {
      const docRef = doc(db, 'usuarios', usuarioId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error('Error al obtener info del cliente:', error);
      return null;
    }
  };

  // Función para abrir modal de detalle
  const abrirDetallePedido = async (pedido) => {
    setPedidoSeleccionado(pedido);
    
    // Cargar información del cliente
    const info = await obtenerInfoCliente(pedido.usuarioId);
    setClienteInfo(info);
    
    setModalDetalle(true);
  };

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return 'No disponible';
    
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para obtener color del estado
  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'pendiente':
        return '#ff9500';
      case 'en_camino':
        return '#2196F3';
      case 'entregado':
        return '#4CAF50';
      case 'cancelado':
        return '#ff4757';
      default:
        return '#666';
    }
  };

  // Función para obtener texto del estado
  const obtenerTextoEstado = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'en_camino':
        return 'En Camino';
      case 'entregado':
        return 'Entregado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return estado;
    }
  };

  // Filtrar pedidos según estado seleccionado
  const pedidosFiltrados = pedidos.filter(pedido => {
    if (filtroEstado === 'Todos') return true;
    if (filtroEstado === 'Pendientes') return pedido.estado === 'pendiente';
    if (filtroEstado === 'En Camino') return pedido.estado === 'en_camino';
    if (filtroEstado === 'Entregados') return pedido.estado === 'entregado';
    return true;
  });

  // Contar pedidos por estado
  const contarPorEstado = (estado) => {
    return pedidos.filter(p => p.estado === estado).length;
  };

  // Componente de tarjeta de pedido
  const TarjetaPedido = ({ item }) => (
    <TouchableOpacity 
      style={styles.tarjetaPedido}
      onPress={() => abrirDetallePedido(item)}
    >
      <View style={styles.encabezadoPedido}>
        <Text style={styles.numeroPedido}>Pedido #{item.id.substring(0, 8).toUpperCase()}</Text>
        <View style={[styles.estadoBadge, { backgroundColor: obtenerColorEstado(item.estado) }]}>
          <Text style={styles.textoEstado}>{obtenerTextoEstado(item.estado)}</Text>
        </View>
      </View>

      <Text style={styles.fechaPedido}>{formatearFecha(item.fechaPedido)}</Text>

      <View style={styles.infoPedido}>
        <View style={styles.filaPedido}>
          <Ionicons name="person-outline" size={16} color="#666" />
          <Text style={styles.textoPedido}>Cliente ID: {item.usuarioId.substring(0, 8)}</Text>
        </View>

        <View style={styles.filaPedido}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.textoPedido} numberOfLines={1}>
            {item.direccionEnvio || 'Sin dirección'}
          </Text>
        </View>

        <View style={styles.filaPedido}>
          <Ionicons name="basket-outline" size={16} color="#666" />
          <Text style={styles.textoPedido}>
            {item.items?.length || 0} producto(s)
          </Text>
        </View>
      </View>

      {/* NUEVO: Mostrar si el cliente confirmó recepción */}
      {item.clienteConfirmoRecepcion && (
        <View style={styles.confirmacionCliente}>
          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
          <Text style={styles.textoConfirmacion}>Cliente confirmó recepción</Text>
        </View>
      )}

      <View style={styles.piePedido}>
        <Text style={styles.totalPedido}>Total: C$ {item.total?.toFixed(2) || '0.00'}</Text>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  );

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
          <Text style={styles.textoTitulo}>Gestión de Pedidos</Text>
        </View>
        
        <View style={styles.espacioVacio} />
      </View>

      {/* Estadísticas */}
      <View style={styles.estadisticas}>
        <View style={[styles.tarjetaEstadistica, { borderColor: '#8B4513' }]}>
          <Ionicons name="receipt-outline" size={24} color="#8B4513" />
          <Text style={styles.numeroEstadistica}>{pedidos.length}</Text>
          <Text style={styles.textoEstadistica}>Total</Text>
        </View>

        <View style={[styles.tarjetaEstadistica, { borderColor: '#ff9500' }]}>
          <Ionicons name="time-outline" size={24} color="#ff9500" />
          <Text style={styles.numeroEstadistica}>{contarPorEstado('pendiente')}</Text>
          <Text style={styles.textoEstadistica}>Pendientes</Text>
        </View>

        <View style={[styles.tarjetaEstadistica, { borderColor: '#2196F3' }]}>
          <Ionicons name="car-outline" size={24} color="#2196F3" />
          <Text style={styles.numeroEstadistica}>{contarPorEstado('en_camino')}</Text>
          <Text style={styles.textoEstadistica}>En Camino</Text>
        </View>

        <View style={[styles.tarjetaEstadistica, { borderColor: '#4CAF50' }]}>
          <Ionicons name="checkmark-circle-outline" size={24} color="#4CAF50" />
          <Text style={styles.numeroEstadistica}>{contarPorEstado('entregado')}</Text>
          <Text style={styles.textoEstadistica}>Entregados</Text>
        </View>
      </View>

      {/* Filtros */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtrosContainer}
        contentContainerStyle={styles.filtrosContenido}
      >
        {['Todos', 'Pendientes', 'En Camino', 'Entregados'].map((filtro) => (
          <TouchableOpacity
            key={filtro}
            style={[
              styles.botonFiltro,
              filtroEstado === filtro && styles.botonFiltroActivo
            ]}
            onPress={() => setFiltroEstado(filtro)}
          >
            <Text style={[
              styles.textoFiltro,
              filtroEstado === filtro && styles.textoFiltroActivo
            ]}>
              {filtro}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lista de pedidos */}
      {cargando ? (
        <View style={styles.cargandoContainer}>
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={styles.textoCargando}>Cargando pedidos...</Text>
        </View>
      ) : pedidosFiltrados.length === 0 ? (
        <View style={styles.sinPedidos}>
          <Ionicons name="receipt-outline" size={64} color="#ccc" />
          <Text style={styles.textoSinPedidos}>No hay pedidos {filtroEstado.toLowerCase()}</Text>
        </View>
      ) : (
        <FlatList
          data={pedidosFiltrados}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TarjetaPedido item={item} />}
          contentContainerStyle={styles.listaPedidos}
          refreshControl={
            <RefreshControl
              refreshing={refrescando}
              onRefresh={onRefresh}
              colors={['#8B4513']}
            />
          }
        />
      )}

      {/* Modal de detalle del pedido */}
      <Modal
        visible={modalDetalle}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalDetalle(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContenido}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitulo}>
                  Pedido #{pedidoSeleccionado?.id.substring(0, 8).toUpperCase()}
                </Text>
                <TouchableOpacity onPress={() => setModalDetalle(false)}>
                  <Ionicons name="close-circle-outline" size={30} color="#666" />
                </TouchableOpacity>
              </View>

              {pedidoSeleccionado && (
                <>
                  {/* Información del cliente */}
                  <View style={styles.seccionModal}>
                    <Text style={styles.tituloSeccionModal}>CLIENTE</Text>
                    {clienteInfo ? (
                      <>
                        <View style={styles.filaInfoModal}>
                          <Ionicons name="person-outline" size={20} color="#666" />
                          <Text style={styles.textoInfoModal}>{clienteInfo.nombreCompleto}</Text>
                        </View>
                        <View style={styles.filaInfoModal}>
                          <Ionicons name="call-outline" size={20} color="#666" />
                          <Text style={styles.textoInfoModal}>{clienteInfo.telefono}</Text>
                        </View>
                        <View style={styles.filaInfoModal}>
                          <Ionicons name="mail-outline" size={20} color="#666" />
                          <Text style={styles.textoInfoModal}>{clienteInfo.email}</Text>
                        </View>
                      </>
                    ) : (
                      <Text style={styles.textoInfoModal}>Cargando información...</Text>
                    )}
                  </View>

                  {/* Dirección de envío */}
                  <View style={styles.seccionModal}>
                    <Text style={styles.tituloSeccionModal}>DIRECCIÓN DE ENVÍO</Text>
                    <View style={styles.filaInfoModal}>
                      <Ionicons name="location-outline" size={20} color="#666" />
                      <Text style={styles.textoInfoModal}>
                        {pedidoSeleccionado.direccionEnvio || 'No especificada'}
                      </Text>
                    </View>
                  </View>

                  {/* Productos */}
                  <View style={styles.seccionModal}>
                    <Text style={styles.tituloSeccionModal}>PRODUCTOS</Text>
                    {pedidoSeleccionado.items?.map((item, index) => (
                      <View key={index} style={styles.itemProductoModal}>
                        <Text style={styles.cantidadProducto}>{item.cantidad}x</Text>
                        <Text style={styles.nombreProductoModal}>{item.nombre}</Text>
                        <Text style={styles.precioProductoModal}>
                          C$ {(item.precio * item.cantidad).toFixed(2)}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Total */}
                  <View style={styles.totalModalContainer}>
                    <Text style={styles.totalModalLabel}>Total:</Text>
                    <Text style={styles.totalModalValor}>
                      C$ {pedidoSeleccionado.total?.toFixed(2) || '0.00'}
                    </Text>
                  </View>

                  {/* Estado Actual */}
                  <View style={styles.estadoActualContainer}>
                    <Text style={styles.estadoActualLabel}>Estado Actual:</Text>
                    <View style={[
                      styles.estadoActualBadge,
                      { backgroundColor: obtenerColorEstado(pedidoSeleccionado.estado) }
                    ]}>
                      <Text style={styles.estadoActualTexto}>
                        {obtenerTextoEstado(pedidoSeleccionado.estado)}
                      </Text>
                    </View>
                  </View>

                  {/* NUEVO: Mostrar confirmación del cliente */}
                  {pedidoSeleccionado.clienteConfirmoRecepcion && (
                    <View style={styles.confirmacionClienteModal}>
                      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                      <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text style={styles.textoConfirmacionModal}>
                          Cliente confirmó recepción
                        </Text>
                        {pedidoSeleccionado.fechaConfirmacionCliente && (
                          <Text style={styles.fechaConfirmacionModal}>
                            {formatearFecha(pedidoSeleccionado.fechaConfirmacionCliente.toDate?.() || pedidoSeleccionado.fechaConfirmacionCliente)}
                          </Text>
                        )}
                      </View>
                    </View>
                  )}

                  {/* Botones de cambio de estado */}
                  {pedidoSeleccionado.estado !== 'entregado' && pedidoSeleccionado.estado !== 'cancelado' && (
                    <View style={styles.botonesEstado}>
                      {pedidoSeleccionado.estado === 'pendiente' && (
                        <TouchableOpacity
                          style={[styles.botonCambiarEstado, { backgroundColor: '#2196F3' }]}
                          onPress={() => {
                            cambiarEstadoPedido(pedidoSeleccionado.id, 'en_camino');
                            setModalDetalle(false);
                          }}
                        >
                          <Ionicons name="car-outline" size={20} color="#fff" />
                          <Text style={styles.textoBotonEstado}>Marcar En Camino</Text>
                        </TouchableOpacity>
                      )}

                      {pedidoSeleccionado.estado === 'en_camino' && (
                        <TouchableOpacity
                          style={[styles.botonCambiarEstado, { backgroundColor: '#4CAF50' }]}
                          onPress={() => {
                            cambiarEstadoPedido(pedidoSeleccionado.id, 'entregado');
                            setModalDetalle(false);
                          }}
                        >
                          <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                          <Text style={styles.textoBotonEstado}>Marcar Entregado</Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={[styles.botonCambiarEstado, { backgroundColor: '#ff4757' }]}
                        onPress={() => {
                          Alert.alert(
                            'Cancelar Pedido',
                            '¿Estás seguro de que deseas cancelar este pedido?',
                            [
                              { text: 'No', style: 'cancel' },
                              {
                                text: 'Sí, cancelar',
                                style: 'destructive',
                                onPress: () => {
                                  cambiarEstadoPedido(pedidoSeleccionado.id, 'cancelado');
                                  setModalDetalle(false);
                                }
                              }
                            ]
                          );
                        }}
                      >
                        <Ionicons name="close-circle-outline" size={20} color="#fff" />
                        <Text style={styles.textoBotonEstado}>Cancelar Pedido</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  estadisticas: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  tarjetaEstadistica: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    borderWidth: 2,
    minWidth: 80,
  },
  numeroEstadistica: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  textoEstadistica: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  filtrosContainer: {
    maxHeight: 60,
  },
  filtrosContenido: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  botonFiltro: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  botonFiltroActivo: {
    backgroundColor: '#8B4513',
  },
  textoFiltro: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  textoFiltroActivo: {
    color: '#fff',
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
    fontSize: 18,
    color: '#999',
    marginTop: 15,
    textAlign: 'center',
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
  infoPedido: {
    marginBottom: 15,
  },
  filaPedido: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  textoPedido: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
  confirmacionCliente: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  textoConfirmacion: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 8,
  },
  piePedido: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 15,
  },
  totalPedido: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContenido: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  seccionModal: {
    marginBottom: 20,
  },
  tituloSeccionModal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  filaInfoModal: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  textoInfoModal: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  itemProductoModal: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cantidadProducto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
    width: 40,
  },
  nombreProductoModal: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  precioProductoModal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  totalModalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: 2,
    borderTopColor: '#e0e0e0',
    marginBottom: 20,
  },
  totalModalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  totalModalValor: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  estadoActualContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  estadoActualLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  estadoActualBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  estadoActualTexto: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  confirmacionClienteModal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
  },
  textoConfirmacionModal: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  fechaConfirmacionModal: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  botonesEstado: {
    marginTop: 10,
  },
  botonCambiarEstado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  textoBotonEstado: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  noAutorizado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  textoNoAutorizado: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff4757',
    marginTop: 20,
    marginBottom: 10,
  },
  subtextoNoAutorizado: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  botonVolver: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  textoBotonVolver: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
// FIN DE CAMBIO