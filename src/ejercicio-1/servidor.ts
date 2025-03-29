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
import { GestorFunko } from "./gestor-funko.js";
import { Funko } from "./funko.js";

/**
 * Tipo de petición enviada por el cliente.
 */
export type TipoPeticion = {
  tipo: "add" | "update" | "remove" | "list" | "read";
  usuario: string;
  funko?: Funko; // Usado en "add" y "update"
  id?: number; // Usado en "remove", "read" y "update"
};

/**
 * Tipo de respuesta enviada por el servidor.
 */
export type TipoRespuesta = {
  tipo: "add" | "update" | "remove" | "list" | "read";
  exito: boolean;
  mensaje: string;
  funkos?: Funko[]; // Se utiliza en "list" y "read"
};

const PORT = 60300;

const server = net.createServer((socket) => {
  console.log("Un cliente se ha conectado"); // Mensaje al conectar
  socket.setEncoding("utf8");
  let buffer = "";

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

      procesarPeticion(peticion, (respuesta) => {
        // Log de la respuesta que se envía al cliente
        console.log(
          "Enviando respuesta al cliente:",
          JSON.stringify(respuesta, null, 2),
        );
        socket.write(JSON.stringify(respuesta) + "\n");
      });
    }
  });

  socket.on("end", () => {
    console.log("Un cliente se ha desconectado");
  });

  socket.on("close", () => {
    console.log("Conexión cerrada");
  });

  socket.on("error", (err) => {
    console.error("Error en la conexión:", err);
  });
});

server.listen(PORT, () => {
  console.log(`Servidor Funko escuchando en el puerto ${PORT}`);
});

/**
 * Procesa la petición delegando en GestorFunko y llama al callback con la respuesta.
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

    default:
      callback({
        tipo,
        exito: false,
        mensaje: "Operación no soportada.",
      });
      break;
  }
}
