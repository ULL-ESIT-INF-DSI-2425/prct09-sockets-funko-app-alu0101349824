/**
 * @module gestor-funko
 * @remarks
 * Módulo para gestionar la lectura y escritura de Funkos en el sistema de ficheros,
 * usando la API asíncrona basada en callbacks de Node.js.
 */

import * as fs from "fs";
import * as path from "path";
import { Funko } from "./funko.js";

/**
 * Clase para gestionar el almacenamiento de Funkos de un usuario en ficheros JSON.
 * Cada usuario tiene un directorio con su nombre donde se guardan los distintos JSON.
 * Cada Funko se guarda en un fichero con el nombre <ID>.json.
 * El ID es único para cada Funko y se usa como nombre del fichero.
 * El contenido del fichero es el objeto Funko serializado como JSON.
 * El directorio de cada usuario se crea automáticamente si no existe.
 * Si el directorio no se puede crear, se devuelve undefined.
 * Si el directorio ya existe, se usa el existente.
 * Si el fichero no se puede crear, se devuelve false.
 * Si el fichero ya existe, se sobrescribe.
 * Si el Funko no se puede guardar, se devuelve false.
 * Si el Funko se guarda correctamente, se devuelve true.
 * Si el Funko no existe, se devuelve false.
 * Si el Funko se elimina correctamente, se devuelve true.
 * Si el Funko no se puede eliminar, se devuelve false.
 */
export class GestorFunko {
  /**
   * Crea (si no existe) el directorio correspondiente a un usuario,
   * retornando su ruta en caso de éxito o `undefined` si falla algo.
   * @param usuario - Nombre del usuario
   * @param callback - Devuelve la ruta del directorio o `undefined` si hubo error
   * @returns void
   */
  public static obtenerDirectorioUsuario(
    usuario: string,
    callback: (rutaUsuario?: string) => void,
  ): void {
    // Ruta del directorio del usuario
    const ruta = path.join(process.cwd(), "datos", usuario);

    // Se comprueba si el directorio existe
    fs.access(ruta, fs.constants.F_OK, (errAcceso) => {
      if (errAcceso) {
        // El directorio no existe => se crea
        fs.mkdir(ruta, { recursive: true }, (errMkdir) => {
          if (errMkdir) {
            // Error creando el directorio => devolvemos undefined
            callback(undefined);
          } else {
            // Directorio creado con éxito
            callback(ruta);
          }
        });
      } else {
        // Directorio ya existe
        callback(ruta);
      }
    });
  }

  /**
   * Carga todos los Funkos de un usuario leyendo todos los ficheros .json de su directorio.
   * @param usuario - Usuario propietario de los Funkos
   * @param callback - Callback que recibe la lista de Funkos o `undefined` si error
   * @returns void
   */
  public static cargarFunkosUsuario(
    usuario: string,
    callback: (lista?: Funko[]) => void,
  ): void {
    console.log("Cargando Funkos para usuario:", usuario);
    // Obtenemos (o creamos) el directorio del usuario
    this.obtenerDirectorioUsuario(usuario, (rutaUsuario) => {
      if (!rutaUsuario) {
        // No se pudo crear/obtener el directorio => error
        callback(undefined);
        return;
      }
      // Leemos los ficheros del directorio del usuario
      fs.readdir(rutaUsuario, (errReaddir, archivos) => {
        if (errReaddir) {
          // Error leyendo los ficheros => error en la operación
          callback(undefined);
          return;
        }
        const listaFunkos: Funko[] = [];
        let contador = 0;

        // Si no hay ficheros, retornamos lista vacía
        if (archivos.length === 0) {
          callback(listaFunkos);
          return;
        }

        // Procesamos cada fichero del directorio
        for (let i = 0; i < archivos.length; i++) {
          const archivo = archivos[i];
          const rutaArchivo = path.join(rutaUsuario, archivo);

          // Comprobamos que sea .json
          if (path.extname(rutaArchivo) === ".json") {
            fs.readFile(rutaArchivo, "utf8", (errRead, contenido) => {
              contador++;
              if (!errRead) {
                // Ignoramos los errores de parseo JSON
                try {
                  const funko: Funko = JSON.parse(contenido) as Funko;
                  // Se añade a la lista sin usar push
                  listaFunkos[listaFunkos.length] = funko;
                } catch {
                  // Error de parseo => ignoramos el fichero
                }
              }
              // Cuando hayamos procesado todos los ficheros, devolvemos la lista
              if (contador === archivos.length) {
                callback(listaFunkos);
              }
            });
          } else {
            // No es un .json, se ignora
            contador++;
            if (contador === archivos.length) {
              callback(listaFunkos);
            }
          }
        }
      });
    });
  }

  /**
   * Guarda un Funko en el directorio del usuario. El fichero se guarda con el ID del Funko como nombre.
   * @param usuario - Usuario
   * @param funko - Funko a guardar
   * @param callback - Devuelve true si se guardó, false si hubo error
   * @returns void
   */
  public static guardarFunko(
    usuario: string,
    funko: Funko,
    callback: (ok: boolean) => void,
  ): void {
    // Obtenemos (o creamos) el directorio del usuario
    this.obtenerDirectorioUsuario(usuario, (rutaUsuario) => {
      if (!rutaUsuario) {
        // Error al obtener/crear el directorio => false
        callback(false);
        return;
      }
      // Nombre de fichero = <ID>.json
      const rutaFichero = path.join(rutaUsuario, `${funko.id}.json`);
      const contenido = JSON.stringify(funko, undefined, 2);

      // Guardamos el contenido en el fichero
      fs.writeFile(rutaFichero, contenido, (error) => {
        if (error) {
          callback(false);
        } else {
          callback(true);
        }
      });
    });
  }

  /**
   * Elimina el fichero JSON de un Funko. Si no existe, se devuelve false.
   * @param usuario - Usuario
   * @param idFunko - ID del Funko a eliminar
   * @param callback - Devuelve true si se eliminó, false si no existe o hay error
   * @returns void
   */
  public static eliminarFunko(
    usuario: string,
    idFunko: number,
    callback: (ok: boolean) => void,
  ): void {
    // Obtenemos (o creamos) el directorio del usuario
    this.obtenerDirectorioUsuario(usuario, (rutaUsuario) => {
      if (!rutaUsuario) {
        callback(false);
        return;
      }
      const rutaFichero = path.join(rutaUsuario, `${idFunko}.json`);

      // Comprobamos si el fichero existe
      fs.unlink(rutaFichero, (errUnlink) => {
        if (errUnlink) {
          // No existe o error => false
          callback(false);
        } else {
          callback(true);
        }
      });
    });
  }
}
