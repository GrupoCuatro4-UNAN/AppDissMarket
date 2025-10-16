importar Reaccionar, { Estado de uso } desde 'reaccionar';
importar {Ver,Texto,Lista plana,Opacidad táctil,Hoja de estilo,Vista de área segura,Imagen,Alerta,Indicador de actividad} desde 'react-native';
importar { Ionicons } desde '@expo/iconos vectoriales';
importar { useCarrito } desde '../contextos/ContextoCarrito';
importar { useAuth } desde '../contextos/ContextoAuth';
importar LogotipoDissmar desde '../componentes/LogoDissmar';

exportar predeterminado función PantallaCarrito() {
  const { 
    artículosCarrito, 
    removedorDelCarrito, 
    actualizarCantidad, 
    calcularTotal, 
    realizarPedido,
    cargandoCarrito 
  } = useCarrito();
  
  const { datosUsuario } = useAuth();
  const [realizandoPedido, setRealizandoPedido] = Estado de uso(falso);

  // Función para manejar el pedido
 const manejarRealizarPedido = async () => {
  consola.registro('¡BOTÓN PRESIONADO!');
  consola.registro('Datos del usuario:', datosUsuario);
  consola.registro('Artículos en carro:', artículosCarrito);
  
  si (artículosCarrito.longitud === 0) {
    Alerta.alerta('Carrito vacío', 'Agrega productos al carro para realizar un pedido');
    retorno;
  }

  // Mostrar opciones de dirección
  Alerta.alerta(
    'Dirección de entrega',
    '¿Dónde deseas recibir tu pedido?',
    [
      {
        texto: 'Cancelar',
        estilo: 'cancelar',
      },
      {
        texto: 'Mi dirección registrada',
        en prensa: () => {
          const direcciónRegistrada = datosUsuario?.direccion || 'Dirección no específica';
          confirmarPedidoConDirección(direcciónRegistrada);
        }
      },
      {
        texto: 'Otra dirección',
        en prensa: () => solicitarDirecciónPersonalizada()
      }
    ]
  );
};

// Nueva función para solicitar dirección personalizada
const solicititarDirecciónPersonalizada = () => {
  Alerta.prompt(
    'Nueva dirección de entrega',
    'Ingresa la dirección donde deseas recibir tu pedido:',
    [
      {
        texto: 'Cancelar',
        estilo: 'cancelar'
      },
      {
        texto: 'Confirmar pedido',
        en prensa: (direccion) => {
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
const confirmarPedidoConDirección = (direcciónEnvio) => {
  Alerta.alerta(
    'Confirmar pedido',
    `¿Deseas realizar el pedido por C$ ${calcularTotal().toFixed(2)}?\n\nDirección de entorno: ${direcciónEnvio}`,
    [
      {
        texto: 'Cancelar',
        estilo: 'cancelar',
      },
      {
        texto: 'Confirmante',
        en prensa: async () => {
          consola.registro('Usuario confirmó el pedido - iniciando proceso...');
          setRealizandoPedido(verdadero);
          
          intentar {
            const resultado = await realizarPedido(direcciónEnvio);
            consola.registro('Resultado del pedido:', resultado);
            
            si (resultado.éxito) {
              consola.registro('¡Pedido realizado exitosamente!');
              Alerta.alerta(
                '¡Pedido realizado!',
                `Tu pedido ha sido procesado correctamente.\nTotal: C$ ${calcularTotal().toFixed(2)}\nDirección: ${direcciónEnvio}`,
                [{ texto: 'Está bien' }]
              );
            }
          } atrapar (error) {
            consola.error('Error al procesar pedido:', error);
            Alerta.alerta('Error', 'Hubo un problema al procesar tu pedido');
          }
          
          setRealizandoPedido(falso);
        },
      },
    ]
  );
};

  // Función para escuchar cantidad
  const aumentarCantidad = async (articulo) => {
    await actualizarCantidad(articulo.id, articulo.cantidad + 1);
  };

  // Función para desalentar la cantidad
  const disminuirCantidad = async (articulo) => {
    si (articulo.cantidad > 1) {
      await actualizarCantidad(articulo.id, articulo.cantidad - 1);
    } else {
      Alerta.alerta(
        'Preliminar del producto',
        `¿Deseas eliminar "${articulo.nombre}" del carro?`,
        [
          {
            texto: 'Cancelar',
            estilo: 'cancelar',
          },
          {
            texto: 'Eliminar',
            estilo: 'destructivo',
            en prensa: () => removedorDelCarrito(articulo.id),
          },
        ]
      );
    }
  };

  // Función para confirmar eliminación de producto
  const confirmarEliminar = (articulo) => {
    Alerta.alerta(
      'Preliminar del producto',
      `¿Seguro que deseas eliminar "${articulo.nombre}" del carro?`,
      [
        { texto: 'Cancelar', estilo: 'cancelar' },
        { texto: 'Eliminar', estilo: 'destructivo', en prensa: () => removedorDelCarrito(articulo.id) },
      ]
    );
  };

  // Componente para renderizar cada producto del carro
  const ArtículoCarrito = ({ articulo }) => (
    <Ver estilo={estilos. .articuloCarrito}>
      {/* Imagen del producto */}
      <Ver estilo={estilos. . . .ContenedorImagen}>
        {articulo.URL de imagen ? (
          <Imagen fuente={{ uri: articulo.URL de imagen }} estilo={estilos.imagenProducto} />
        ) : (
          <Ver estilo={estilos.imagenPlaceholder}>
            <Ionicons nombre="esquema de imagen" tamaño={30} color="#ccc" />
          </Ver>
        )}
      </Ver>

      {/* Información del producto */}
      <Ver estilo={estilos. . .infoProducto}>
        <Texto estilo={estilos. . .nombreProducto}>{articulo. . .nombre}</Texto>
        <Texto estilo={estilos. . . .precioProducto}>C$ {articulo.precio.toFixed(2)}</Texto>
        
        {/* Controles de cantidad */}
        <Ver estilo={estilos. .contenedor de controles}>
          <Ver estilo={estilos. . .controlesCantidad}>
            <Opacidad táctil 
              estilo={estilos. .botonCantidad}
              en prensa={() => disminuirCantidad(articulo)}
            >
              <Ionicons nombre="eliminar" tamaño={20} color="#8B4513" />
            </Opacidad táctil>
            
            <Texto estilo={estilos. . . .textoCantidad}>{articulo. . .cantidad}</Texto>
            
            <Opacidad táctil 
              estilo={estilos. .botonCantidad}
              en prensa={() => aumentarCantidad(articulo)}
            >
              <Ionicons nombre="añadir" tamaño={20} color="#8B4513" />
            </Opacidad táctil>
          </Ver>

          {/* Botón eliminar */}
          <Opacidad táctil 
            estilo={estilos. .botonEliminar}
            en prensa={() => confirmarEliminar(articulo)}
          >
            <Ionicons nombre="esquema basura" tamaño={20} color="#ff4757" />
          </Opacidad táctil>
        </Ver>
      </Ver>

      {/* Subtotal */}
      <Ver estilo={estilos. . .subtotalContainer}>
        <Texto estilo={estilos. . .subtotal}>C$ {(articulo.precio * articulo.cantidad).toFixed(2)}</Texto>
      </Ver>
    </Ver>
  );

  retorno (
    <Vista de Área segura estilo={estilos. . .contenedor}>
      {/* Encabezado */}
      <Ver estilo={estilos. . . .encabezado}>
        <Ver estilo={estilos. . .logotipoContenedor}>
        <LogotipoDissmar tamaño="pequeño" mostrar texto={falso} estilo={{ Margen Derecho: 10 }} />
          <Texto estilo={estilos. . . .logoNombre}>DISSMAR</Texto>
        </Ver>
        <Texto estilo={estilos. . . .eslogan}>Tu Distribuidora de Confianza</Texto>
      </Ver>

      {/* Típulo de la sección */}
      <Ver estilo={estilos. . .tituloContenedor}>
        <Texto estilo={estilos. . .titulo}>Mi Carrito</Texto>
        <Texto estilo={estilos. . . .subtípulo}>
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
            <Texto estilo={estilos. . .tipuloResumen}>Resumen del pedido</Texto>
            
            <Ver estilo={estilos. . . .filaResumen}>
              <Texto estilo={estilos. . .textoResumen}>
                Subtotal ({artículosCarrito. .longitud} productos)
              </Texto>
              <Texto estilo={estilos. . . .textoResumen}>C$ {calcularTotal().toFixed(2)}</Texto>
            </Ver>

            <Ver estilo={estilos. . . .filaResumen}>
              <Texto estilo={estilos. . .textoResumen}>Envioo</Texto>
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
    margenInferior: 6,
  },
  logoCirculo: {
    ancho: 40,
    alta: 40,
    radio fronterizo: 20,
    color de fondo: '#000',
    justificarContenido: 'centro',
    alinear elementos: 'centro',
    Margen Derecho: 10,
  },
  logoTexto: {
    tamaño de fuente: 20,
    fontWeight: 'audaz',
    color: '#fff',
  },
  logoNombre: {
    tamaño de fuente: 20,
    fontWeight: 'audaz',
    color: '#000',
    espaciado entre letras: 1,
  },
  eslogan: {
    tamaño de fuente: 14,
    color: '#666',
    estilo de fuente: 'cursiva',
    Margen Izquierdo: 15,
     margenInferior: 10,
  },
  ControlesContenedor: {
    dirección flexible: 'fila',
    justificarContenido: 'espacio intermedio',
    alinear elementos: 'centro',
    margenInferior: 10,
  controlesCantidad,
  dirección flexible: 'fila'
    alinear elementos: 'centro',
    color de fondo: '#f0f0f0',
    radio fronterizo: 20,
    RellenoHorizontal: 5,
  },
  botonCantidad: {
    ancho: 30,
    alta: 30,
  radio fronterizo: 
  color de fondo: '#fff'
    justificarContenido: 'centro',
    alinear elementos: 'centro',
    alinear elementos: 'centro',
    RellenoHorizontal: 40,
  },
  textoCarritoVacio: {
    tamaño de fuente: 24,
    fontWeight: '600',
    color: '#666',
    margen superior: 20,
    margenInferior: 10,
    alineación de texto: 'centro',
  },
  subtextoCarritoVacio: {
    tamaño de fuente: 16,
    color: '#999',
    alineación de texto: 'centro',
    alta de línea: 22,
  },
  contenidoCarrito: {
    flex: 1,
  },
  listaCarrito: {
    RellenoHorizontal: 20,
    relleno inferior: 20,
  },
  articuloCarrito: {
    color de fondo: '#fff',
    radio fronterizo: 15,
    margenInferior: 15,
    dirección flexible: 'fila',
    aclamado: 15,
    color sombra: '#000',
    desplazamiento de sombra: { ancho: 0, alta: 2 },
    sombraOpacidad: 0,1,
    sombraRadio: 3.84,
    elevación: 5,
  },
  ContenedorImagen: {
    ancho: 80,
    alta: 80,
    Margen Derecho: 15,
  },
  imagenProducto: {
    ancho: '100%',
    alta: '100%',
    radio fronterizo: 10,
    cambiar tamaño de modo: 'cubierta',
  },
  imagenPlaceholder: {
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
    margen: 18,
    margenInferior: 15,
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
    color de fondo: '#8B4513',
    radio fronterizo: 10,
    RellenoVertical: 15,
    alinear elementos: 'centro',
  },
  botonDeshabilitado: {
    color de fondo: '#ccc',
  },
  textoBotonRealizar: {
    color: '#fff',
    tamaño de fuente: 18,
    fontWeight: 'audaz',
  },
});
