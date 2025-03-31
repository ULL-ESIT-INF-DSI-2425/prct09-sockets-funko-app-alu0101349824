/**
 * @module servidor-chat
 * @remarks
 * Servidor de chat que permite a múltiples clientes comunicarse mediante sockets TCP.
 * Cada cliente recibe un identificador único asignado por el servidor.
 * Los mensajes se transmiten en formato JSON y el servidor reenvía los mensajes a todos los clientes conectados, excepto al remitente.
 * El servidor maneja la conexión, recepción y cierre de los sockets, así como la gestión de errores.
 */

import { createServer, Socket } from "net";

/**
 * Interfaz que representa un cliente conectado.
 *  - id: Identificador único del cliente.
 *  - socket: Socket asociado al cliente.
 */
interface Cliente {
  id: number;
  socket: Socket;
}

/**
 * Interfaz para el mensaje de chat en formato JSON.
 *  - remitente: Identificador del cliente que envía el mensaje.
 *  - mensaje: Contenido del mensaje enviado por el cliente.
 */
interface MensajeChat {
  remitente: number;
  mensaje: string;
}

// Lista de clientes conectados.
const clientes: Cliente[] = [];
// Variable global para llevar la cuenta de los clientes conectados.
let contadorClientes: number = 1;

// Crear el servidor TCP.
const servidor = createServer((socket: Socket) => {
  // Asignar un identificador único al cliente.
  const idCliente: number = contadorClientes;
  contadorClientes++;
  clientes[clientes.length] = { id: idCliente, socket: socket };

  console.log(`Cliente ${idCliente} conectado.`);

  let buffer: string = "";
  // Manejar la codificación de los datos.
  socket.setEncoding("utf8");

  // Manejar datos recibidos.
  socket.on("data", (datos: string) => {
    buffer += datos;
    let indice: number;
    // Mientras haya datos en el buffer, procesar los mensajes.
    while ((indice = buffer.indexOf("\n")) !== -1) {
      const mensajeStr: string = buffer.substring(0, indice);
      buffer = buffer.substring(indice + 1);
      try {
        // Convertir el mensaje a un objeto JSON.
        const objetoMensaje = JSON.parse(mensajeStr);
        // Verificar que se haya recibido la propiedad "mensaje".
        if (typeof objetoMensaje.mensaje === "string") {
          const mensaje: MensajeChat = {
            remitente: idCliente,
            mensaje: objetoMensaje.mensaje,
          };
          console.log(`Mensaje recibido de ${idCliente}: ${mensaje.mensaje}`);
          // Reenviar el mensaje a todos los demás clientes.
          clientes.forEach(function (cliente: Cliente) {
            if (cliente.id !== idCliente) {
              // Se utiliza `JSON.stringify` para convertir el objeto a JSON.
              cliente.socket.write(JSON.stringify(mensaje) + "\n");
            }
          });
        }
        // Manejar errores de JSON: Si el mensaje no es un JSON válido, se ignora.
      } catch (error) {
        console.error(
          `Error parseando mensaje del cliente ${idCliente}.`,
          error,
        );
      }
    }
  });

  // Manejar cierre de conexión.
  socket.on("close", () => {
    console.log(`Cliente ${idCliente} desconectado.`);
    // Eliminar el cliente de la lista.
    for (let i = 0; i < clientes.length; i++) {
      // Si el cliente coincide con el idCliente, eliminarlo de la lista.
      if (clientes[i].id === idCliente) {
        for (let j = i; j < clientes.length - 1; j++) {
          clientes[j] = clientes[j + 1];
        }
        clientes.length = clientes.length - 1;
        break;
      }
    }
  });

  // Manejar errores del socket.
  socket.on("error", (err: Error) => {
    console.error(
      `Error en el socket del cliente ${idCliente}: ${err.message}`,
    );
  });
});

// Iniciar el servidor en el puerto 60300.
const PUERTO: number = 60300;
servidor.listen(PUERTO, () => {
  console.log(`Servidor de chat escuchando en el puerto ${PUERTO}.`);
});
