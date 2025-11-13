import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useCarrito } from '../contexts/ContextoCarrito';
import { useFavoritos } from '../contexts/ContextoFavoritos';
import { useAuth } from '../contexts/ContextoAuth';
import LogoDissmar from '../components/LogoDissmar';


export default function PantallaCatalogo() {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const { agregarAlCarrito } = useCarrito();
  const { alternarFavorito, esFavorito } = useFavoritos();
  const { datosUsuario } = useAuth();


  const cargarProductos = async () => {
    try {
      setCargando(true);
      
    
      const q = query(
        collection(db, 'productos'), 
        where('activo', '==', true),  
        orderBy('nombre')
      );
      
      const querySnapshot = await getDocs(q);
      const productosData = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        productosData.push({
          id: doc.id,
          ...data
        });
      });

      setProductos(productosData);
      setProductosFiltrados(productosData);
      
      console.log(`✅ Productos activos cargados: ${productosData.length}`); 
    } catch (error) {
      console.error('Error al cargar productos:', error);
      Alert.alert('Error', 'No se pudieron cargar los productos');
    } finally {
      setCargando(false);
    }
  };

  // Función para refrescar los productos
  const onRefresh = async () => {
    setRefrescando(true);
    await cargarProductos();
    setRefrescando(false);
  };

 
  const filtrarProductos = (texto) => {
    setTextoBusqueda(texto);
    if (texto.trim() === '') {
     
      setProductosFiltrados(productos.filter(p => p.activo !== false));
    } else {
      const filtrados = productos.filter(producto =>
        // Verificar que el producto esté activo Y coincida con la búsqueda
        producto.activo !== false && (
          producto.nombre.toLowerCase().includes(texto.toLowerCase()) ||
          (producto.categoria && producto.categoria.toLowerCase().includes(texto.toLowerCase()))
        )
      );
      setProductosFiltrados(filtrados);
    }
  };

  // Función para manejar agregar al carrito
  const manejarAgregarCarrito = async (producto) => {
    await agregarAlCarrito(producto, 1);
  };

  // Función para manejar favoritos
  const manejarFavorito = async (producto) => {
    await alternarFavorito(producto);
  };

  // Componente para renderizar cada producto
  const TarjetaProducto = ({ item }) => (
    <View style={styles.tarjetaProducto}>
     
      <View style={styles.contenedorImagen}>
        {item.imagenUrl ? (
          <Image source={{ uri: item.imagenUrl }} style={styles.imagenProducto} />
        ) : (
          <View style={styles.imagenPlaceholder}>
            <Ionicons name="image-outline" size={40} color="#ccc" />
          </View>
        )}
        
        {/* Botón de favorito */}
        <TouchableOpacity 
          style={styles.botonFavorito}
          onPress={() => manejarFavorito(item)}
        >
          <Ionicons 
            name={esFavorito(item.id) ? "heart" : "heart-outline"} 
            size={24} 
            color={esFavorito(item.id) ? "#ff4757" : "#666"} 
          />
        </TouchableOpacity>
      </View>

      {/* Información del producto */}
      <View style={styles.infoProducto}>
        <Text style={styles.nombreProducto}>{item.nombre}</Text>
        <Text style={styles.precioProducto}>C$ {item.precio.toFixed(2)}</Text>
        
        {/* Mostrar stock disponible si existe */}
        {item.stock !== undefined && (
          <Text style={styles.stockProducto}>
            Stock: {item.stock > 0 ? item.stock : 'Agotado'}
          </Text>
        )}
        
        {/* Deshabilitar si no hay stock */}
        <TouchableOpacity 
          style={[
            styles.botonAgregar,
            item.stock !== undefined && item.stock <= 0 && styles.botonDeshabilitado
          ]}
          onPress={() => manejarAgregarCarrito(item)}
          disabled={item.stock !== undefined && item.stock <= 0}
        >
          <Ionicons 
            name={item.stock > 0 ? "add-circle-outline" : "close-circle-outline"} 
            size={20} 
            color={item.stock > 0 ? "#8B4513" : "#999"} 
          />
          <Text style={[
            styles.textoBotonAgregar,
            item.stock <= 0 && styles.textoBotonDeshabilitado
          ]}>
            {item.stock > 0 ? 'Agregar' : 'Sin stock'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Cargar productos al montar el componente
  useEffect(() => {
    cargarProductos();
  }, []);

  return (
    <SafeAreaView style={styles.contenedor}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <LogoDissmar size="small" />
        </View>
        <Text style={styles.eslogan}>Tu Distribuidora de Confianza</Text>
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.contenedorBusqueda}>
        <Ionicons name="search-outline" size={24} color="#666" style={styles.iconoBusqueda} />
        <TextInput
          style={styles.inputBusqueda}
          placeholder="Buscar productos"
          placeholderTextColor="#999"
          value={textoBusqueda}
          onChangeText={filtrarProductos}
        />
      </View>

      {/* Saludo personalizado */}
      {datosUsuario && (
        <View style={styles.saludoContainer}>
          <Text style={styles.textoSaludo}>
            ¡Hola {datosUsuario.nombreCompleto?.split(' ')[0]}!
          </Text>
        </View>
      )}

      {/* Lista de productos */}
      {cargando ? (
        <View style={styles.cargandoContainer}>
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={styles.textoCargando}>Cargando productos...</Text>
        </View>
      ) : (
        <FlatList
          data={productosFiltrados}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TarjetaProducto item={item} />}
          numColumns={2}
          columnWrapperStyle={styles.fila}
          contentContainerStyle={styles.listaProductos}
          refreshControl={
            <RefreshControl
              refreshing={refrescando}
              onRefresh={onRefresh}
              colors={['#8B4513']}
            />
          }
          ListEmptyComponent={
            <View style={styles.sinProductos}>
              <Ionicons name="basket-outline" size={64} color="#ccc" />
              <Text style={styles.textoSinProductos}>No se encontraron productos</Text>
            </View>
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
    marginLeft: 20,
    textAlign: 'center',
  },
  contenedorBusqueda: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 25,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  iconoBusqueda: {
    marginRight: 10,
  },
  inputBusqueda: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  saludoContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  textoSaludo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B4513',
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
  listaProductos: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  fila: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  tarjetaProducto: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginVertical: 8,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contenedorImagen: {
    position: 'relative',
    height: 150,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    overflow: 'hidden',
  },
  imagenProducto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagenPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonFavorito: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 8,
  },
  infoProducto: {
    padding: 15,
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
    marginBottom: 5,
  },
 
  stockProducto: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  botonAgregar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  
  botonDeshabilitado: {
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
  },
  textoBotonAgregar: {
    color: '#8B4513',
    fontWeight: '600',
    marginLeft: 5,
  },
 
  textoBotonDeshabilitado: {
    color: '#999',
  },
  sinProductos: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  textoSinProductos: {
    fontSize: 18,
    color: '#ccc',
    marginTop: 10,
  },
});