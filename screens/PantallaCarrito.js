import React, { useState } from 'react';
import {View,Text,FlatList,TouchableOpacity,StyleSheet,SafeAreaView,
        Image,Alert,ActivityIndicator,Modal,TextInput,ScrollView} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCarrito } from '../contexts/ContextoCarrito';
import { useAuth } from '../contexts/ContextoAuth';
import LogoDissmar from '../components/LogoDissmar';

export default function PantallaCarrito() {
  const {
    itemsCarrito,removerDelCarrito,actualizarCantidad,calcularTotal, realizarPedido, cargandoCarrito 
  } = useCarrito();

  const { datosUsuario } = useAuth();

  const [realizandoPedido, setRealizandoPedido] = useState(false);

  // ESTADO DEL MÉTODO DE PAGO
  // Controla si se muestra selección de pago
  const [modalPagoVisible, setModalPagoVisible] = useState(false);
  const [metodoPago, setMetodoPago] = useState(null);
  const [tarjeta, setTarjeta] = useState({
    numero: '',
    titular: '',
    expiracion: '',
    cvv: ''
  });

  
  const validarTarjeta = () => {
    const num = tarjeta.numero.replace(/\s/g, '');
    return (
      num.length === 16 &&
      tarjeta.titular.trim().length >= 3 &&
      tarjeta.expiracion.match(/^\d{2}\/\d{2}$/) &&
      tarjeta.cvv.length >= 3
    );
  };

  const confirmarPago = () => {
    if (metodoPago === 'tarjeta' && !validarTarjeta()) {
      Alert.alert('Error', 'Por favor completa correctamente los datos de la tarjeta');
      return;
    }
    setModalPagoVisible(false);
  };

  const manejarRealizarPedido = async () => {
    if (itemsCarrito.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega productos al carrito para realizar un pedido');
      return;
    }

    if (!metodoPago) {
      Alert.alert('Falta método de pago', 'Debes seleccionar un método de pago para continuar');
      setModalPagoVisible(true);
      return;
    }

   
    Alert.alert(
      'Dirección de entrega',
      '¿Dónde deseas recibir tu pedido?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Mi dirección registrada',
          onPress: () => confirmarPedido(datosUsuario?.direccion || 'Dirección no especificada')
        },
        {
          text: 'Otra dirección',
          onPress: () => solicitarDireccionPersonalizada()
        }
      ]
    );
  };

  const solicitarDireccionPersonalizada = () => {
    Alert.prompt(
      'Nueva dirección de entrega',
      'Ingresa la dirección donde deseas recibir tu pedido:',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar pedido',
          onPress: (direccion) => {
            if (direccion && direccion.trim()) {
              confirmarPedido(direccion.trim());
            } else {
              Alert.alert('Error', 'Debes ingresar una dirección válida');
            }
          }
        }
      ],
      'plain-text',
      datosUsuario?.direccion || ''
    );
  };

  const confirmarPedido = async (direccionEnvio) => {
    Alert.alert(
      'Confirmar pedido',
      `Total: C$ ${calcularTotal().toFixed(2)}\nDirección: ${direccionEnvio}\nMétodo de pago: ${metodoPago === 'efectivo' ? 'Efectivo' : 'Tarjeta'}\n\n¿Deseas continuar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, confirmar',
          onPress: async () => {
            setRealizandoPedido(true);
            try {
              const resultado = await realizarPedido(direccionEnvio);
              if (resultado.success) {
                Alert.alert('¡Pedido realizado!', `Tu pedido #${resultado.pedidoId.substring(0, 8).toUpperCase()} ha sido enviado.`);
              }
            } catch (err) {
              Alert.alert('Error', 'No se pudo completar el pedido');
            } finally {
              setRealizandoPedido(false);
            }
          }
        }
      ]
    );
  };

  const ItemCarrito = ({ item }) => (
    <View style={styles.itemCarrito}>
      <View style={styles.contenedorImagen}>
        {item.imagenUrl ? (
          <Image source={{ uri: item.imagenUrl }} style={styles.imagenProducto} />
        ) : (
          <View style={styles.imagenPlaceholder}>
            <Ionicons name="image-outline" size={30} color="#ccc" />
          </View>
        )}
      </View>

      <View style={styles.infoProducto}>
        <Text style={styles.nombreProducto}>{item.nombre}</Text>
        <Text style={styles.precioProducto}>C$ {item.precio.toFixed(2)}</Text>

        <View style={styles.controlesContainer}>
          <View style={styles.controlesCantidad}>
          
            <TouchableOpacity
              style={styles.botonCantidad}
              onPress={() => actualizarCantidad(item.id, item.cantidad - 1)}
            >
              <Ionicons name="remove" size={18} color="#666" />
            </TouchableOpacity>
            <Text style={styles.textoCantidad}>{item.cantidad}</Text>
         
            <TouchableOpacity
              style={styles.botonCantidad}
              onPress={() => actualizarCantidad(item.id, item.cantidad + 1)}
            >
              <Ionicons name="add" size={18} color="#666" />
            </TouchableOpacity>
          </View>

         
          <TouchableOpacity
            style={styles.botonEliminar}
            onPress={() => removerDelCarrito(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#ff4757" />
          </TouchableOpacity>

          <View style={styles.subtotalContainer}>
            <Text style={styles.subtotal}>C$ {(item.precio * item.cantidad).toFixed(2)}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  
  return (
    <SafeAreaView style={styles.contenedor}>
      {/* Header con logo y eslogan */}
      <View style={styles.header}>
        <View style={styles.headerCentro}>
          <LogoDissmar size="small" />
          <Text style={styles.eslogan}>Tu Distribuidora de Confianza</Text>
        </View>
      </View>

      
      <View style={styles.tituloContainer}>
        <Text style={styles.titulo}>Mi Carrito</Text>
        <Text style={styles.subtitulo}>
          {itemsCarrito.length} producto{itemsCarrito.length !== 1 ? 's' : ''}
        </Text>
      </View>

     
      {cargandoCarrito ? (
       
        <View style={styles.cargandoContainer}>
          <ActivityIndicator size="large" color="#8B4513" />
        </View>
      ) : itemsCarrito.length === 0 ? (
        
        <View style={styles.sinProductos}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <Text style={styles.textoSinProductos}>Tu carrito está vacío</Text>
          <Text style={styles.subtextoSinProductos}>¡Explora el catálogo y agrega productos!</Text>
        </View>
      ) : (
      
        <>
          <FlatList
            data={itemsCarrito}
            keyExtractor={(item) => item.id}
            renderItem={ItemCarrito}
            contentContainerStyle={styles.listaCarrito}
          />

          <View style={styles.resumenPedido}>
            <Text style={styles.tituloResumen}>Resumen del pedido</Text>

            <View style={styles.filaResumen}>
              <Text style={styles.textoResumen}>Subtotall</Text>
              <Text style={styles.textoResumen}>C$ {calcularTotal().toFixed(2)}</Text>
            </View>

            <View style={styles.filaResumen}>
              <Text style={styles.textoResumen}>Envíoo</Text>
            </View>

            <View style={styles.separador} />

            <View style={styles.filaTotal}>
              <Text style={styles.textoTotal}>Total</Text>
              <Text style={styles.textoTotal}>C$ {calcularTotal().toFixed(2)}</Text>
            </View>

            <View style={styles.filaBotonesFinal}>
            
              <TouchableOpacity
                style={[
                  styles.botonMetodoPagoCompacto,
                  !metodoPago && styles.botonMetodoInactivo
                ]}
                onPress={() => setModalPagoVisible(true)}
              >
                <Ionicons
                  name={metodoPago ? "checkmark-circle" : "card-outline"}
                  size={18}
                  color={metodoPago ? "#27ae60" : "#8B4513"}
                />
                <Text style={[
                  styles.textoBotonCompacto,
                  !metodoPago && styles.textoInactivo
                ]}>
                  {metodoPago === 'efectivo'
                    ? 'Efectivo'
                    : metodoPago === 'tarjeta'
                    ? 'Tarjeta •••• ' + (tarjeta.numero.slice(-4) || '0000')
                    : 'Seleccionar pago'}
                </Text>
              </TouchableOpacity>

           
              <TouchableOpacity
                style={[
                  styles.botonRealizarPedidoCompacto,
                  (!metodoPago || realizandoPedido) && styles.botonDeshabilitado
                ]}
                onPress={manejarRealizarPedido}
                disabled={!metodoPago || realizandoPedido}
              >
                {realizandoPedido ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Text style={styles.textoBotonRealizarCompacto}>Realizar pedido</Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 5 }} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

    
      <Modal visible={modalPagoVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContenido}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Método de pago</Text>
              <TouchableOpacity onPress={() => setModalPagoVisible(false)}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
             
              <TouchableOpacity
                style={[styles.opcionPago, metodoPago === 'efectivo' && styles.opcionSeleccionada]}
                onPress={() => setMetodoPago('efectivo')}
              >
                <Ionicons name="cash-outline" size={28} color={metodoPago === 'efectivo' ? '#8B4513' : '#666'} />
                <View style={styles.textoOpcionPago}>
                  <Text style={styles.tituloOpcionPago}>Contra entrega (Efectivo)</Text>
                  <Text style={styles.subtextoOpcionPago}>Paga cuando recibas tu pedido</Text>
                </View>
                {metodoPago === 'efectivo' && <Ionicons name="checkmark-circle" size={28} color="#8B4513" />}
              </TouchableOpacity>

             
              <TouchableOpacity
                style={[styles.opcionPago, metodoPago === 'tarjeta' && styles.opcionSeleccionada]}
                onPress={() => setMetodoPago('tarjeta')}
              >
                <Ionicons name="card-outline" size={28} color={metodoPago === 'tarjeta' ? '#8B4513' : '#666'} />
                <View style={styles.textoOpcionPago}>
                  <Text style={styles.tituloOpcionPago}>Tarjeta de crédito/débito</Text>
                  <Text style={styles.subtextoOpcionPago}>Visa</Text>
                </View>
                {metodoPago === 'tarjeta' && <Ionicons name="checkmark-circle" size={28} color="#8B4513" />}
              </TouchableOpacity>

            
              {metodoPago === 'tarjeta' && (
                <View style={styles.formularioTarjeta}>
                  <Text style={styles.label}>Número de tarjeta</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="1111 2222 3333 4444"
                    keyboardType="numeric"
                    maxLength={19}
                    value={tarjeta.numero}
                    onChangeText={(text) => {
                     
                      const soloNumeros = text.replace(/[^0-9]/g, '');
                      const formateado = soloNumeros.match(/.{1,4}/g)?.join(' ').substr(0, 19) || '';
                      setTarjeta({ ...tarjeta, numero: formateado });
                    }}
                  />

                  <Text style={styles.label}>Titular de la tarjeta</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Alex Alvarez"
                    value={tarjeta.titular}
                    onChangeText={(text) => setTarjeta({ ...tarjeta, titular: text })}
                    autoCapitalize="words"
                  />

                  <View style={styles.filaDos}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.label}>Expiración (MM/AA)</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="05/28"
                        keyboardType="numeric"
                        maxLength={5}
                        value={tarjeta.expiracion}
                        onChangeText={(text) => {
                          let v = text.replace(/[^0-9]/g, '');
                          if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
                          setTarjeta({ ...tarjeta, expiracion: v });
                        }}
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 15 }}>
                      <Text style={styles.label}>CVV</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="123"
                        keyboardType="numeric"
                        maxLength={4}
                        secureTextEntry
                        value={tarjeta.cvv}
                        onChangeText={(text) => setTarjeta({ ...tarjeta, cvv: text.replace(/[^0-9]/g, '') })}
                      />
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

           
            <TouchableOpacity
              style={[
                styles.botonConfirmar,
                (!metodoPago || (metodoPago === 'tarjeta' && !validarTarjeta())) && styles.botonDeshabilitado
              ]}
              onPress={confirmarPago}
              disabled={!metodoPago || (metodoPago === 'tarjeta' && !validarTarjeta())}
            >
              <Text style={styles.textoConfirmar}>Confirmar método de pago</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#f5f5f5' },


  header: {
    backgroundColor: '#fff',
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerCentro: {
    alignItems: 'center',
  },
  eslogan: {
    fontSize: 15,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },

  tituloContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitulo: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },

  listaCarrito: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  itemCarrito: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    flexDirection: 'row',
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contenedorImagen: {
    width: 80,
    height: 80,
    marginRight: 15,
  },
  imagenProducto: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    resizeMode: 'cover',
  },
  imagenPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoProducto: {
    flex: 1,
    justifyContent: 'space-between',
  },
  nombreProducto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  precioProducto: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 10,
  },
  controlesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlesCantidad: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 5,
  },
  botonCantidad: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  textoCantidad: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 10,
  },
  botonEliminar: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#ffebee',
  },
  subtotalContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  subtotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
  },

  resumenPedido: {
    backgroundColor: '#fff',
    margin: 18,
    marginBottom: 15,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tituloResumen: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  filaResumen: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  textoResumen: {
    fontSize: 16,
    color: '#666',
  },
  separador: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15,
  },
  filaTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  textoTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },

  filaBotonesFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 10,
  },
  botonMetodoPagoCompacto: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#8B4513',
  },
  botonMetodoInactivo: {
    borderColor: '#ccc',
    backgroundColor: '#f0f0f0',
  },
  textoBotonCompacto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B4513',
    marginLeft: 6,
  },
  textoInactivo: {
    color: '#999',
  },
  botonRealizarPedidoCompacto: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B4513',
    paddingVertical: 14,
    borderRadius: 12,
  },
  botonDeshabilitado: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  textoBotonRealizarCompacto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContenido: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '92%',
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  opcionPago: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 15,
    backgroundColor: '#f8f8f8',
    marginBottom: 12,
  },
  opcionSeleccionada: {
    backgroundColor: '#fff4e6',
    borderWidth: 2,
    borderColor: '#8B4513',
  },
  textoOpcionPago: {
    flex: 1,
    marginLeft: 15,
  },
  tituloOpcionPago: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  subtextoOpcionPago: {
    fontSize: 14,
    color: '#666',
  },
  formularioTarjeta: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
  },
  label: {
    fontSize: 14,
    color: '#8B4513',
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filaDos: {
    flexDirection: 'row',
  },
  botonConfirmar: {
    backgroundColor: '#8B4513',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  textoConfirmar: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  cargandoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sinProductos: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  textoSinProductos: {
    fontSize: 20,
    fontWeight: '600',
    color: '#999',
    marginTop: 20,
  },
  subtextoSinProductos: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 10,
  },
});
