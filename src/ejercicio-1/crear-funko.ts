/**
 * @module crear-funko
 * @remarks
 * Contiene lógica para la validación y creación de objetos Funko.
 * Se encarga de validar las características del Funko y crear el objeto Funko.
 */

// Usamos la interfaz Funko y los demás tipos ya definidos en funko.ts
import { Funko, TipoFunko, GeneroFunko } from "./funko.js";

/**
 * Crea un Funko validando las características del mismo.
 * Retorna `undefined` si no cumple las restricciones.
 * @param id - Identificador único
 * @param nombre - Nombre del Funko
 * @param descripcion - Descripción del Funko
 * @param tipo - Enumerado con el tipo de Funko
 * @param genero - Enumerado con el género del Funko
 * @param franquicia - Franquicia a la que pertenece
 * @param numero - Número identificativo dentro de la franquicia
 * @param exclusivo - Si es o no exclusivo
 * @param caracteristicasEspeciales - Características especiales
 * @param valorMercado - Valor de mercado (positivo)
 * @returns El Funko creado o `undefined` si no es válido
 */
export function crearFunko(
  id: number,
  nombre: string,
  descripcion: string,
  tipo: TipoFunko,
  genero: GeneroFunko,
  franquicia: string,
  numero: number,
  exclusivo: boolean,
  caracteristicasEspeciales: string,
  valorMercado: number,
): Funko | undefined {
  // Comprobación de valor de mercado
  if (valorMercado <= 0) {
    return undefined;
  }

  const nuevoFunko: Funko = {
    id: id,
    nombre: nombre,
    descripcion: descripcion,
    tipo: tipo,
    genero: genero,
    franquicia: franquicia,
    numero: numero,
    exclusivo: exclusivo,
    caracteristicasEspeciales: caracteristicasEspeciales,
    valorMercado: valorMercado,
  };

  return nuevoFunko;
}
