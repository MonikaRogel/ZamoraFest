import type {
  CreateEventoRequest,
} from '../../types/api';
import type {
  EventDraft,
} from '../../state/application-state';

const EVENT_TITLE_MAX =
  200;

const SOURCE_MAX =
  500;

const COST_MAX =
  99_999_999.99;

const POSTGRES_INT_MAX =
  2_147_483_647;

const localDateTimePattern =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/;

export interface EventCreateFieldErrors {
  readonly titulo?: string;
  readonly descripcion?: string;
  readonly fechaInicio?: string;
  readonly fechaFin?: string;
  readonly costoReferencial?: string;
  readonly lugarId?: string;
  readonly categoriaIds?: string;
  readonly fuenteInformacion?: string;
}

export type EventCreateValidationResult =
  | {
      readonly ok: true;
      readonly input:
        CreateEventoRequest;
    }
  | {
      readonly ok: false;
      readonly errors:
        EventCreateFieldErrors;
    };

function wallClockMillis(
  value: string,
): number | null {
  const match =
    localDateTimePattern.exec(
      value,
    );

  if (
    match ===
    null
  ) {
    return null;
  }

  const year =
    Number(
      match[1],
    );

  const month =
    Number(
      match[2],
    );

  const day =
    Number(
      match[3],
    );

  const hour =
    Number(
      match[4],
    );

  const minute =
    Number(
      match[5],
    );

  const second =
    Number(
      match[6] ??
        '0',
    );

  const millisecond =
    Number(
      (
        match[7] ??
        ''
      ).padEnd(
        3,
        '0',
      ) || '0',
    );

  const candidate =
    new Date(0);

  candidate.setUTCHours(
    0,
    0,
    0,
    0,
  );

  candidate.setUTCFullYear(
    year,
    month - 1,
    day,
  );

  candidate.setUTCHours(
    hour,
    minute,
    second,
    millisecond,
  );

  if (
    candidate.getUTCFullYear() !==
      year ||
    candidate.getUTCMonth() !==
      month - 1 ||
    candidate.getUTCDate() !==
      day ||
    candidate.getUTCHours() !==
      hour ||
    candidate.getUTCMinutes() !==
      minute ||
    candidate.getUTCSeconds() !==
      second ||
    candidate.getUTCMilliseconds() !==
      millisecond
  ) {
    return null;
  }

  return candidate
    .getTime();
}

function isValidEntityId(
  value:
    number | null,
): value is number {
  return (
    value !==
      null &&
    Number.isInteger(
      value,
    ) &&
    value > 0 &&
    value <=
      POSTGRES_INT_MAX
  );
}

function hasAtMostTwoDecimals(
  value: number,
): boolean {
  const cents =
    value * 100;

  return (
    Math.abs(
      Math.round(
        cents,
      ) -
        cents,
    ) <
    1e-8
  );
}

function validateCategories(
  values:
    readonly number[],
): string | undefined {
  if (
    values.length ===
    0
  ) {
    return 'Seleccione al menos una categoría.';
  }

  if (
    values.some(
      (id) =>
        !Number.isInteger(
          id,
        ) ||
        id <= 0 ||
        id >
          POSTGRES_INT_MAX,
    )
  ) {
    return 'Las categorías seleccionadas contienen un identificador inválido.';
  }

  if (
    new Set(
      values,
    ).size !==
    values.length
  ) {
    return 'Las categorías no pueden repetirse.';
  }

  return undefined;
}

export function validateEventCreateDraft(
  draft:
    EventDraft,
): EventCreateValidationResult {
  const title =
    draft.titulo
      .trim();

  const description =
    draft.descripcion
      .trim();

  const startDate =
    draft.fechaInicio
      .trim();

  const endDate =
    draft.fechaFin
      .trim();

  const costText =
    draft
      .costoReferencial
      .trim();

  const source =
    draft
      .fuenteInformacion
      .trim();

  const errors: {
    titulo?: string;
    descripcion?: string;
    fechaInicio?: string;
    fechaFin?: string;
    costoReferencial?: string;
    lugarId?: string;
    categoriaIds?: string;
    fuenteInformacion?: string;
  } = {};

  if (
    title.length ===
    0
  ) {
    errors.titulo =
      'Ingrese el título del evento.';
  } else if (
    title.length >
    EVENT_TITLE_MAX
  ) {
    errors.titulo =
      'El título no puede superar los 200 caracteres.';
  }

  if (
    draft.descripcion.length >
      0 &&
    description.length ===
      0
  ) {
    errors.descripcion =
      'La descripción no puede contener únicamente espacios.';
  }

  const startMillis =
    wallClockMillis(
      startDate,
    );

  if (
    startDate.length ===
    0
  ) {
    errors.fechaInicio =
      'Ingrese la fecha y hora de inicio.';
  } else if (
    startMillis ===
    null
  ) {
    errors.fechaInicio =
      'Ingrese una fecha y hora de inicio válida.';
  }

  const endMillis =
    wallClockMillis(
      endDate,
    );

  if (
    endDate.length ===
    0
  ) {
    errors.fechaFin =
      'Ingrese la fecha y hora de fin.';
  } else if (
    endMillis ===
    null
  ) {
    errors.fechaFin =
      'Ingrese una fecha y hora de fin válida.';
  } else if (
    startMillis !==
      null &&
    endMillis <=
      startMillis
  ) {
    errors.fechaFin =
      'La fecha de fin debe ser posterior a la fecha de inicio.';
  }

  let cost:
    number | null = null;

  if (
    costText.length ===
    0
  ) {
    errors.costoReferencial =
      'Ingrese el costo referencial.';
  } else {
    const parsed =
      Number(
        costText,
      );

    if (
      !Number.isFinite(
        parsed,
      )
    ) {
      errors.costoReferencial =
        'Ingrese un costo referencial válido.';
    } else if (
      parsed < 0
    ) {
      errors.costoReferencial =
        'El costo referencial no puede ser negativo.';
    } else if (
      parsed >
      COST_MAX
    ) {
      errors.costoReferencial =
        'El costo referencial supera el máximo permitido.';
    } else if (
      !hasAtMostTwoDecimals(
        parsed,
      )
    ) {
      errors.costoReferencial =
        'El costo referencial admite como máximo dos decimales.';
    } else {
      cost =
        parsed;
    }
  }

  if (
    !isValidEntityId(
      draft.lugarId,
    )
  ) {
    errors.lugarId =
      'Seleccione un lugar válido.';
  }

  const categoryError =
    validateCategories(
      draft.categoriaIds,
    );

  if (
    categoryError !==
    undefined
  ) {
    errors.categoriaIds =
      categoryError;
  }

  if (
    draft.fuenteInformacion.length >
      0 &&
    source.length ===
      0
  ) {
    errors.fuenteInformacion =
      'La fuente de información no puede contener únicamente espacios.';
  } else if (
    source.length >
    SOURCE_MAX
  ) {
    errors.fuenteInformacion =
      'La fuente de información no puede superar los 500 caracteres.';
  }

  if (
    Object.keys(
      errors,
    ).length >
    0
  ) {
    return {
      ok: false,
      errors,
    };
  }

  if (
    cost ===
      null ||
    draft.lugarId ===
      null
  ) {
    return {
      ok: false,
      errors: {
        costoReferencial:
          cost ===
          null
            ? 'Ingrese un costo referencial válido.'
            : undefined,

        lugarId:
          draft.lugarId ===
          null
            ? 'Seleccione un lugar válido.'
            : undefined,
      },
    };
  }

  return {
    ok: true,
    input: {
      titulo:
        title,

      descripcion:
        description.length ===
        0
          ? null
          : description,

      fechaInicio:
        startDate,

      fechaFin:
        endDate,

      costoReferencial:
        cost,

      lugarId:
        draft.lugarId,

      categoriaIds: [
        ...draft
          .categoriaIds,
      ],

      fuenteInformacion:
        source.length ===
        0
          ? null
          : source,
    },
  };
}
