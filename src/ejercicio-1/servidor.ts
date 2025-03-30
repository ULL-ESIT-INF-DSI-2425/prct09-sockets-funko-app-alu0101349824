/**
 * @module servidor
 * @remarks
 * Servidor TCP que escucha en un puerto específico y procesa peticiones de clientes.
 * Cada cliente puede enviar peticiones para añadir, actualizar, eliminar o listar Funkos.
 * Utiliza la API de Node.js para manejar conexiones y eventos.
 * Las peticiones y respuestas se envían en formato JSON.
 * El servidor utiliza un gestor de Funkos para manejar la lógica de negocio.
 * Cada usuario tiene su propio directorio donde se almacenan los Funkos en formato JSON.
 * El servidor responde a las peticiones con un mensaje de éxito o error.
 */

import * as net from "net";

// Importamos el gestor de Funkos para manejar la lógica de negocio y la gestión de archivos.
import { GestorFunko } from "./gestor-funko.js";
// Usamos la interfaz Funko y los demás tipos ya definidos en funko.ts.
import { Funko } from "./funko.js";

/**
 * Tipo de petición enviada por el cliente.
 * @remarks
 * - `tipo`: Tipo de operación a realizar (add, update, remove, list, read).
 * - `usuario`: Nombre del usuario que realiza la petición.
 * - `funko`: Objeto Funko a añadir o actualizar (opcional).
 * - `id`: ID del Funko a eliminar o leer (opcional).
 * @example
 * ```ts
 * const peticion: TipoPeticion = {
 *   tipo: "add",
 *   usuario: "usuario1",
 *   funko: {
 *     id: 1,
 *     nombre: "Goku",
 *     descripcion: "Goku de Dragon Ball Z",
 *     tipo: "Pop!",
 *     genero: "Ánime",
 *     franquicia: "Dragon Ball Z",
 *     numero: 123,
 *     exclusivo: true,
 *     caracteristicasEspeciales: "Brilla en la oscuridad",
 *     valorMercado: 10.99
 *   },
 *   id: undefined // No se usa en "add"
 * };
 * ```
 */
export type TipoPeticion = {
  tipo: "add" | "update" | "remove" | "list" | "read";
  usuario: string;
  funko?: Funko; // Usado en "add" y "update"
  id?: number; // Usado en "remove", "read" y "update"
};

/**
 * Tipo de respuesta enviada por el servidor.
 * @remarks
 * - `tipo`: Tipo de operación realizada (add, update, remove, list, read).
 * - `exito`: Indica si la operación fue exitosa o no.
 * - `mensaje`: Mensaje descriptivo de la operación.
 * - `funkos`: Lista de Funkos devuelta (opcional, solo en "list" y "read").
 * @example
 * ```ts
 * const respuesta: TipoRespuesta = {
 *   tipo: "add",
 *   exito: true,
 *   mensaje: "Funko añadido correctamente.",
 *   funkos: undefined // No se usa en "add"
 * };
 * ```
 */
export type TipoRespuesta = {
  tipo: "add" | "update" | "remove" | "list" | "read";
  exito: boolean;
  mensaje: string;
  funkos?: Funko[]; // Se utiliza en "list" y "read"
};

// Puerto donde el servidor escuchará las conexiones
const PORT = 60300;

// Crear un servidor TCP que escucha en el puerto especificado y maneja conexiones
const server = net.createServer((socket) => {
  console.log("Un cliente se ha conectado"); // Mensaje al conectar
  socket.setEncoding("utf8"); // Establecer la codificación de los datos a UTF-8
  let buffer = "";

  /**
   * Manejador de eventos para recibir datos del cliente.
   * @param data - Datos recibidos del cliente.
   * @throws Error si hay un problema al parsear el JSON.
   * @remarks
   * - Se acumulan los datos en un buffer hasta encontrar un delimitador de salto de línea.
   * - Se procesan los mensajes completos y se envían respuestas al cliente.
   * - Se loguean los mensajes recibidos y las respuestas enviadas.
   * - Se procesan las peticiones delegando en la función `procesarPeticion`.
   * - Se envían respuestas al cliente con el resultado de la operación.
   * - Se manejan eventos de desconexión y cierre de conexión.
   * - Se loguean los errores y mensajes de éxito.
   * - Se maneja el error de parseo de JSON y se envía una respuesta de error al cliente.
   * - Se manejan errores de conexión.
   */
  socket.on("data", (data: string) => {
    buffer += data;
    let index: number;

    // Procesar cada mensaje completo (delimitado por "\n")
    while ((index = buffer.indexOf("\n")) !== -1) {
      const mensajeStr = buffer.substring(0, index);
      buffer = buffer.substring(index + 1);

      // Log de lo que recibe el servidor (el JSON sin parsear)
      console.log("Mensaje recibido del cliente (raw):", mensajeStr);

      let peticion: TipoPeticion;
      try {
        peticion = JSON.parse(mensajeStr);
        // Log de la petición parseada
        console.log("Petición parseada (objeto):", peticion);
      } catch {
        const respuestaError: TipoRespuesta = {
          tipo: "list", // Valor por defecto
          exito: false,
          mensaje: "Error al parsear JSON de la petición.",
        };
        // Log de respuesta de error
        console.error(
          "Error: petición JSON inválida, respondiendo con error...",
        );
        socket.write(JSON.stringify(respuestaError) + "\n");
        continue;
      }

      /**
       * Procesar la petición delegando en GestorFunko y llamar al callback con la respuesta.
       * @param peticion - La petición a procesar.
       * @param respuesta - Callback que recibe la respuesta.
       * @remarks
       * - Se loguea el tipo de operación y el usuario.
       * - Se procesan las operaciones de añadir, actualizar, eliminar y listar Funkos.
       * - Se envían respuestas al cliente con el resultado de la operación.
       * - Se loguean los mensajes de éxito y error.
       * - Se manejan errores de lectura y escritura de Funkos.
       * - Se manejan errores de conexión y de parseo de JSON.
       */
      procesarPeticion(peticion, (respuesta) => {
        // Log de la respuesta que se envía al cliente
        console.log(
          "Enviando respuesta al cliente:",
          JSON.stringify(respuesta, null, 2),
        );
        // Enviar respuesta al cliente con el resultado de la operación
        socket.write(JSON.stringify(respuesta) + "\n");
      });
    }
  });

  // Manejar el evento de cierre de conexión
  socket.on("end", () => {
    console.log("Un cliente se ha desconectado");
  });

  // Manejar el evento de desconexión
  socket.on("close", () => {
    console.log("Conexión cerrada");
  });

  // Manejar el evento de error de conexión
  socket.on("error", (err) => {
    console.error("Error en la conexión:", err);
  });
});

// Iniciar el servidor y escuchar en el puerto especificado
server.listen(PORT, () => {
  console.log(`Servidor Funko escuchando en el puerto ${PORT}`);
});

/**
 * Procesa la petición delegando en GestorFunko y llama al callback con la respuesta.
 * @param peticion - La petición a procesar.
 * @param callback - Callback que recibe la respuesta.
 * @remarks
 * - Se loguea el tipo de operación y el usuario.
 * - Se procesan las operaciones de añadir, actualizar, eliminar y listar Funkos.
 * - Se envían respuestas al cliente con el resultado de la operación.
 * - Se loguean los mensajes de éxito y error.
 * - Se manejan errores de lectura y escritura de Funkos.
 * - Se manejan errores de conexión y de parseo de JSON.
 */
function procesarPeticion(
  peticion: TipoPeticion,
  callback: (resp: TipoRespuesta) => void,
): void {
  const { tipo, usuario, funko, id } = peticion;
  // Se añade un pequeño log con el tipo de operación
  console.log(
    `\n== Procesando petición '${tipo}' para usuario '${usuario}' ==\n`,
  );

  switch (tipo) {
    // Añadir un Funko
    case "add":
      if (!funko) {
        callback({
          tipo,
          exito: false,
          mensaje: "No se recibió Funko para añadir.",
        });
        return;
      }
      GestorFunko.cargarFunkosUsuario(usuario, (lista) => {
        if (lista === undefined) {
          callback({
            tipo,
            exito: false,
            mensaje: "Error leyendo Funkos del usuario.",
          });
          return;
        }
        // Comprobamos si el Funko ya existe. Se uso some() para evitar un bucle for y hacer la comprobación más rápida.
        if (lista.some((f) => f.id === funko.id)) {
          callback({
            tipo,
            exito: false,
            mensaje: `El Funko con ID ${funko.id} ya existe para ${usuario}.`,
          });
          return;
        }
        GestorFunko.guardarFunko(usuario, funko, (ok) => {
          callback({
            tipo,
            exito: ok,
            mensaje: ok
              ? `Funko ID ${funko.id} añadido a ${usuario}.`
              : "No se pudo guardar el Funko.",
          });
        });
      });
      break;

    // Actualizar un Funko
    case "update":
      if (!funko || id === undefined) {
        callback({
          tipo,
          exito: false,
          mensaje: "Datos incompletos para actualizar Funko.",
        });
        return;
      }
      GestorFunko.cargarFunkosUsuario(usuario, (lista) => {
        if (lista === undefined) {
          callback({
            tipo,
            exito: false,
            mensaje: "Error leyendo Funkos del usuario.",
          });
          return;
        }
        // Comprobamos si el Funko existe. Se uso some() para evitar un bucle for y hacer la comprobación más rápida.
        if (!lista.some((f) => f.id === id)) {
          callback({
            tipo,
            exito: false,
            mensaje: `No existe Funko con ID ${id} en ${usuario}.`,
          });
          return;
        }
        GestorFunko.guardarFunko(usuario, funko, (ok) => {
          callback({
            tipo,
            exito: ok,
            mensaje: ok
              ? `Funko ID ${id} actualizado en ${usuario}.`
              : "No se pudo actualizar el Funko.",
          });
        });
      });
      break;

    // Eliminar un Funko
    case "remove":
      if (id === undefined) {
        callback({
          tipo,
          exito: false,
          mensaje: "No se especificó ID para eliminar.",
        });
        return;
      }
      GestorFunko.eliminarFunko(usuario, id, (ok) => {
        callback({
          tipo,
          exito: ok,
          mensaje: ok
            ? `Funko ID ${id} eliminado de ${usuario}.`
            : `No se pudo eliminar (o no existe) Funko con ID ${id}.`,
        });
      });
      break;

    // Listar Funkos de un usuario
    case "list":
      GestorFunko.cargarFunkosUsuario(usuario, (lista) => {
        if (lista === undefined) {
          callback({
            tipo,
            exito: false,
            mensaje: "Error leyendo Funkos del usuario.",
          });
        } else {
          callback({
            tipo,
            exito: true,
            mensaje: `Funkos listados de ${usuario}.`,
            funkos: lista,
          });
        }
      });
      break;

    // Leer un Funko específico
    case "read":
      if (id === undefined) {
        callback({
          tipo,
          exito: false,
          mensaje: "No se especificó ID para leer.",
        });
        return;
      }
      GestorFunko.cargarFunkosUsuario(usuario, (lista) => {
        if (lista === undefined) {
          callback({
            tipo,
            exito: false,
            mensaje: "Error leyendo Funkos del usuario.",
          });
          return;
        }
        const funkoEncontrado = lista.find((f) => f.id === id);
        if (!funkoEncontrado) {
          callback({
            tipo,
            exito: false,
            mensaje: `No se encontró Funko con ID ${id} en ${usuario}.`,
          });
        } else {
          callback({
            tipo,
            exito: true,
            mensaje: `Funko ID ${id} encontrado en ${usuario}.`,
            funkos: [funkoEncontrado],
          });
        }
      });
      break;

    // Operación no soportada
    default:
      callback({
        tipo,
        exito: false,
        mensaje: "Operación no soportada.",
      });
      break;
  }
}
