import React, { useState } from 'react';
import {View,Text,FlatList,TouchableOpacity,StyleSheet,SafeAreaView,Image,Alert,ActivityIndicator} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCarrito } from '../contexts/ContextoCarrito';
import { useAuth } from '../contexts/ContextoAuth';
import LogoDissmar from '../components/LogoDissmar';

export default function PantallaCarrito() {
  const { 
    itemsCarrito, 
    removerDelCarrito, 
    actualizarCantidad, 
    calcularTotal, 
    realizarPedido,
    cargandoCarrito 
  } = useCarrito();
  
  const { datosUsuario } = useAuth();
  const [realizandoPedido, setRealizandoPedido] = useState(false);

  // Función para manejar el pedido
 const manejarRealizarPedido = async () => {
  console.log('¡BOTÓN PRESIONADO!');
  console.log('Datos del usuario:', datosUsuario);
  console.log('Items en carrito:', itemsCarrito);
  
  if (itemsCarrito.length === 0) {
    Alert.alert('Carrito vacío', 'Agrega productos al carrito para realizar un pedido');
    return;
  }

  // Mostrar opciones de dirección
  Alert.alert(
    'Dirección de entrega',
    '¿Dónde deseas recibir tu pedido?',
    [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Mi dirección registrada',
        onPress: () => {
          const direccionRegistrada = datosUsuario?.direccion || 'Dirección no especificada';
          confirmarPedidoConDireccion(direccionRegistrada);
        }
      },
      {
        text: 'Otra dirección',
        onPress: () => solicitarDireccionPersonalizada()
      }
    ]
  );
};

// Nueva función para solicitar dirección personalizada
const solicitarDireccionPersonalizada = () => {
  Alert.prompt(
    'Nueva dirección de entrega',
    'Ingresa la dirección donde deseas recibir tu pedido:',
    [
      {
        text: 'Cancelar',
        style: 'cancel'
      },
      {
        text: 'Confirmar pedido',
        onPress: (direccion) => {
          if (direccion && direccion.trim()) {
            confirmarPedidoConDireccion(direccion.trim());
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

// Función para confirmar pedido con dirección específica
const confirmarPedidoConDireccion = (direccionEnvio) => {
  Alert.alert(
    'Confirmar pedido',
    `¿Deseas realizar el pedido por C$ ${calcularTotal().toFixed(2)}?\n\nDirección de envío: ${direccionEnvio}`,
    [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Confirmar',
        onPress: async () => {
          console.log('Usuario confirmó el pedido - iniciando proceso...');
          setRealizandoPedido(true);
          
          try {
            const resultado = await realizarPedido(direccionEnvio);
            console.log('Resultado del pedido:', resultado);
            
            if (resultado.success) {
              console.log('¡Pedido realizado exitosamente!');
              Alert.alert(
                '¡Pedido realizado!',
                `Tu pedido ha sido procesado correctamente.\nTotal: C$ ${calcularTotal().toFixed(2)}\nDirección: ${direccionEnvio}`,
                [{ text: 'OK' }]
              );
            }
          } catch (error) {
            console.error('Error al procesar pedido:', error);
            Alert.alert('Error', 'Hubo un problema al procesar tu pedido');
          }
          
          setRealizandoPedido(false);
        },
      },
    ]
  );
};

  // Función para aumentar cantidad
  const aumentarCantidad = async (item) => {
    await actualizarCantidad(item.id, item.cantidad + 1);
  };

  // Función para disminuir cantidad
  const disminuirCantidad = async (item) => {
    if (item.cantidad > 1) {
      await actualizarCantidad(item.id, item.cantidad - 1);
    } else {
      Alert.alert(
        'Eliminar producto',
        `¿Deseas eliminar "${item.nombre}" del carrito?`,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: () => removerDelCarrito(item.id),
          },
        ]
      );
    }
  };

  // Componente para renderizar cada producto del carrito
  const ItemCarrito = ({ item }) => (
    <View style={styles.itemCarrito}>
      {/* Imagen del producto */}
      <View style={styles.contenedorImagen}>
        {item.imagenUrl ? (
          <Image source={{ uri: item.imagenUrl }} style={styles.imagenProducto} />
        ) : (
          <View style={styles.imagenPlaceholder}>
            <Ionicons name="image-outline" size={30} color="#ccc" />
          </View>
        )}
      </View>

      {/* Información del producto */}
      <View style={styles.infoProducto}>
        <Text style={styles.nombreProducto}>{item.nombre}</Text>
        <Text style={styles.precioProducto}>C$ {item.precio.toFixed(2)}</Text>
        
        {/* Controles de cantidad */}
        <View style={styles.controlesContainer}>
          <View style={styles.controlesCantidad}>
            <TouchableOpacity 
              style={styles.botonCantidad}
              onPress={() => disminuirCantidad(item)}
            >
              <Ionicons name="remove" size={20} color="#8B4513" />
            </TouchableOpacity>
            
            <Text style={styles.textoCantidad}>{item.cantidad}</Text>
            
            <TouchableOpacity 
              style={styles.botonCantidad}
              onPress={() => aumentarCantidad(item)}
            >
              <Ionicons name="add" size={20} color="#8B4513" />
            </TouchableOpacity>
          </View>

          {/* Botón eliminar */}
          <TouchableOpacity 
            style={styles.botonEliminar}
            onPress={() => removerDelCarrito(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#ff4757" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Subtotal */}
      <View style={styles.subtotalContainer}>
        <Text style={styles.subtotal}>C$ {(item.precio * item.cantidad).toFixed(2)}</Text>
      </View>
    </View>
  );

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
        <Text style={styles.titulo}>Mi Carrito</Text>
        <Text style={styles.subtitulo}>
          {itemsCarrito.length === 1 ? '1 Producto' : `${itemsCarrito.length} Productos`}
        </Text>
      </View>

      {/* Contenido principal */}
      {itemsCarrito.length === 0 ? (
        <View style={styles.carritoVacio}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <Text style={styles.textoCarritoVacio}>Tu carrito está vacío</Text>
          <Text style={styles.subtextoCarritoVacio}>
            Agrega productos desde el catálogo
          </Text>
        </View>
      ) : (
        <View style={styles.contenidoCarrito}>
          {/* Lista de productos */}
          <FlatList
            data={itemsCarrito}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ItemCarrito item={item} />}
            contentContainerStyle={styles.listaCarrito}
            showsVerticalScrollIndicator={false}
          />

          {/* Resumen del pedido */}
          <View style={styles.resumenPedido}>
            <Text style={styles.tituloResumen}>Resumen del pedido</Text>
            
            <View style={styles.filaResumen}>
              <Text style={styles.textoResumen}>
                Subtotal ({itemsCarrito.length} productos)
              </Text>
              <Text style={styles.textoResumen}>C$ {calcularTotal().toFixed(2)}</Text>
            </View>

            <View style={styles.filaResumen}>
              <Text style={styles.textoResumen}>Envíoo</Text>
              <Text style={styles.textoResumen}>Direcciónn</Text>
            </View>

            <View style={styles.separador} />

            <View style={styles.filaTotal}>
              <Text style={styles.textoTotal}>Total</Text>
              <Text style={styles.textoTotal}>C$ {calcularTotal().toFixed(2)}</Text>
            </View>

            {/* Botón realizar pedido */}
            <TouchableOpacity 
              style={[
                styles.botonRealizarPedido, 
                (realizandoPedido || cargandoCarrito) && styles.botonDeshabilitado
              ]}
              onPress={manejarRealizarPedido}
              disabled={realizandoPedido || cargandoCarrito}
            >
              {realizandoPedido ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.textoBotonRealizar}>Realizar Pedido</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
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
    marginBottom: 6,
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
    marginLeft: 15,
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
  carritoVacio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  textoCarritoVacio: {
    fontSize: 24,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtextoCarritoVacio: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
  contenidoCarrito: {
    flex: 1,
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
  botonRealizarPedido: {
    backgroundColor: '#8B4513',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  botonDeshabilitado: {
    backgroundColor: '#ccc',
  },
  textoBotonRealizar: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
