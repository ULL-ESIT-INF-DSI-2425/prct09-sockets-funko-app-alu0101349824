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

// Importamos los tipos de petición y respuesta del servidor
import { TipoPeticion, TipoRespuesta } from "./servidor.js";
// Usamos la interfaz Funko y los demás tipos ya definidos en funko.ts
import { Funko, TipoFunko, GeneroFunko } from "./funko.js";
// Importamos la función crearFunko para construir el objeto validado
import { crearFunko } from "./crear-funko.js";

/**
 * Envía la petición al servidor y procesa la respuesta.
 * Se usa "salto de línea" como delimitador de mensaje.
 * @param peticion - La petición a enviar al servidor.
 * @returns void
 * @throws Error si hay un problema de conexión o al parsear la respuesta.
 * @example
 * ```ts
 * const peticion: TipoPeticion = \{ tipo: "add", usuario: "usuario1", funko: funko \};
 * enviarPeticion(peticion);
 * ```
 */
function enviarPeticion(peticion: TipoPeticion): void {
  // Conectamos al servidor en el puerto 60300
  const socket: Socket = connect({ port: 60300 }, () => {
    // Enviamos la petición con "\n" para delimitar el mensaje
    socket.write(JSON.stringify(peticion) + "\n");
  });

  /**
   * Configuramos la codificación del socket a UTF-8 para que los datos se envíen y
   * reciban como cadenas de texto. Esto es importante para evitar problemas de codificación
   * y asegurarnos de que los datos se interpreten correctamente al ser enviados y
   * recibidos a través del socket. Esto es especialmente útil cuando se trabaja con
   * datos en formato JSON que son cadenas de texto y pueden contener caracteres
   * especiales que deben ser manejados correctamente al ser enviados y recibidos
   * a través de la red. La codificación UTF-8 es un estándar ampliamente utilizado
   * para la representación de caracteres en la web y en muchas aplicaciones por
   * lo que es una buena práctica utilizarla al trabajar con sockets y datos en formato
   * de texto.
   */
  socket.setEncoding("utf8");

  // Escuchamos los eventos de datos y error para manejar la respuesta del servidor
  let buffer = "";
  socket.on("data", (data) => {
    buffer += data;
    let index: number;
    // Procesamos el buffer hasta encontrar el delimitador de salto de línea
    while ((index = buffer.indexOf("\n")) !== -1) {
      const mensajeStr = buffer.substring(0, index);
      buffer = buffer.substring(index + 1);
      // Intentamos parsear el mensaje recibido como JSON y lo mostramos
      try {
        const respuesta: TipoRespuesta = JSON.parse(mensajeStr);
        if (respuesta.exito) {
          console.log(chalk.green(respuesta.mensaje));
          // Si la respuesta contiene funkos, los mostramos
          if (respuesta.funkos && respuesta.funkos.length > 0) {
            respuesta.funkos.forEach((funko: Funko) => {
              console.log(
                `ID: ${funko.id} | Nombre: ${funko.nombre} | Valor: ${funko.valorMercado}`,
              );
            });
          }
          // Si la respuesta no es exitosa, mostramos el mensaje de error
        } else {
          console.error(chalk.red(respuesta.mensaje));
        }
      } catch (err) {
        console.error(chalk.red("Error parseando la respuesta:"), err);
      }
      // Cerramos el socket después de procesar la respuesta
      socket.end();
    }
  });

  // Manejo de errores de conexión
  socket.on("error", (err) => {
    console.error(chalk.red("Error en la conexión:"), err);
  });
}

// Definición de comandos con yargs para gestionar las operaciones
yargs(hideBin(process.argv))
  // Añadir un Funko
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
      const funko = crearFunko(
        argv.id,
        argv.nombre,
        argv.desc,
        argv.tipo as TipoFunko,
        argv.genero as GeneroFunko,
        argv.franquicia,
        argv.numero,
        argv.exclusivo,
        argv.carac,
        argv.valor,
      );

      const peticion: TipoPeticion = { tipo: "add", usuario: argv.user, funko };
      enviarPeticion(peticion);
    },
  )
  // Listar Funkos
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
  // Actualizar un Funko
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
      const funko = crearFunko(
        argv.id,
        argv.nombre,
        argv.desc,
        argv.tipo as TipoFunko,
        argv.genero as GeneroFunko,
        argv.franquicia,
        argv.numero,
        argv.exclusivo,
        argv.carac,
        argv.valor,
      );

      const peticion: TipoPeticion = {
        tipo: "update",
        usuario: argv.user,
        id: argv.id,
        funko: funko,
      };

      enviarPeticion(peticion);
    },
  )
  // Eliminar un Funko
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
  // Leer un Funko
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
  // Mostrar ayuda por defecto
  .help()
  // Mostrar versión por defecto
  .parse();
