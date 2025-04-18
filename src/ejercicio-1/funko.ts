/**
 * @module funko
 * @remarks Interfaz para representar un Funko, que es un objeto que se puede coleccionar.
 */

/**
 * Enumerado con tipos de Funko permitidos.
 * @remarks
 * Los tipos de Funko permitidos son:
 *  - Pop!
 *  - Pop! Rides
 *  - Vynil Soda
 *  - Vynil Gold
 */
export enum TipoFunko {
  Pop = "Pop!",
  PopRides = "Pop! Rides",
  VynilSoda = "Vynil Soda",
  VynilGold = "Vynil Gold",
}

/**
 * Enumerado con géneros de Funko permitidos.
 * @remarks
 * Los géneros de Funko permitidos son:
 *  - Animación
 *  - Películas y TV
 *  - Videojuegos
 *  - Deportes
 *  - Música
 *  - Ánime
 */
export enum GeneroFunko {
  Animacion = "Animación",
  PeliculasTV = "Películas y TV",
  Videojuegos = "Videojuegos",
  Deportes = "Deportes",
  Musica = "Música",
  Anime = "Ánime",
}

/**
 * Interfaz para representar un Funko.
 * @remarks
 * Un Funko es un objeto que se puede coleccionar.
 * Cada Funko tiene:
 *  - Un identificador único (id).
 *  - Un nombre.
 *  - Una descripción.
 *  - Un tipo (Pop!, Pop! Rides, etc.).
 *  - Un género (Animación, Películas y TV, etc.).
 *  - Una franquicia (The Big Bang Theory, Game of Thrones, Sonic The Hedgehog o Marvel: Guardians of the Galaxy, etc.).
 *  - Un número identificativo dentro de su franquicia.
 *  - Un valor que indica si es exclusivo.
 *  - Características especiales (brilla en la oscuridad, su cabeza balancea, etc.).
 *  - Un valor de mercado (debe ser positivo).
 */
export interface Funko {
  /**
   * Identificador único del Funko.
   */
  id: number;

  /**
   * Nombre del Funko.
   */
  nombre: string;

  /**
   * Descripción del Funko.
   */
  descripcion: string;

  /**
   * Tipo del Funko (Pop!, Pop! Rides, etc.).
   * Es de tipo `TipoFunko`.
   */
  tipo: TipoFunko;

  /**
   * Género del Funko (Animación, Películas y TV, etc.).
   * Es de tipo `GeneroFunko`.
   */
  genero: GeneroFunko;

  /**
   * Franquicia a la que pertenece el Funko (The Big Bang Theory, Game of Thrones, Sonic The Hedgehog o Marvel: Guardians of the Galaxy, etc.).
   */
  franquicia: string;

  /**
   * Número identificativo del Funko dentro de su franquicia.
   */
  numero: number;

  /**
   * Indica si el Funko es exclusivo.
   */
  exclusivo: boolean;

  /**
   * Características especiales (brilla en la oscuridad, su cabeza balancea, etc.).
   */
  caracteristicasEspeciales: string;

  /**
   * Valor de mercado del Funko (debe ser positivo).
   */
  valorMercado: number;
}
