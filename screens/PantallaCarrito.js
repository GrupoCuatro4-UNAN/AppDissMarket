import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
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
            
            <Texto estilo={estilos. .textoCantidad}>{artículo. .cantidad}</Texto>
            
            <Opacidad táctil 
              estilo={estilos. .botonCantidad}
              en prensa={() => aumentarCantidad(artículo)}
            >
              <Ionicons nombre="añadir" tamaño={20} color="#8B4513" />
            </Opacidad táctil>
          </Ver>

          {/* Botón eliminar */}
          <Opacidad táctil 
            estilo={estilos. .botonEliminar}
            en prensa={() => removedorDelCarrito(artículo.id)}
          >
            <Ionicons nombre="esquema basura" tamaño={20} color="#ff4757" />
          </Opacidad táctil>
        </Ver>
      </Ver>

      {/* Subtotal */}
      <Ver estilo={estilos. .subtotalContainer}>
        <Texto estilo={estilos. .subtotal}>C$ {(artículo.precio * artículo.cantidad).toFixed(2)}</Texto>
      </Ver>
    </Ver>
  );

  retorno (
    <Vista de área segura estilo={estilos. .contenedor}>
      {/* Encabezado */}
      <Ver estilo={estilos. .encabezado}>
        <Ver estilo={estilos. .logoContenedor}>
        <LogotipoDissmar tamaño="pequeño" mostrar texto={falso} estilo={{ margenDerecho: 10 }} />
          <Texto estilo={estilos. .logoNombre}>DISSMAR</Texto>
        </Ver>
        <Texto estilo={estilos. . .eslogan}>Tu Distribuidora de Confianza</Texto>
      </Ver>

      {/* Típulo de la sección */}
      <Ver estilo={estilos. . .tituloContenedor}>
        <Texto estilo={estilos. . .titulo}>Mi Carrito</Texto>
        <Texto estilo={estilos. . .subtípulo}>
          {artículosCarrito.longitud === 1 ? '1 Producto' : `${artículosCarrito.longitud} Productos`}
        </Texto>
      </Ver>

      {/* Contenido principal */}
      {artículosCarrito.longitud === 0 ? (
        <Ver estilo={estilos. .carroVacio}>
          <Ionicons nombre="esquema del carro" tamaño={80} color="#ccc" />
          <Texto estilo={estilos. .textoCarritoVacio}>Tu carro está vacío</Texto>
          <Texto estilo={estilos. . . .subtextoCarritoVacio}>
            Agrega productos desde el catálogo
          </Texto>
        </Ver>
      ) : (
        <Ver estilo={estilos.contenidoCarrito}>
          {/* Lista de productos */}
          <Lista plana
            datos={artículosCarrito}
            Extractor de claves={(articulo) => articulo.id}
            elemento de renderizado={({ articulo }) => <ArtículoCarrito articulo={articulo} />}
            contenidoEstilo de contenedor={estilos. .listaCarrito}
            música el indicador de desplazamiento vertical={falso}
 />

          {/* Resumen del pedido */}
          <Ver estilo={estilos. . . .resumenPedido}>
            <Texto estilo={estilos. . .títuloResumen}>Resumen del pedido</Texto>
            
            <Ver estilo={estilos. . . .filaResumen}>
              <Texto estilo={estilos. . .textoResumen}>
                Subtotal ({artículosCarrito. .longitud} productos)
              </Texto>
              <Texto estilo={estilos. . . .textoResumen}>C$ {calcularTotal().toFixed(2)}</Texto>
            </Ver>

            <Ver estilo={estilos. . . .filaResumen}>
              <Texto estilo={estilos. . .textoResumen}>Medio ambiente</Texto>
              <Texto estilo={estilos. . . .textoResumen}>Dirección</Texto>
            </Ver>

            <Ver estilo={estilos. .separador} />

            <Ver estilo={estilos. . . .filaTotal}>
              <Texto estilo={estilos. . .textoTotal}>Total</Texto>
              <Texto estilo={estilos. . . .textoTotal}>C$ {calcularTotal().toFixed(2)}</Texto>
            </Ver>

            {/* Botón realizar pedido */}
            <Opacidad táctil 
              estilo={[
                estilos.botonRealizarPedido, 
                (realizandoPedido || cargandoCarrito) && estilos.botonDeshabilitado
              ]}
              en prensa={manejarRealizarPedido}
              incapacitado={realizandoPedido || cargandoCarrito}
            >
              {realizandoPedido ? (
                <Indicador de actividad color="#fff" />
              ) : (
                <Texto estilo={estilos.textoBotonRealizar}>Realizar Pedido</Texto>
              )}
            </Opacidad táctil>
          </Ver>
        </Ver>
      )}
    </SafeAreaView>
 );
}

const estilos = Hoja de estilo.crear({
  contenedor: {
    flex: 1,
    color de fondo: '#f5f5f5',
  },
  encabezado: {
    color de fondo: '#fff',
    RellenoHorizontal: 20,
    RellenoVertical: 15,
    color sombra: '#000',
    desplazamiento de sombra: { ancho: 0, alta: 2 },
    sombraOpacidad: 0,1,
    sombraRadio: 3.84,
    elevación: 5,
  },
  logotipoContenedor: {
    dirección flexible: 'fila',
    alinear elementos: 'centro',
    justificarContenido: 'centro', 
    margenInferior: 5,
  },
  logoCirculo: {
    ancho: 40,
    altura: 40,
    radio fronterizo: 20,
    color de fondo: '#000',
    justificarContenido: 'centro',
    alinear elementos: 'centro',
    margenDerecho: 10,
  },
  logoTexto: {
    tamaño de fuente: 20,
    fontWeight: 'audaz',
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
    acolchado: 15,
    color sombra: '#000',
    desplazamiento de sombra: { ancho: 0, altura: 2 },
    sombraOpacidad: 0,1,
    sombraRadio: 3.84,
    elevación: 5,
  },
  ContenedorImagen: {
    ancho: 80,
    alta: 80,
    Margen Derecho: 15,
  },
  producto de imagen: {
    ancho: '100%',
    alta: '100%',
    radio fronterizo: 10,
    cambiar tamaño de modo: 'cubierta',
  },
  marcador de posición de imagen: {
    ancho: '100%',
    alta: '100%',
    color de fondo: '#f0f0f0',
    radio fronterizo: 10,
    justificarContenido: 'centro',
    alinear elementos: 'centro',
  },
  infoProducto: {
    flex: 1,
    justificarContenido: 'espacio intermedio',
  },
  nombreProducto: {
    tamaño de fuente: 16,
    fontWeight: '600',
    color: '#333',
    margenInferior: 5,
  },
  precioProducto: {
    tamaño de fuente: 18,
    fontWeight: 'audaz',
    color: '#8B4513',
    margenInferior: 10,
  },
  ControlesContenedor: {
    dirección flexible: 'fila',
    justificarContenido: 'espacio intermedio',
    alinear elementos: 'centro',
  },
  controlesCantidad: {
    dirección flexible: 'fila',
    alinear elementos: 'centro',
    color de fondo: '#f0f0f0',
    radio fronterizo: 20,
    RellenoHorizontal: 5,
  },
  botonCantidad: {
    ancho: 30,
    alta: 30,
    radio fronterizo: 15,
    color de fondo: '#fff',
    justificarContenido: 'centro',
    alinear elementos: 'centro',
    margenHorizontal: 5,
  },
  textoCantidad: {
    tamaño de fuente: 16,
    fontWeight: 'audaz',
    color: '#333',
    margenHorizontal: 10,
  },
  botonEliminar: {
    aclamado: 8,
    radio fronterizo: 20,
    color de fondo: '#ffebee',
  },
  subtotalContainer: {
    justificarContenido: 'centro',
    alinear elementos: 'extremadamente flexible',
    Margen Izquierdo: 10,
  },
  subtotal: {
    tamaño de fuente: 18,
    fontWeight: 'audaz',
    color: '#8B4513',
  },
  resumenPedido: {
    color de fondo: '#fff',
    margen: 20,
 margenInferior: 12,
    radio fronterizo: 15,
    aclamado: 20,
    color sombra: '#000',
    desplazamiento de sombra: { ancho: 0, alta: 2 },
    sombraOpacidad: 0,1,
    sombraRadio: 3.84,
    elevación: 5,
  },
  tipuloResumen: {
    tamaño de fuente: 20,
    fontWeight: 'audaz',
    color: '#333',
    margenInferior: 15,
  },
  filaResumen: {
    dirección flexible: 'fila',
    justificarContenido: 'espacio intermedio',
    margenInferior: 10,
  },
  textoResumen: {
    tamaño de fuente: 16,
    color: '#666',
  },
  separador: {
    alta: 1,
    color de fondo: '#e0e0e0',
    margenVertical: 15,
  },
  filaTotal: {
    dirección flexible: 'fila',
    justificarContenido: 'espacio intermedio',
    margenInferior: 20,
  },
  textoTotal: {
    tamaño de fuente: 20,
    fontWeight: 'audaz',
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
