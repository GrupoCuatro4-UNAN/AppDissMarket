import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
//  Ajustes realizados para soportar 'modo invitado'
//  ORIGINAL: App usaba onAuthStateChanged(local) para decidir si mostrar Login o PrincipalTabs.
//  MODIFICACIÓN: extracción de esa lógica al contexto `ContextoAuth` y creación
//  `modoInvitado === true`. Esto permite que la acción "Entrar como invitado" active
//  la navegación a las pestañas principales sin requerir sesión en Firebase.

// Importación de las vistaas
import PantallaSplash from './screens/PantallaSplash';
import PantallaLogin from './screens/PantallaLogin';
import PantallaRegistro from './screens/PantallaRegistro';
import PantallaCatalogo from './screens/PantallaCatalogo';
import PantallaFavoritos from './screens/PantallaFavoritos';
import PantallaCarrito from './screens/PantallaCarrito';
import PantallaPedidos from './screens/PantallaPedidos';
import PantallaPerfil from './screens/PantallaPerfil';
import PantallaEditarPerfil from './screens/PantallaEditarPerfil';
import PantallaConfiguracion from './screens/PantallaConfiguracion';
import PantallaSobreEmpresa from './screens/PantallaSobreEmpresa';
import PantallaAdministracion from './screens/PantallaAdministracion';
import PantallaAdministracionPedidos from './screens/PantallaAdministracionPedidos';
// Contextos
import { ProveedorAuth, useAuth } from './contexts/ContextoAuth';
import { ProveedorCarrito } from './contexts/ContextoCarrito';
import { ProveedorFavoritos } from './contexts/ContextoFavoritos';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Navegación de pestañas principales
function NavegadorPrincipal() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let nombreIcono;

          switch (route.name) {
            case 'Catálogo':
              nombreIcono = focused ? 'home' : 'home-outline';
              break;
            case 'Favoritos':
              nombreIcono = focused ? 'heart' : 'heart-outline';
              break;
            case 'Carrito':
              nombreIcono = focused ? 'cart' : 'cart-outline';
              break;
            case 'Pedidos':
              nombreIcono = focused ? 'list' : 'list-outline';
              break;
            case 'Perfil':
              nombreIcono = focused ? 'person' : 'person-outline';
              break;
          }

          return <Ionicons name={nombreIcono} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#8B4513', 
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#f8f8f8',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Catálogo" 
        component={PantallaCatalogo}
        options={{ tabBarLabel: 'Catálogo' }}
      />
      <Tab.Screen 
        name="Favoritos" 
        component={PantallaFavoritos}
        options={{ tabBarLabel: 'Favoritos' }}
      />
      <Tab.Screen 
        name="Carrito" 
        component={PantallaCarrito}
        options={{ tabBarLabel: 'Carrito' }}
      />
      <Tab.Screen 
        name="Pedidos" 
        component={PantallaPedidos}
        options={{ tabBarLabel: 'Pedidos' }}
      />
      <Tab.Screen 
        name="Perfil" 
        component={PantallaPerfil}
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}

// NUEVO: Navegación principal para administradores (solo 3 pestañas)
function NavegadorAdministrador() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let nombreIcono;

          switch (route.name) {
            case 'Productos':
              nombreIcono = focused ? 'cube' : 'cube-outline';
              break;
            case 'PedidosAdmin':
              nombreIcono = focused ? 'receipt' : 'receipt-outline';
              break;
            case 'Perfil':
              nombreIcono = focused ? 'person' : 'person-outline';
              break;
          }

          return <Ionicons name={nombreIcono} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#8B4513', 
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#f8f8f8',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Productos" 
        component={PantallaAdministracion}
        options={{ tabBarLabel: 'Productos' }}
      />
      <Tab.Screen 
        name="PedidosAdmin" 
        component={PantallaAdministracionPedidos}
        options={{ tabBarLabel: 'Pedidos' }}
      />
      <Tab.Screen 
        name="Perfil" 
        component={PantallaPerfil}
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}
// FIN DE CAMBIO

function Router() {
  const { usuarioActual, modoInvitado, cargando, datosUsuario } = useAuth();

  // Mostrar siempre splash mientras se determina el estado
  if (cargando || (usuarioActual && !modoInvitado && !datosUsuario)) {
    return <PantallaSplash />;
  }

  const esAdmin = datosUsuario?.esAdmin || false;
  const usuarioAutenticado = usuarioActual || modoInvitado;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {usuarioAutenticado ? (
          // Rutas para usuarios autenticados/invitados
          <Stack.Group>
            <Stack.Screen 
              name="PrincipalTabs" 
              component={modoInvitado ? NavegadorPrincipal : (esAdmin ? NavegadorAdministrador : NavegadorPrincipal)} 
            />
            <Stack.Screen name="EditarPerfil" component={PantallaEditarPerfil} />
            <Stack.Screen name="Configuracion" component={PantallaConfiguracion} />
            <Stack.Screen name="SobreEmpresa" component={PantallaSobreEmpresa} />
          </Stack.Group>
        ) : (
          // Rutas para usuarios no autenticados
          <Stack.Group>
            <Stack.Screen name="Login" component={PantallaLogin} />
            <Stack.Screen name="Registro" component={PantallaRegistro} />
            <Stack.Screen name="SobreEmpresa" component={PantallaSobreEmpresa} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ProveedorAuth>
      <ProveedorCarrito>
        <ProveedorFavoritos>
          <Router />
        </ProveedorFavoritos>
      </ProveedorCarrito>
    </ProveedorAuth>
  );
}
