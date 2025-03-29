/**
 * @module cliente
 * @remarks
 * Cliente TCP que se conecta al servidor para enviar una petición en formato JSON
 * y recibir la respuesta, siguiendo el patrón de petición-respuesta.
 * El cliente permite añadir, listar, actualizar, eliminar y leer Funkos.
 * Cada operación se ejecuta a través de un comando específico.
 * La comunicación con el servidor se realiza a través de un socket TCP.
 * El cliente maneja la conexión, el envío de datos y la recepción de respuestas.
 * Se utiliza un delimitador de salto de línea para separar los mensajes.
 * La respuesta del servidor se procesa y se muestra en la consola.
 * Se manejan errores de conexión y de parseo de JSON.
 * Utiliza yargs para procesar argumentos y chalk para formatear la salida.
 */

import { connect, Socket } from "net";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import chalk from "chalk";
import { TipoPeticion, TipoRespuesta } from "./servidor.js";

// Usamos la interfaz Funko y los demás tipos que ya están definidos en funko.ts (importados a través de index.ts)
import { Funko, TipoFunko, GeneroFunko } from "./funko.js";

/**
 * Envía la petición al servidor y procesa la respuesta.
 * Se usa "salto de línea" como delimitador de mensaje.
 */
function enviarPeticion(peticion: TipoPeticion): void {
  const socket: Socket = connect({ port: 60300 }, () => {
    // Enviamos la petición con "\n" para delimitar el mensaje
    socket.write(JSON.stringify(peticion) + "\n");
  });
  socket.setEncoding("utf8");

  let buffer = "";
  socket.on("data", (data) => {
    buffer += data;
    let index: number;
    while ((index = buffer.indexOf("\n")) !== -1) {
      const mensajeStr = buffer.substring(0, index);
      buffer = buffer.substring(index + 1);
      try {
        const respuesta: TipoRespuesta = JSON.parse(mensajeStr);
        if (respuesta.exito) {
          console.log(chalk.green(respuesta.mensaje));
          if (respuesta.funkos && respuesta.funkos.length > 0) {
            respuesta.funkos.forEach((funko: Funko) => {
              console.log(
                `ID: ${funko.id} | Nombre: ${funko.nombre} | Valor: ${funko.valorMercado}`,
              );
            });
          }
        } else {
          console.error(chalk.red(respuesta.mensaje));
        }
      } catch (err) {
        console.error(chalk.red("Error parseando la respuesta:"), err);
      }
      socket.end();
    }
  });

  socket.on("error", (err) => {
    console.error(chalk.red("Error en la conexión:"), err);
  });
}

// Definición de comandos con yargs
yargs(hideBin(process.argv))
  .command(
    "add",
    "Añadir un Funko",
    {
      user: {
        type: "string",
        demandOption: true,
        describe: "Usuario propietario",
      },
      id: { type: "number", demandOption: true, describe: "ID del Funko" },
      nombre: { type: "string", demandOption: true, describe: "Nombre" },
      desc: { type: "string", demandOption: true, describe: "Descripción" },
      tipo: { type: "string", demandOption: true, describe: "Tipo del Funko" },
      genero: {
        type: "string",
        demandOption: true,
        describe: "Género del Funko",
      },
      franquicia: {
        type: "string",
        demandOption: true,
        describe: "Franquicia",
      },
      numero: {
        type: "number",
        demandOption: true,
        describe: "Número identificativo",
      },
      exclusivo: { type: "boolean", demandOption: true, describe: "Exclusivo" },
      carac: {
        type: "string",
        demandOption: true,
        describe: "Características especiales",
      },
      valor: {
        type: "number",
        demandOption: true,
        describe: "Valor de mercado",
      },
    },
    (argv) => {
      const funko: Funko = {
        id: argv.id,
        nombre: argv.nombre,
        descripcion: argv.desc,
        tipo: argv.tipo as TipoFunko,
        genero: argv.genero as GeneroFunko,
        franquicia: argv.franquicia,
        numero: argv.numero,
        exclusivo: argv.exclusivo,
        caracteristicasEspeciales: argv.carac,
        valorMercado: argv.valor,
      };

      const peticion: TipoPeticion = { tipo: "add", usuario: argv.user, funko };
      enviarPeticion(peticion);
    },
  )
  .command(
    "list",
    "Listar Funkos",
    {
      user: {
        type: "string",
        demandOption: true,
        describe: "Usuario propietario",
      },
    },
    (argv) => {
      const peticion: TipoPeticion = { tipo: "list", usuario: argv.user };
      enviarPeticion(peticion);
    },
  )
  .command(
    "update",
    "Actualizar un Funko",
    {
      user: {
        type: "string",
        demandOption: true,
        describe: "Usuario propietario de la colección",
      },
      id: {
        type: "number",
        demandOption: true,
        describe: "ID del Funko a actualizar",
      },
      nombre: {
        type: "string",
        demandOption: true,
        describe: "Nuevo nombre del Funko",
      },
      desc: {
        type: "string",
        demandOption: true,
        describe: "Nueva descripción del Funko",
      },
      tipo: {
        type: "string",
        demandOption: true,
        describe: "Nuevo tipo del Funko",
      },
      genero: {
        type: "string",
        demandOption: true,
        describe: "Nuevo género del Funko",
      },
      franquicia: {
        type: "string",
        demandOption: true,
        describe: "Nueva franquicia del Funko",
      },
      numero: {
        type: "number",
        demandOption: true,
        describe: "Nuevo número identificativo",
      },
      exclusivo: {
        type: "boolean",
        demandOption: true,
        describe: "Nuevo valor para exclusivo",
      },
      carac: {
        type: "string",
        demandOption: true,
        describe: "Nuevas características especiales",
      },
      valor: {
        type: "number",
        demandOption: true,
        describe: "Nuevo valor de mercado",
      },
    },
    (argv) => {
      const funko: Funko = {
        id: argv.id,
        nombre: argv.nombre,
        descripcion: argv.desc,
        tipo: argv.tipo as TipoFunko,
        genero: argv.genero as GeneroFunko,
        franquicia: argv.franquicia,
        numero: argv.numero,
        exclusivo: argv.exclusivo,
        caracteristicasEspeciales: argv.carac,
        valorMercado: argv.valor,
      };

      const peticion: TipoPeticion = {
        tipo: "update",
        usuario: argv.user,
        id: argv.id,
        funko: funko,
      };

      enviarPeticion(peticion);
    },
  )
  .command(
    "remove",
    "Eliminar un Funko",
    {
      user: {
        type: "string",
        demandOption: true,
        describe: "Usuario propietario de la colección",
      },
      id: {
        type: "number",
        demandOption: true,
        describe: "ID del Funko a eliminar",
      },
    },
    (argv) => {
      const peticion: TipoPeticion = {
        tipo: "remove",
        usuario: argv.user,
        id: argv.id,
      };
      enviarPeticion(peticion);
    },
  )
  .command(
    "read",
    "Leer un Funko",
    {
      user: {
        type: "string",
        demandOption: true,
        describe: "Usuario propietario de la colección",
      },
      id: {
        type: "number",
        demandOption: true,
        describe: "ID del Funko a leer",
      },
    },
    (argv) => {
      const peticion: TipoPeticion = {
        tipo: "read",
        usuario: argv.user,
        id: argv.id,
      };
      enviarPeticion(peticion);
    },
  )
  .help()
  .parse();
