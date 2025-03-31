/**
 * @module cliente-chat
 * @remarks
 * Cliente de chat que se conecta a un servidor TCP para enviar y recibir mensajes en formato JSON.
 * Permite escribir mensajes desde la consola y muestra los mensajes recibidos con formato.
 */

import { Socket, connect } from "net";
import * as readline from "readline";
import chalk from "chalk";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

/**
 * Interfaz para el mensaje de chat en formato JSON.
 *  - remitente: Identificador del cliente que envía el mensaje.
 *  - mensaje: Contenido del mensaje enviado por el cliente.
 */
interface MensajeChat {
  remitente: number;
  mensaje: string;
}

// Definir argumentos de línea de comandos con yargs.
const argumentos = yargs(hideBin(process.argv))
  // host: Dirección del servidor.
  .option("host", {
    alias: "h",
    type: "string",
    default: "localhost",
    description: "Dirección del servidor",
  })
  // puerto: Puerto del servidor.
  .option("puerto", {
    alias: "p",
    type: "number",
    default: 60300,
    description: "Puerto del servidor",
  })
  // Mostrar ayuda: $npm run cliente -- --help
  .help()
  .usage("Uso: npm run cliente --host <host> --puerto <puerto>")
  .parseSync(); // Parsear los argumentos de línea de comandos.

// Conectar al servidor de chat.
const conexion: Socket = connect(
  { host: argumentos.host, port: argumentos.puerto },
  () => {
    console.log(chalk.green("Conectado al servidor de chat."));
  },
);

// Manejar la codificación de los datos.
conexion.setEncoding("utf8");

let buffer: string = "";
// Manejar datos recibidos.
conexion.on("data", (datos: string) => {
  // Acumular los datos en el buffer.
  buffer += datos;
  let indice: number;
  // Mientras haya datos en el buffer, procesar los mensajes.
  while ((indice = buffer.indexOf("\n")) !== -1) {
    const mensajeStr: string = buffer.substring(0, indice);
    buffer = buffer.substring(indice + 1);
    try {
      // Convertir el mensaje a un objeto JSON.
      const mensaje: MensajeChat = JSON.parse(mensajeStr);
      console.log(
        chalk.blue(`Mensaje de ${mensaje.remitente}: ${mensaje.mensaje}`),
      );
      // Si ocurre un error al parsear el mensaje, mostrar un mensaje de error.
    } catch (error) {
      console.error(chalk.red("Error parseando mensaje recibido."), error);
    }
  }
});

// Manejar los errores de conexión.
conexion.on("error", (err: Error) => {
  console.error(chalk.red(`Error en la conexión: ${err.message}`));
});

// Configurar la entrada de datos desde la consola.
const lector = readline.createInterface({
  input: process.stdin, // Entrada estándar (teclado).
  output: process.stdout, // Salida estándar (pantalla).
  prompt: chalk.yellow("Tu mensaje> "), // Mensaje de prompt.
});

// Mostrar el prompt al iniciar.
lector.prompt();

lector.on("line", (linea: string) => {
  // Enviar el mensaje en formato JSON.
  const objetoMensaje = { mensaje: linea };
  // Se utiliza `JSON.stringify` para convertir el objeto a JSON.
  conexion.write(JSON.stringify(objetoMensaje) + "\n"); // Enviar el mensaje al servidor.
  lector.prompt(); // Mostrar el prompt nuevamente.
});

// Manejar el cierre de la entrada de datos.
lector.on("close", () => {
  console.log(chalk.green("Desconectado del chat."));
  conexion.end();
});
