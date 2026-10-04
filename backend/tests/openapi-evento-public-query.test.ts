import { describe, expect, it } from 'vitest';

import { openApiDocument } from '../src/docs/openapi.js';

interface OpenApiParameterForTest {
  name?: string;
  in?: string;
  description?: string;
  schema?: {
    $ref?: string;
    type?: string;
    minimum?: number;
    maximum?: number;
    default?: number;
  };
}

interface LocalDateTimeSchemaForTest {
  type?: string;
  pattern?: string;
  description?: string;
  example?: string;
}

interface OpenApiDocumentForTest {
  paths?: {
    '/eventos'?: {
      get?: {
        parameters?: OpenApiParameterForTest[];
      };
    };
  };
  components?: {
    schemas?: {
      LocalDateTime?: LocalDateTimeSchemaForTest;
    };
  };
}

describe('T044-C - contrato OpenAPI del filtro temporal público', () => {
  const document = openApiDocument as unknown as OpenApiDocumentForTest;

  it('documenta fechaDesde y fechaHasta como parámetros query de GET /eventos', () => {
    const parameters = document.paths?.['/eventos']?.get?.parameters;

    expect(parameters).toBeDefined();

    const fechaDesde = parameters?.find((parameter) => parameter.name === 'fechaDesde');

    const fechaHasta = parameters?.find((parameter) => parameter.name === 'fechaHasta');

    expect(fechaDesde).toMatchObject({
      name: 'fechaDesde',
      in: 'query',
      schema: {
        $ref: '#/components/schemas/LocalDateTime',
      },
    });

    expect(fechaHasta).toMatchObject({
      name: 'fechaHasta',
      in: 'query',
      schema: {
        $ref: '#/components/schemas/LocalDateTime',
      },
    });
  });

  it('mantiene LocalDateTime como fecha local sin offset de America/Guayaquil', () => {
    const localDateTime = document.components?.schemas?.LocalDateTime;

    expect(localDateTime).toBeDefined();

    expect(localDateTime).toMatchObject({
      type: 'string',
      example: '2026-08-22T19:30:00.000',
    });

    expect(localDateTime?.description).toContain('America/Guayaquil');

    expect(localDateTime?.pattern).toBe(
      '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}(?::\\d{2}(?:\\.\\d{1,3})?)?$',
    );
  });
});
