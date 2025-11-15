import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/ContextoAuth';
import LogoDissmar from '../components/LogoDissmar';

const screenWidth = Dimensions.get('window').width;

export default function PantallaDashboard({ navigation }) {
  const { datosUsuario } = useAuth();
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  
  // Estados para métricas
  const [totalVentas, setTotalVentas] = useState(0);
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [pedidosPendientes, setPedidosPendientes] = useState(0);
  const [totalProductos, setTotalProductos] = useState(0);
  
  // Estados para gráficos
  const [ventasPorMes, setVentasPorMes] = useState([]);
  const [productosMasVendidos, setProductosMasVendidos] = useState([]);
  const [estadosPedidos, setEstadosPedidos] = useState([]);

  const noEsAdmin = !datosUsuario?.esAdmin;

  useEffect(() => {
    if (!noEsAdmin) {
      cargarDatos();
    }
  }, [noEsAdmin]);

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

  const cargarDatos = async () => {
    try {
      setCargando(true);
      
      // Cargar pedidos
      const pedidosSnapshot = await getDocs(collection(db, 'pedidos'));
      const pedidos = [];
      let ventas = 0;
      let pendientes = 0;
      
      // Contadores para estados
      const contadorEstados = {
        pendiente: 0,
        en_camino: 0,
        entregado: 0,
        cancelado: 0
      };
      
      pedidosSnapshot.forEach((doc) => {
        const pedido = { id: doc.id, ...doc.data() };
        pedidos.push(pedido);
        
        // Sumar ventas solo de pedidos entregados
        if (pedido.estado === 'entregado') {
          ventas += pedido.total || 0;
        }
        
        // Contar pendientes
        if (pedido.estado === 'pendiente') {
          pendientes++;
        }
        
        // Contar estados
        if (contadorEstados.hasOwnProperty(pedido.estado)) {
          contadorEstados[pedido.estado]++;
        }
      });
      
      setTotalVentas(ventas);
      setTotalPedidos(pedidos.length);
      setPedidosPendientes(pendientes);
      
   
      const datosEstados = [
        {
          name: 'Pendiente',
          cantidad: contadorEstados.pendiente,
          color: '#ff9500',
          legendFontColor: '#333',
          legendFontSize: 12
        },
        {
          name: 'En Camino',
          cantidad: contadorEstados.en_camino,
          color: '#2196F3',
          legendFontColor: '#333',
          legendFontSize: 12
        },
        {
          name: 'Entregado',
          cantidad: contadorEstados.entregado,
          color: '#4CAF50',
          legendFontColor: '#333',
          legendFontSize: 12
        },
        {
          name: 'Cancelado',
          cantidad: contadorEstados.cancelado,
          color: '#ff4757',
          legendFontColor: '#333',
          legendFontSize: 12
        }
      ];
      setEstadosPedidos(datosEstados);
      
     
      calcularVentasPorMes(pedidos);
      
      // Calcular productos más vendidos
      calcularProductosMasVendidos(pedidos);
      
      
      const productosSnapshot = await getDocs(collection(db, 'productos'));
      setTotalProductos(productosSnapshot.size);
      
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setCargando(false);
    }
  };

  const calcularVentasPorMes = (pedidos) => {
    const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const ahora = new Date();
    const ventasMensuales = {};
    
   
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      const key = `${fecha.getFullYear()}-${fecha.getMonth()}`;
      ventasMensuales[key] = {
        mes: mesesNombres[fecha.getMonth()],
        total: 0
      };
    }
    
    // Sumar ventas por mes
    pedidos.forEach(pedido => {
      if (pedido.fechaPedido && pedido.estado === 'entregado') {
        const fecha = pedido.fechaPedido.toDate ? pedido.fechaPedido.toDate() : new Date(pedido.fechaPedido);
        const key = `${fecha.getFullYear()}-${fecha.getMonth()}`;
        
        if (ventasMensuales[key]) {
          ventasMensuales[key].total += pedido.total || 0;
        }
      }
    });
    
    const datos = Object.values(ventasMensuales);
    setVentasPorMes(datos);
  };

  const calcularProductosMasVendidos = (pedidos) => {
    const contadorProductos = {};
    
    // Contar productos vendidos
    pedidos.forEach(pedido => {
      if (pedido.estado === 'entregado' && pedido.items) {
        pedido.items.forEach(item => {
          if (contadorProductos[item.nombre]) {
            contadorProductos[item.nombre] += item.cantidad;
          } else {
            contadorProductos[item.nombre] = item.cantidad;
          }
        });
      }
    });
    
   
    const productosArray = Object.entries(contadorProductos)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5); 
    
    setProductosMasVendidos(productosArray);
  };

  const onRefresh = async () => {
    setRefrescando(true);
    await cargarDatos();
    setRefrescando(false);
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(139, 69, 19, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#8B4513'
    }
  };

  return (
    <SafeAreaView style={styles.contenedor}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <LogoDissmar size="small" />
          <Text style={styles.tituloHeader}>Dashboard</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={onRefresh}
            colors={['#8B4513']}
          />
        }
      >
        {cargando ? (
          <View style={styles.cargandoContainer}>
            <ActivityIndicator size="large" color="#8B4513" />
            <Text style={styles.textoCargando}>Cargando estadísticas...</Text>
          </View>
        ) : (
          <>
          
            <View style={styles.metricas}>
              <View style={[styles.tarjetaMetrica, { backgroundColor: '#4CAF50' }]}>
                <Ionicons name="cash-outline" size={32} color="#fff" />
                <Text style={styles.valorMetrica}>C$ {totalVentas.toFixed(2)}</Text>
                <Text style={styles.labelMetrica}>Ventas Totales</Text>
              </View>

              <View style={[styles.tarjetaMetrica, { backgroundColor: '#2196F3' }]}>
                <Ionicons name="receipt-outline" size={32} color="#fff" />
                <Text style={styles.valorMetrica}>{totalPedidos}</Text>
                <Text style={styles.labelMetrica}>Pedidos</Text>
              </View>

              <View style={[styles.tarjetaMetrica, { backgroundColor: '#ff9500' }]}>
                <Ionicons name="time-outline" size={32} color="#fff" />
                <Text style={styles.valorMetrica}>{pedidosPendientes}</Text>
                <Text style={styles.labelMetrica}>Pendientes</Text>
              </View>

              <View style={[styles.tarjetaMetrica, { backgroundColor: '#8B4513' }]}>
                <Ionicons name="cube-outline" size={32} color="#fff" />
                <Text style={styles.valorMetrica}>{totalProductos}</Text>
                <Text style={styles.labelMetrica}>Productos</Text>
              </View>
            </View>

            {/* Gráfico de ventas por mes */}
            {ventasPorMes.length > 0 && (
              <View style={styles.seccionGrafico}>
                <Text style={styles.tituloGrafico}>📈 Ventas por Mes</Text>
                <LineChart
                  data={{
                    labels: ventasPorMes.map(v => v.mes),
                    datasets: [{
                      data: ventasPorMes.map(v => v.total)
                    }]
                  }}
                  width={screenWidth - 40}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.grafico}
                  yAxisPrefix="C$ "
                />
              </View>
            )}

            {/* Gráfico de productos más vendidos */}
            {productosMasVendidos.length > 0 && (
              <View style={styles.seccionGrafico}>
                <Text style={styles.tituloGrafico}>🏆 Top 5 Productos Más Vendidos</Text>
                
  <BarChart
  data={{
    labels: productosMasVendidos.map(p => {
      
      if (p.nombre.length > 6) {
        return p.nombre.substring(0, 6);
      }
      return p.nombre;
    }),
    datasets: [{
      data: productosMasVendidos.map(p => p.cantidad)
    }]
  }}
  width={screenWidth - 40}
  height={220}
  chartConfig={{
    ...chartConfig,
    barPercentage: 0.6,
  }}
  style={styles.grafico}
  yAxisLabel=""
  yAxisSuffix=" u"
  fromZero
  showValuesOnTopOfBars
/>
  

                
                {/* Lista detallada de productos */}
                <View style={styles.listaProductos}>
                  {productosMasVendidos.map((producto, index) => (
                    <View key={index} style={styles.itemProducto}>
                      <View style={styles.rankingBadge}>
                        <Text style={styles.rankingNumero}>#{index + 1}</Text>
                      </View>
                      <Text style={styles.nombreProductoLista}>{producto.nombre}</Text>
                      <Text style={styles.cantidadProducto}>{producto.cantidad} vendidos</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Gráfico de estados de pedidos */}
            {estadosPedidos.length > 0 && estadosPedidos.some(e => e.cantidad > 0) && (
              <View style={styles.seccionGrafico}>
                <Text style={styles.tituloGrafico}>📊 Estado de Pedidos</Text>
                <PieChart
                  data={estadosPedidos.filter(e => e.cantidad > 0)}
                  width={screenWidth - 40}
                  height={220}
                  chartConfig={chartConfig}
                  accessor="cantidad"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                  style={styles.grafico}
                />
              </View>
            )}

            {/* Accesos rápidos */}
            <View style={styles.seccionAccesos}>
              <Text style={styles.tituloSeccion}>Accesos Rápidos</Text>
              
              <TouchableOpacity 
                style={styles.botonAcceso}
                onPress={() => navigation.navigate('Productos')}
              >
                <Ionicons name="cube-outline" size={24} color="#8B4513" />
                <Text style={styles.textoAcceso}>Gestionar Productos</Text>
                <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.botonAcceso}
                onPress={() => navigation.navigate('PedidosAdmin')}
              >
                <Ionicons name="receipt-outline" size={24} color="#8B4513" />
                <Text style={styles.textoAcceso}>Ver Pedidos</Text>
                <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
              </TouchableOpacity>
            </View>

            {/* Última actualización */}
            <View style={styles.footerDashboard}>
              <Ionicons name="sync-outline" size={16} color="#999" />
              <Text style={styles.textoActualizacion}>
                Última actualización: {new Date().toLocaleTimeString('es-ES')}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tituloHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  scrollContainer: {
    flex: 1,
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
  metricas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    justifyContent: 'space-between',
  },
  tarjetaMetrica: {
    width: '48%',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  valorMetrica: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  labelMetrica: {
    fontSize: 12,
    color: '#fff',
    marginTop: 5,
    textAlign: 'center',
  },
  seccionGrafico: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tituloGrafico: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  grafico: {
    marginVertical: 8,
    borderRadius: 16,
  },
  listaProductos: {
    marginTop: 20,
  },
  itemProducto: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rankingBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#8B4513',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  rankingNumero: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  nombreProductoLista: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  cantidadProducto: {
    fontSize: 14,
    color: '#8B4513',
    fontWeight: 'bold',
  },
  seccionAccesos: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
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
  botonAcceso: {
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
  footerDashboard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  textoActualizacion: {
    fontSize: 12,
    color: '#999',
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