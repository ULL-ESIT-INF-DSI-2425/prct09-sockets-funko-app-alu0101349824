import { describe, expect, test } from "vitest";
import { TipoFunko, GeneroFunko, Funko } from "../../src/ejercicio-1/index";

describe("Módulo funko", () => {
  test("El enum TipoFunko tiene los valores correctos", () => {
    expect(TipoFunko.Pop).toBe("Pop!");
    expect(TipoFunko.PopRides).toBe("Pop! Rides");
    expect(TipoFunko.VynilSoda).toBe("Vynil Soda");
    expect(TipoFunko.VynilGold).toBe("Vynil Gold");
  });

  test("El enum GeneroFunko tiene los valores correctos", () => {
    expect(GeneroFunko.Animacion).toBe("Animación");
    expect(GeneroFunko.PeliculasTV).toBe("Películas y TV");
    expect(GeneroFunko.Videojuegos).toBe("Videojuegos");
    expect(GeneroFunko.Deportes).toBe("Deportes");
    expect(GeneroFunko.Musica).toBe("Música");
    expect(GeneroFunko.Anime).toBe("Ánime");
  });

  test("La interfaz Funko se puede usar para crear un objeto", () => {
    const funko: Funko = {
      id: 1,
      nombre: "Test Funko",
      descripcion: "Descripción de prueba",
      tipo: TipoFunko.Pop,
      genero: GeneroFunko.Animacion,
      franquicia: "Franquicia Test",
      numero: 42,
      exclusivo: false,
      caracteristicasEspeciales: "Ninguna",
      valorMercado: 10,
    };

    expect(funko.id).toBe(1);
    expect(funko.nombre).toBe("Test Funko");
    expect(funko.descripcion).toBe("Descripción de prueba");
    expect(funko.tipo).toBe("Pop!");
    expect(funko.genero).toBe("Animación");
    expect(funko.franquicia).toBe("Franquicia Test");
    expect(funko.numero).toBe(42);
    expect(funko.exclusivo).toBe(false);
    expect(funko.caracteristicasEspeciales).toBe("Ninguna");
    expect(funko.valorMercado).toBe(10);
  });
});
