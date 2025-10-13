import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LogoDissmar from "../components/LogoDissmar";

export default function PantallaSobreEmpresa({ navigation }) {
  // Función para abrir enlaces externos
  const abrirEnlace = async (url, tipo) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", `No se puede abrir ${tipo}`);
      }
    } catch (error) {
      Alert.alert("Error", `No se pudo abrir ${tipo}`);
    }
  };

  // Función para llamar por teléfono
  const llamarTelefono = (telefono) => {
    abrirEnlace(`tel:${telefono}`, "el teléfono");
  };

  // Función para enviar email
  const enviarEmail = (email) => {
    abrirEnlace(`mailto:${email}`, "el email");
  };

  // Función para abrir ubicación en mapas
  const abrirMapa = () => {
    const direccion = "El ayote, Nicaragua"; 
    const url = "https://maps.apple.com/p/wt-xZHS_FSaac.z";
    abrirEnlace(url, "el mapa");
  };

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
          <Text style={styles.textoTitulo}>Sobre la empresa</Text>
        </View>

        <View style={styles.espacioVacio} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo y presentación */}
        <View style={styles.logoSection}>
          <LogoDissmar size="large" />
          <Text style={styles.eslogan}>Tu Distribuidora de Confianza</Text>
          <Text style={styles.version}>Versión 1.0.0</Text>
        </View>

        {/* Información de la empresa */}
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Nuestra Historia</Text>
          <Text style={styles.textoParrafo}>
            DISSMAR es una distribuidora comprometida con brindar productos de
            calidad a nuestros clientes. Con años de experiencia en el mercado
            nicaragüense, nos hemos consolidado como una empresa confiable y
            eficiente.
          </Text>
          <Text style={styles.textoParrafo}>
            Nuestra misión es facilitar el acceso a productos esenciales
            mediante un servicio de calidad, puntualidad y precios competitivos.
          </Text>
        </View>

        {/* Información de contacto */}
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Información de Contacto</Text>

          <TouchableOpacity style={styles.contactoItem} onPress={abrirMapa}>
            <Ionicons name="location-outline" size={24} color="#8B4513" />
            <View style={styles.contactoTexto}>
              <Text style={styles.contactoTitulo}>Dirección</Text>
              <Text style={styles.contactoDescripcion}>
                El Ayote, Nicaragua{"\n"}
              </Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactoItem}
            onPress={() => llamarTelefono("+50582310640")}
          >
            <Ionicons name="call-outline" size={24} color="#8B4513" />
            <View style={styles.contactoTexto}>
              <Text style={styles.contactoTitulo}>Teléfono</Text>
              <Text style={styles.contactoDescripcion}>+505 8231-0640</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactoItem}
            onPress={() => enviarEmail("info@dissmar.com")}
          >
            <Ionicons name="mail-outline" size={24} color="#8B4513" />
            <View style={styles.contactoTexto}>
              <Text style={styles.contactoTitulo}>Email</Text>
              <Text style={styles.contactoDescripcion}>info@dissmar.com</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
          </TouchableOpacity>

          <View style={styles.contactoItem}>
            <Ionicons name="time-outline" size={24} color="#8B4513" />
            <View style={styles.contactoTexto}>
              <Text style={styles.contactoTitulo}>Horarios</Text>
              <Text style={styles.contactoDescripcion}>
                Lunes a Domingos: 8:00 AM - 6:00 PM{"\n"}
              </Text>
            </View>
          </View>
        </View>

        {/* Nuestra misión */}
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Nuestra Misión</Text>
          <View style={styles.misionItem}>
            <Ionicons name="target-outline" size={24} color="#8B4513" />
            <Text style={styles.misionTexto}>
              Proporcionar productos de calidad con un servicio excepcional,
              construyendo relaciones duraderas con nuestros clientes.
            </Text>
          </View>
        </View>

        {/* Nuestra visión */}
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Nuestra Visión</Text>
          <View style={styles.misionItem}>
            <Ionicons name="eye-outline" size={24} color="#8B4513" />
            <Text style={styles.misionTexto}>
              Ser la distribuidora líder en Nicaragua, reconocida por nuestra
              innovación, calidad de servicio y compromiso con la comunidad.
            </Text>
          </View>
        </View>

        {/* Valores */}
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Nuestros Valores</Text>

          <View style={styles.valorItem}>
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color="#8B4513"
            />
            <Text style={styles.valorTexto}>Confianza y transparencia</Text>
          </View>

          <View style={styles.valorItem}>
            <Ionicons name="ribbon-outline" size={20} color="#8B4513" />
            <Text style={styles.valorTexto}>Calidad en nuestros productos</Text>
          </View>

          <View style={styles.valorItem}>
            <Ionicons name="people-outline" size={20} color="#8B4513" />
            <Text style={styles.valorTexto}>
              Servicio al cliente excepcional
            </Text>
          </View>

          <View style={styles.valorItem}>
            <Ionicons name="leaf-outline" size={20} color="#8B4513" />
            <Text style={styles.valorTexto}>Responsabilidad social</Text>
          </View>
        </View>

        {/* Estadísticas */}
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Nuestros Números</Text>
          <View style={styles.estadisticasContainer}>
            <View style={styles.estadisticaItem}>
              <Text style={styles.estadisticaNumero}>5+</Text>
              <Text style={styles.estadisticaTexto}>
                Años de{"\n"}experiencia
              </Text>
            </View>
            <View style={styles.estadisticaItem}>
              <Text style={styles.estadisticaNumero}>500+</Text>
              <Text style={styles.estadisticaTexto}>
                Productos{"\n"}disponibles
              </Text>
            </View>
          </View>
          <View style={styles.estadisticasContainer}>
            <View style={styles.estadisticaItem}>
              <Text style={styles.estadisticaNumero}>1000+</Text>
              <Text style={styles.estadisticaTexto}>
                Clientes{"\n"}satisfechos
              </Text>
            </View>
            <View style={styles.estadisticaItem}>
              <Text style={styles.estadisticaNumero}>24/7</Text>
              <Text style={styles.estadisticaTexto}>
                Soporte{"\n"}disponible
              </Text>
            </View>
          </View>
        </View>

        {/* Redes sociales */}
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Síguenos</Text>
          <View style={styles.redesContainer}>
            <TouchableOpacity
              style={styles.redSocial}
              onPress={() =>
                abrirEnlace("https://facebook.com/dissmar", "Facebook")
              }
            >
              <Ionicons name="logo-facebook" size={24} color="#3b5998" />
              <Text style={styles.redTexto}>Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.redSocial}
              onPress={() =>
                abrirEnlace("https://instagram.com/dissmar", "Instagram")
              }
            >
              <Ionicons name="logo-instagram" size={24} color="#e4405f" />
              <Text style={styles.redTexto}>Instagram</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.redSocial}
              onPress={() =>
                abrirEnlace("https://wa.me/50582310640", "WhatsApp")
              }
            >
              <Ionicons name="logo-whatsapp" size={24} color="#25d366" />
              <Text style={styles.redTexto}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTexto}>
            2025 DISSMAR - Distribuidora{"\n"}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 15,
    shadowColor: "#000",
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
    alignItems: "center",
  },
  textoTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  espacioVacio: {
    width: 34,
  },
  scrollContainer: {
    flex: 1,
  },
  logoSection: {
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 40,
    marginBottom: 20,
  },
  eslogan: {
    fontSize: 18,
    color: "#666",
    fontStyle: "italic",
    marginTop: 15,
    textAlign: "center",
  },
  version: {
    fontSize: 14,
    color: "#999",
    marginTop: 10,
  },
  seccion: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  tituloSeccion: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  textoParrafo: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    marginBottom: 15,
    textAlign: "justify",
  },
  contactoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  contactoTexto: {
    flex: 1,
    marginLeft: 15,
  },
  contactoTitulo: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  contactoDescripcion: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  misionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  misionTexto: {
    flex: 1,
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    marginLeft: 15,
    textAlign: "justify",
  },
  valorItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  valorTexto: {
    fontSize: 16,
    color: "#666",
    marginLeft: 12,
  },
 estadisticasContainer: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  marginBottom: 20,
},
estadisticaItem: {
  alignItems: 'center',
  flex: 1,
  paddingHorizontal: 10,
},
estadisticaNumero: {
  fontSize: 28,
  fontWeight: 'bold',
  color: '#8B4513',
  marginBottom: 8,
},
estadisticaTexto: {
  fontSize: 13,
  color: '#666',
  textAlign: 'center',
  lineHeight: 18,
},
  redesContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  redSocial: {
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#f8f8f8",
    minWidth: 80,
  },
  redTexto: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  footer: {
    alignItems: "center",
    padding: 20,
    marginBottom: 20,
  },
  footerTexto: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
});
