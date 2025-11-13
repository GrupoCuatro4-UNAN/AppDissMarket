import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  FlatList,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/ContextoAuth';
import LogoDissmar from '../components/LogoDissmar';

export default function PantallaAdministracion({ navigation }) {
  const { datosUsuario } = useAuth();
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoria, setCategoria] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [stock, setStock] = useState('');
  const [activo, setActivo] = useState(true);
  const [guardando, setGuardando] = useState(false);
  
  
 
  const [productos, setProductos] = useState([]);
  const [cargandoProductos, setCargandoProductos] = useState(false);
  const [busqueda, setBusqueda] = useState('');
   const [modalAgregar, setModalAgregar] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);

  // Verifica si el usuario es administrador
 
  
   const noEsAdmin = !datosUsuario?.esAdmin;

  useEffect(() => {
    if (!noEsAdmin) {
      cargarProductos();
    }
  }, [noEsAdmin]);

  // Si no es admin, mostrar pantalla de no autorizado
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


  // Función para cargar productos
  const cargarProductos = async () => {
    setCargandoProductos(true);
    try {
      const q = query(collection(db, 'productos'), orderBy('nombre'));
      const querySnapshot = await getDocs(q);
      const productosData = [];
      
      querySnapshot.forEach((doc) => {
        productosData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setProductos(productosData);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      Alert.alert('Error', 'No se pudieron cargar los productos');
    } finally {
      setCargandoProductos(false);
    }
  };

  // Función para buscar productos
  const productosFiltrados = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (producto.categoria && producto.categoria.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const validarFormulario = () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre del producto es obligatorio');
      return false;
    }
    if (!precio.trim() || isNaN(parseFloat(precio))) {
      Alert.alert('Error', 'El precio debe ser un número válido');
      return false;
    }
    if (parseFloat(precio) <= 0) {
      Alert.alert('Error', 'El precio debe ser mayor a 0');
      return false;
    }
    return true;
  };

  const limpiarFormulario = () => {
    setNombre('');
    setPrecio('');
    setCategoria('');
    setImagenUrl('');
    setDescripcion('');
    setStock('');
    setActivo(true);
  };

  const agregarProducto = async () => {
    if (!validarFormulario()) return;

    setGuardando(true);

    try {
      const nuevoProducto = {
        nombre: nombre.trim(),
        precio: parseFloat(precio),
        categoria: categoria.trim() || 'General',
        imagenUrl: imagenUrl.trim() || '',
        descripcion: descripcion.trim() || '',
        stock: stock.trim() ? parseInt(stock) : 0,
        activo: activo,
        fechaCreacion: new Date(),
        disponible: true
      };

      await addDoc(collection(db, 'productos'), nuevoProducto);

      Alert.alert(
        '¡Éxito!',
        'Producto agregado correctamente al catálogo',
       
      );

      limpiarFormulario();
       setModalAgregar(false); 
       cargarProductos();
    } catch (error) {
      console.error('Error al agregar producto:', error);
      Alert.alert('Error', 'No se pudo agregar el producto. Intenta nuevamente.');
    } finally {
      setGuardando(false);
    }
  };

  // Función para editar productos
  const abrirModalEdicion = (producto) => {
    setProductoEditando(producto);
    setNombre(producto.nombre);
    setPrecio(producto.precio.toString());
    setCategoria(producto.categoria || '');
    setImagenUrl(producto.imagenUrl || '');
    setDescripcion(producto.descripcion || '');
    setStock(producto.stock ? producto.stock.toString() : '0');
    setActivo(producto.activo !== undefined ? producto.activo : true);
    setModalEditar(true);
  };

  // Función para actualizar producto
  const actualizarProducto = async () => {
    if (!validarFormulario()) return;

    setGuardando(true);

    try {
      const productoActualizado = {
        nombre: nombre.trim(),
        precio: parseFloat(precio),
        categoria: categoria.trim() || 'General',
        imagenUrl: imagenUrl.trim() || '',
        descripcion: descripcion.trim() || '',
        stock: stock.trim() ? parseInt(stock) : 0,
        activo: activo,
        fechaActualizacion: new Date()
      };

      await updateDoc(doc(db, 'productos', productoEditando.id), productoActualizado);

      Alert.alert('¡Éxito!', 'Producto actualizado correctamente');
      setModalEditar(false);
      limpiarFormulario();
      cargarProductos();
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      Alert.alert('Error', 'No se pudo actualizar el producto');
    } finally {
      setGuardando(false);
    }
  };

  const alternarEstadoProducto = async (producto) => {
    try {
      const nuevoEstado = !producto.activo;
      await updateDoc(doc(db, 'productos', producto.id), {
        activo: nuevoEstado,
        fechaActualizacion: new Date()
      });
      
      Alert.alert(
        '¡Actualizado!',
        `El producto ahora está ${nuevoEstado ? 'activo' : 'inactivo'}`
      );
      cargarProductos();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      Alert.alert('Error', 'No se pudo cambiar el estado del producto');
    }
  };
  // Función para eliminar producto
  const eliminarProducto = (producto) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que deseas eliminar "${producto.nombre}"?\n\nEsta acción no se puede deshacer.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'productos', producto.id));
              Alert.alert('¡Éxito!', 'Producto eliminado correctamente');
              cargarProductos();
            } catch (error) {
              console.error('Error al eliminar producto:', error);
              Alert.alert('Error', 'No se pudo eliminar el producto');
            }
          }
        }
      ]
    );
  };

  
 const TarjetaProducto = ({ item }) => (
    <View style={styles.tarjetaProductoLista}>
      <View style={styles.imagenProductoContainer}>
        {item.imagenUrl ? (
          <Image source={{ uri: item.imagenUrl }} style={styles.imagenProductoLista} />
        ) : (
          <View style={styles.imagenPlaceholder}>
            <Ionicons name="image-outline" size={30} color="#ccc" />
          </View>
        )}
        {item.activo !== undefined && (
          <View style={[styles.badgeEstado, { backgroundColor: item.activo ? '#4CAF50' : '#ff4757' }]}>
            <Text style={styles.textoBadgeEstado}>{item.activo ? 'Activo' : 'Inactivo'}</Text>
          </View>
        )}
      </View>

      <View style={styles.infoProductoLista}>
        <Text style={styles.nombreProductoLista}>{item.nombre}</Text>
        <Text style={styles.precioProductoLista}>C$ {item.precio.toFixed(2)}</Text>
        {item.categoria && (
          <Text style={styles.categoriaProductoLista}>{item.categoria}</Text>
        )}
        {item.stock !== undefined && (
          <View style={styles.stockContainer}>
            <Ionicons name="cube-outline" size={14} color="#666" />
            <Text style={styles.stockTexto}>Stock: {item.stock}</Text>
          </View>
        )}
      </View>

      <View style={styles.botonesProducto}>
       
        <TouchableOpacity 
          style={[styles.botonIcono, { backgroundColor: item.activo ? '#e8f5e9' : '#ffebee' }]}
          onPress={() => alternarEstadoProducto(item)}
        >
          <Ionicons 
            name={item.activo ? "eye-outline" : "eye-off-outline"} 
            size={24} 
            color={item.activo ? '#4CAF50' : '#ff4757'} 
          />
        </TouchableOpacity>

        {/* Botón editar */}
        <TouchableOpacity 
          style={styles.botonIcono}
          onPress={() => abrirModalEdicion(item)}
        >
          <Ionicons name="create-outline" size={24} color="#8B4513" />
        </TouchableOpacity>
        
        {/* Botón eliminar */}
        <TouchableOpacity 
          style={[styles.botonIcono, styles.botonEliminarIcono]}
          onPress={() => eliminarProducto(item)}
        >
          <Ionicons name="trash-outline" size={24} color="#ff4757" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const FormularioProducto = () => (
    <>
      <View style={styles.campoContainer}>
        <Text style={styles.etiqueta}>Nombre del Producto *</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="pricetag-outline" size={20} color="#666" style={styles.icono} />
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Ej: Aceite de Cocina 1L"
            placeholderTextColor="#999"
            autoCapitalize="words"
          />
        </View>
      </View>

      <View style={styles.campoContainer}>
        <Text style={styles.etiqueta}>Precio (C$) *</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="cash-outline" size={20} color="#666" style={styles.icono} />
          <TextInput
            style={styles.input}
            value={precio}
            onChangeText={setPrecio}
            placeholder="0.00"
            placeholderTextColor="#999"
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      <View style={styles.campoContainer}>
        <Text style={styles.etiqueta}>Categoría</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="apps-outline" size={20} color="#666" style={styles.icono} />
          <TextInput
            style={styles.input}
            value={categoria}
            onChangeText={setCategoria}
            placeholder="Ej: Alimentos, Bebidas, Limpieza"
            placeholderTextColor="#999"
            autoCapitalize="words"
          />
        </View>
      </View>

      <View style={styles.campoContainer}>
        <Text style={styles.etiqueta}>URL de la Imagen</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="image-outline" size={20} color="#666" style={styles.icono} />
          <TextInput
            style={styles.input}
            value={imagenUrl}
            onChangeText={setImagenUrl}
            placeholder="https://ejemplo.com/imagen.jpg"
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        {imagenUrl.trim() !== '' && (
          <View style={styles.previsualizacion}>
            <Text style={styles.textoPrevisualizacion}>Vista previa:</Text>
            <Image 
              source={{ uri: imagenUrl }} 
              style={styles.imagenPrevia}
              onError={() => Alert.alert('Error', 'No se pudo cargar la imagen')}
            />
          </View>
        )}
      </View>

      <View style={styles.campoContainer}>
        <Text style={styles.etiqueta}>Descripción</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="document-text-outline" size={20} color="#666" style={styles.icono} />
          <TextInput
            style={[styles.input, styles.inputMultilinea]}
            value={descripcion}
            onChangeText={setDescripcion}
            placeholder="Descripción del producto..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </View>

      <View style={styles.campoContainer}>
        <Text style={styles.etiqueta}>Stock Disponible</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="cube-outline" size={20} color="#666" style={styles.icono} />
          <TextInput
            style={styles.input}
            value={stock}
            onChangeText={setStock}
            placeholder="0"
            placeholderTextColor="#999"
            keyboardType="number-pad"
          />
        </View>
      </View>

      <View style={styles.campoContainer}>
        <View style={styles.switchContainer}>
          <View style={styles.switchInfo}>
            <Ionicons name="power-outline" size={20} color="#666" />
            <View style={styles.switchTextos}>
              <Text style={styles.etiqueta}>Producto Activo</Text>
              <Text style={styles.subtextoSwitch}>
                {activo ? 'Visible en el catálogo' : 'Oculto del catálogo'}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.switchButton, activo && styles.switchButtonActivo]}
            onPress={() => setActivo(!activo)}
          >
            <View style={[styles.switchCircle, activo && styles.switchCircleActivo]} />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.contenedor}>
      {}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.botonAtras}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.tituloHeader}>
          <Text style={styles.textoTitulo}>Gestión de Productos</Text>
        </View>
        
        
        <TouchableOpacity 
          style={styles.botonAgregarHeader}
          onPress={() => {
            limpiarFormulario();
            setModalAgregar(true);
          }}
        >
          <Ionicons name="add-circle" size={32} color="#8B4513" />
        </TouchableOpacity>
       
      </View>

      
      <View style={styles.vistaGestionar}>
        {/* Barra de búsqueda */}
        <View style={styles.barraBusqueda}>
          <Ionicons name="search-outline" size={24} color="#666" />
          <TextInput
            style={styles.inputBusqueda}
            placeholder="Buscar productos..."
            placeholderTextColor="#999"
            value={busqueda}
            onChangeText={setBusqueda}
          />
          {busqueda !== '' && (
            <TouchableOpacity onPress={() => setBusqueda('')}>
              <Ionicons name="close-circle" size={24} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        {/* Contador de productos */}
        <View style={styles.contadorProductos}>
          <Text style={styles.textoContador}>
            {productosFiltrados.length} {productosFiltrados.length === 1 ? 'producto' : 'productos'}
          </Text>
          <TouchableOpacity onPress={cargarProductos}>
            <Ionicons name="refresh-outline" size={24} color="#8B4513" />
          </TouchableOpacity>
        </View>

        {/* Lista de productos */}
        {cargandoProductos ? (
          <View style={styles.cargandoContainer}>
            <ActivityIndicator size="large" color="#8B4513" />
            <Text style={styles.textoCargando}>Cargando productos...</Text>
          </View>
        ) : productosFiltrados.length === 0 ? (
          <View style={styles.sinProductos}>
            <Ionicons name="basket-outline" size={64} color="#ccc" />
            <Text style={styles.textoSinProductos}>
              {busqueda ? 'No se encontraron productos' : 'No hay productos en el catálogo'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={productosFiltrados}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TarjetaProducto item={item} />}
            contentContainerStyle={styles.listaProductos}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
     

     
      <Modal
        visible={modalAgregar}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setModalAgregar(false);
          limpiarFormulario();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContenido}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitulo}>Agregar Producto</Text>
                <TouchableOpacity 
                  onPress={() => {
                    setModalAgregar(false);
                    limpiarFormulario();
                  }}
                >
                  <Ionicons name="close-circle-outline" size={30} color="#666" />
                </TouchableOpacity>
              </View>

              <FormularioProducto />

              <TouchableOpacity 
                style={[styles.botonActualizar, guardando && styles.botonDeshabilitado]}
                onPress={agregarProducto}
                disabled={guardando}
              >
                {guardando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="add-circle-outline" size={20} color="#fff" />
                    <Text style={styles.textoBotonActualizar}>Agregar Producto</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
     
      <Modal
        visible={modalEditar}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setModalEditar(false);
          limpiarFormulario();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContenido}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitulo}>Editar Producto</Text>
                <TouchableOpacity 
                  onPress={() => {
                    setModalEditar(false);
                    limpiarFormulario();
                  }}
                >
                  <Ionicons name="close-circle-outline" size={30} color="#666" />
                </TouchableOpacity>
              </View>

              <FormularioProducto />

              <TouchableOpacity 
                style={[styles.botonActualizar, guardando && styles.botonDeshabilitado]}
                onPress={actualizarProducto}
                disabled={guardando}
              >
                {guardando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                    <Text style={styles.textoBotonActualizar}>Actualizar Producto</Text>
                  </>
                )}
              </TouchableOpacity>
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

   botonAgregarHeader: {
    padding: 5,
  },
  espacioVacio: {
    width: 34,
  },
 tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  tabActivo: {
    backgroundColor: '#f0e6dc',
  },
  textoTab: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  textoTabActivo: {
    color: '#8B4513',
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 30,
    marginBottom: 20,
  },
  badgeAdmin: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B4513',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 15,
  },
  textoAdmin: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  formulario: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tituloFormulario: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 25,
    textAlign: 'center',
  },
  campoContainer: {
    marginBottom: 20,
  },
  etiqueta: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  icono: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
  },
  inputMultilinea: {
    minHeight: 100,
    paddingTop: 15,
  },
  previsualizacion: {
    marginTop: 15,
    alignItems: 'center',
  },
  textoPrevisualizacion: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  imagenPrevia: {
    width: 150,
    height: 150,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  botonesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  botonLimpiar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flex: 1,
    marginRight: 10,
  },
  textoBotonLimpiar: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  botonAgregar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B4513',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flex: 1,
    marginLeft: 10,
  },
  botonDeshabilitado: {
    backgroundColor: '#ccc',
  },
  textoBotonAgregar: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  notaCampos: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 15,
    fontStyle: 'italic',
  },
  seccionAccesos: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tituloSeccion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  accesoRapido: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  textoAcceso: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
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
  vistaGestionar: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  barraBusqueda: {
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
  inputBusqueda: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  contadorProductos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 10,
  },
  textoContador: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cargandoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  textoCargando: {
    marginTop: 10,
    fontSize: 16,
    color: '#8B4513',
  },
  sinProductos: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  textoSinProductos: {
    fontSize: 18,
    color: '#999',
    marginTop: 15,
    textAlign: 'center',
  },
  listaProductos: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tarjetaProductoLista: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imagenProductoContainer: {
    width: 80,
    height: 80,
    marginRight: 15,
  },
  imagenProductoLista: {
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
  infoProductoLista: {
    flex: 1,
    justifyContent: 'center',
  },
  nombreProductoLista: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  precioProductoLista: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 5,
  },
  categoriaProductoLista: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  botonesProducto: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonIcono: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    marginBottom: 10,
  },
  botonEliminarIcono: {
    backgroundColor: '#ffebee',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContenido: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  botonActualizar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B4513',
    borderRadius: 10,
    paddingVertical: 15,
    marginTop: 20,
  },
  textoBotonActualizar: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});