import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavoritos } from '../contexts/ContextoFavoritos';
import { useCarrito } from '../contexts/ContextoCarrito';
import LogoDissmar from '../components/LogoDissmar';

export default function PantallaFavoritos() {
  const { favoritos, removerDeFavoritos, cargandoFavoritos } = useFavoritos();
  const { agregarAlCarrito } = useCarrito();

  // Función para agregar favorito al carrito
  const manejarAgregarAlCarrito = async (producto) => {
    await agregarAlCarrito(producto, 1);
  };

  // Función para confirmar eliminación de favorito
  const confirmarEliminarFavorito = (producto) => {
    Alert.alert(
      'Eliminar favorito',
      `¿Estás seguro de que deseas eliminar "${producto.nombre}" de tus favoritos?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => removerDeFavoritos(producto.id),
        },
      ]
    );
  };

  // Componente para renderizar cada producto favorito
  const TarjetaFavorito = ({ item }) => (
    <View style={styles.tarjetaFavorito}>
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
        
        {/* Botones de acción */}
        <View style={styles.botonesAccion}>
          <TouchableOpacity 
            style={styles.botonEliminar}
            onPress={() => confirmarEliminarFavorito(item)}
          >
            <Ionicons name="heart" size={20} color="#ff4757" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.botonAgregarCarrito}
            onPress={() => manejarAgregarAlCarrito(item)}
          >
            <Text style={styles.textoBotonAgregar}>Agregar al carrito</Text>
          </TouchableOpacity>
        </View>
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
        <Text style={styles.titulo}>Mis Favoritos</Text>
        <Text style={styles.subtitulo}>
          {favoritos.length === 1 ? '1 producto favorito' : `${favoritos.length} productos favoritos`}
        </Text>
      </View>

      {/* Lista de favoritos o mensaje vacío */}
      {favoritos.length === 0 ? (
        <View style={styles.sinFavoritos}>
          <Ionicons name="heart-outline" size={80} color="#ccc" />
          <Text style={styles.textoSinFavoritos}>No tienes favoritos aún</Text>
          <Text style={styles.subtextoSinFavoritos}>
            Agrega productos a favoritos desde el catálogo
          </Text>
        </View>
      ) : (
        <FlatList
          data={favoritos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TarjetaFavorito item={item} />}
          contentContainerStyle={styles.listaFavoritos}
          showsVerticalScrollIndicator={false}
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
    marginLeft: 50,
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
  sinFavoritos: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  textoSinFavoritos: {
    fontSize: 24,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtextoSinFavoritos: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
  listaFavoritos: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tarjetaFavorito: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contenedorImagen: {
    width: 100,
    height: 100,
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
  infoProducto: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  nombreProducto: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  precioProducto: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 10,
  },
  botonesAccion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  botonEliminar: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#ffebee',
  },
  botonAgregarCarrito: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    flex: 1,
    marginLeft: 15,
  },
  textoBotonAgregar: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
});