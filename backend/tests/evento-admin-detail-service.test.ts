import { afterEach, describe, expect, it, vi } from 'vitest';

import type { IdentidadAcceso } from '../src/modules/auth/auth.service.js';
import { eventoRepository } from '../src/modules/eventos/evento.repository.js';
import { eventoService } from '../src/modules/eventos/evento.service.js';

const administrador: IdentidadAcceso = {
  id: 1,
  rol: 'ADMINISTRADOR',
};

const asistente: IdentidadAcceso = {
  id: 7,
  rol: 'ASISTENTE',
};

function buildEvento() {
  return {
    id: 100,
    titulo: 'Festival Cultural',
    descripcion: 'Evento pendiente de revisión.',
    fechaInicio: new Date('2026-10-05T14:30:00.000Z'),
    fechaFin: new Date('2026-10-05T23:00:00.000Z'),
    costoReferencial: {
      toString: () => '0',
    },
    estadoEvento: 'BORRADOR',
    estadoRevision: 'PENDIENTE',
    fuenteInformacion: 'Dirección de Cultura',
    fechaCreacion: new Date('2026-09-28T20:00:00.000Z'),
    fechaActualizacion: new Date('2026-09-28T20:10:00.000Z'),
    fechaRevision: null,
    lugar: {
      id: 10,
      nombre: 'Parque Central',
      tipoLugar: 'PARQUE',
      direccionReferencial: 'Zamora',
      referencia: null,
      latitud: null,
      longitud: null,
      sector: {
        id: 5,
        nombre: 'Cabecera parroquial',
        tipoSector: 'CABECERA_PARROQUIAL',
        parroquia: {
          id: 4,
          codigoDpa: '190150',
          nombre: 'Zamora',
          canton: {
            id: 3,
            codigoDpa: '1901',
            nombre: 'Zamora',
            provincia: {
              id: 1,
              codigoDpa: '19',
              nombre: 'Zamora Chinchipe',
            },
          },
        },
      },
    },
    usuarioCreador: {
      id: 7,
      nombreCompleto: 'Asistente de prueba',
      rol: {
        id: 2,
        nombre: 'ASISTENTE',
      },
    },
    usuarioRevisor: null,
    categorias: [
      {
        categoria: {
          id: 20,
          nombre: 'Cultura',
          descripcion: null,
        },
      },
    ],
  } as never;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Detalle administrativo de eventos', () => {
  it('permite al ADMINISTRADOR consultar un evento no público', async () => {
    const findSpy = vi.spyOn(eventoRepository, 'findById').mockResolvedValue(buildEvento());

    const result = await eventoService.getAdminById(administrador, 100);

    expect(findSpy).toHaveBeenCalledWith(100, 'basic');
    expect(result).toMatchObject({
      id: 100,
      estadoEvento: 'BORRADOR',
      estadoRevision: 'PENDIENTE',
    });
  });

  it('rechaza el detalle administrativo para un rol distinto de ADMINISTRADOR', async () => {
    const findSpy = vi.spyOn(eventoRepository, 'findById');

    await expect(eventoService.getAdminById(asistente, 100)).rejects.toMatchObject({
      statusCode: 403,
      code: 'FORBIDDEN',
    });

    expect(findSpy).not.toHaveBeenCalled();
  });

  it('devuelve 404 cuando el evento no existe o está eliminado', async () => {
    vi.spyOn(eventoRepository, 'findById').mockResolvedValue(null);

    await expect(eventoService.getAdminById(administrador, 999)).rejects.toMatchObject({
      statusCode: 404,
      code: 'EVENTO_NOT_FOUND',
    });
  });
});
