import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type {
  CreateEventoRequest,
  Evento,
} from '../../types/api';
import {
  createZamoraFestApi,
} from './zamorafest-api';

const createdEvent:
  Evento = {
    id: 501,
    titulo:
      'Festival Amazónico',
    descripcion:
      'Encuentro cultural.',
    fechaInicio:
      '2026-09-25T18:00:00.000',
    fechaFin:
      '2026-09-25T22:00:00.000',
    costoReferencial:
      5.5,
    estadoEvento:
      'BORRADOR',
    estadoRevision:
      'PENDIENTE',
    fuenteInformacion:
      'GAD Municipal',
    fechaCreacion:
      '2026-09-19T20:00:00.000',
    fechaActualizacion:
      null,
    fechaRevision:
      null,
    lugar: {
      id: 73,
      nombre:
        'Casa Cultural Zamora',
      tipoLugar:
        'CENTRO_CULTURAL',
      direccionReferencial:
        'Centro de Zamora',
      referencia:
        null,
      latitud:
        -4.066,
      longitud:
        -78.956,
      sector: {
        id: 31,
        nombre:
          'Centro',
        tipoSector:
          'BARRIO',
        parroquia: {
          id: 22,
          nombre:
            'Zamora',
          codigoDpa:
            '190150',
          canton: {
            id: 12,
            nombre:
              'Zamora',
            codigoDpa:
              '1901',
            provincia: {
              id: 1,
              nombre:
                'Zamora Chinchipe',
              codigoDpa:
                '19',
            },
          },
        },
      },
    },
    usuarioCreador: {
      id: 10,
      nombreCompleto:
        'Asistente Demo',
      rol: {
        id: 2,
        nombre:
          'ASISTENTE',
      },
    },
    usuarioRevisor:
      null,
    categorias: [
      {
        id: 41,
        nombre:
          'Cultura comunitaria',
        descripcion:
          'Actividades culturales.',
      },
    ],
  };

function jsonResponse(
  payload: unknown,
  status = 200,
): Response {
  return new Response(
    JSON.stringify(
      payload,
    ),
    {
      status,
      headers: {
        'Content-Type':
          'application/json',
      },
    },
  );
}

function createFetchMock(
  responseFactory:
    () => Response,
) {
  const mock =
    vi.fn(
      async (
        input:
          RequestInfo | URL,
        init?:
          RequestInit,
      ) => {
        void input;
        void init;

        return responseFactory();
      },
    );

  return {
    fetcher:
      mock as unknown as typeof fetch,
    mock,
  };
}

describe(
  'Contrato de creación de Evento',
  () => {
    it(
      'envía POST con Bearer token y únicamente los campos permitidos',
      async () => {
        const {
          fetcher,
          mock,
        } =
          createFetchMock(
            () =>
              jsonResponse(
                {
                  data:
                    createdEvent,
                },
                201,
              ),
          );

        const api =
          createZamoraFestApi({
            baseUrl:
              'http://127.0.0.1:3000',
            fetcher,
          });

        const input:
          CreateEventoRequest = {
          titulo:
            'Festival Amazónico',
          descripcion:
            'Encuentro cultural.',
          fechaInicio:
            '2026-09-25T18:00',
          fechaFin:
            '2026-09-25T22:00',
          costoReferencial:
            5.5,
          lugarId:
            73,
          categoriaIds: [
            41,
          ],
          fuenteInformacion:
            'GAD Municipal',
        };

        const result =
          await api.createEvento(
            input,
            'access-asistente',
          );

        expect(
          result,
        ).toEqual(
          createdEvent,
        );

        expect(
          mock,
        ).toHaveBeenCalledTimes(
          1,
        );

        const firstCall =
          mock.mock.calls.at(
            0,
          );

        expect(
          firstCall,
        ).toBeDefined();

        if (
          !firstCall
        ) {
          throw new Error(
            'No se registró la solicitud de creación.',
          );
        }

        const [
          requestUrl,
          requestInit,
        ] =
          firstCall;

        expect(
          requestUrl.toString(),
        ).toBe(
          'http://127.0.0.1:3000/api/v1/eventos',
        );

        expect(
          requestInit,
        ).toEqual({
          method:
            'POST',
          headers: {
            Accept:
              'application/json',
            'Content-Type':
              'application/json',
            Authorization:
              'Bearer access-asistente',
          },
          body:
            JSON.stringify(
              input,
            ),
        });
      },
    );

    it(
      'no envía propiedades controladas por el servidor aunque existan en el objeto recibido',
      async () => {
        const {
          fetcher,
          mock,
        } =
          createFetchMock(
            () =>
              jsonResponse(
                {
                  data:
                    createdEvent,
                },
                201,
              ),
          );

        const api =
          createZamoraFestApi({
            baseUrl:
              'http://127.0.0.1:3000',
            fetcher,
          });

        const unsafeInput = {
          titulo:
            'Festival Amazónico',
          descripcion:
            null,
          fechaInicio:
            '2026-09-25T18:00',
          fechaFin:
            '2026-09-25T22:00',
          costoReferencial:
            0,
          lugarId:
            73,
          categoriaIds: [
            41,
          ],
          fuenteInformacion:
            null,

          estadoEvento:
            'PROGRAMADO',
          estadoRevision:
            'APROBADO',
          usuarioCreador:
            999,
        };

        await api.createEvento(
          unsafeInput,
          'access-asistente',
        );

        const firstCall =
          mock.mock.calls.at(
            0,
          );

        expect(
          firstCall,
        ).toBeDefined();

        if (
          !firstCall
        ) {
          throw new Error(
            'No se registró la solicitud de creación.',
          );
        }

        const body =
          JSON.parse(
            String(
              firstCall[1]
                ?.body,
            ),
          ) as Record<
            string,
            unknown
          >;

        expect(
          body,
        ).toEqual({
          titulo:
            'Festival Amazónico',
          descripcion:
            null,
          fechaInicio:
            '2026-09-25T18:00',
          fechaFin:
            '2026-09-25T22:00',
          costoReferencial:
            0,
          lugarId:
            73,
          categoriaIds: [
            41,
          ],
          fuenteInformacion:
            null,
        });

        expect(
          body,
        ).not.toHaveProperty(
          'estadoEvento',
        );

        expect(
          body,
        ).not.toHaveProperty(
          'estadoRevision',
        );

        expect(
          body,
        ).not.toHaveProperty(
          'usuarioCreador',
        );
      },
    );
  },
);
