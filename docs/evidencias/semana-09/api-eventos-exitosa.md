# Evidencia de consumo de la API - Semana 9

## Objetivo

Demostrar mediante una solicitud real que la API propia de ZamoraFest responde correctamente al consultar el listado publico de eventos.

## Contexto

Fecha y hora: 2026-08-28 00:23:21 -05:00
Rama: feat/009-entorno-movil
HEAD base: da01c11
Entorno: desarrollo local

## Solicitud

```http
GET /api/v1/eventos?page=1&limit=5 HTTP/1.1
Host: 192.168.1.102:3000
Accept: application/json
```

## Resultado

Estado HTTP: 200
Content-Type: application/json; charset=utf-8
Elementos detectados en data: 5

## Respuesta real

```json
{
    "data":  [
                 {
                     "id":  1,
                     "titulo":  "Evento cultural de demostración 01",
                     "descripcion":  "Evento programado y aprobado para pruebas de consulta, relaciones y optimización.",
                     "fechaInicio":  "2026-09-05T19:00:00.000",
                     "fechaFin":  "2026-09-05T22:00:00.000",
                     "costoReferencial":  0,
                     "estadoEvento":  "PROGRAMADO",
                     "estadoRevision":  "APROBADO",
                     "fuenteInformacion":  "ZAMORAFEST_DEMO_T029_01",
                     "fechaCreacion":  "2026-08-20T05:09:55.968",
                     "fechaActualizacion":  "2026-08-19T18:00:00.000",
                     "fechaRevision":  "2026-08-19T17:00:00.000",
                     "lugar":  {
                                   "id":  1,
                                   "nombre":  "Parque Lineal de Zamora",
                                   "tipoLugar":  "PARQUE",
                                   "direccionReferencial":  "Zamora, Zamora Chinchipe",
                                   "referencia":  null,
                                   "latitud":  null,
                                   "longitud":  null,
                                   "sector":  {
                                                  "id":  1,
                                                  "nombre":  "Cabecera parroquial",
                                                  "tipoSector":  "CABECERA_PARROQUIAL",
                                                  "parroquia":  {
                                                                    "id":  1,
                                                                    "codigoDpa":  "190150",
                                                                    "nombre":  "Zamora",
                                                                    "canton":  {
                                                                                   "id":  1,
                                                                                   "codigoDpa":  "1901",
                                                                                   "nombre":  "Zamora",
                                                                                   "provincia":  {
                                                                                                     "id":  1,
                                                                                                     "codigoDpa":  "19",
                                                                                                     "nombre":  "Zamora Chinchipe"
                                                                                                 }
                                                                               }
                                                                }
                                              }
                               },
                     "usuarioCreador":  {
                                            "id":  2,
                                            "nombreCompleto":  "Asistente de desarrollo",
                                            "rol":  {
                                                        "id":  2,
                                                        "nombre":  "ASISTENTE"
                                                    }
                                        },
                     "usuarioRevisor":  {
                                            "id":  1,
                                            "nombreCompleto":  "Administrador de desarrollo",
                                            "rol":  {
                                                        "id":  1,
                                                        "nombre":  "ADMINISTRADOR"
                                                    }
                                        },
                     "categorias":  [
                                        {
                                            "id":  1,
                                            "nombre":  "Cultura",
                                            "descripcion":  "Eventos culturales y tradicionales."
                                        }
                                    ]
                 },
                 {
                     "id":  2,
                     "titulo":  "Evento cultural de demostración 02",
                     "descripcion":  "Evento programado y aprobado para pruebas de consulta, relaciones y optimización.",
                     "fechaInicio":  "2026-09-12T19:00:00.000",
                     "fechaFin":  "2026-09-12T22:00:00.000",
                     "costoReferencial":  0,
                     "estadoEvento":  "PROGRAMADO",
                     "estadoRevision":  "APROBADO",
                     "fuenteInformacion":  "ZAMORAFEST_DEMO_T029_02",
                     "fechaCreacion":  "2026-08-20T05:09:56.017",
                     "fechaActualizacion":  "2026-08-19T18:00:00.000",
                     "fechaRevision":  "2026-08-19T17:00:00.000",
                     "lugar":  {
                                   "id":  1,
                                   "nombre":  "Parque Lineal de Zamora",
                                   "tipoLugar":  "PARQUE",
                                   "direccionReferencial":  "Zamora, Zamora Chinchipe",
                                   "referencia":  null,
                                   "latitud":  null,
                                   "longitud":  null,
                                   "sector":  {
                                                  "id":  1,
                                                  "nombre":  "Cabecera parroquial",
                                                  "tipoSector":  "CABECERA_PARROQUIAL",
                                                  "parroquia":  {
                                                                    "id":  1,
                                                                    "codigoDpa":  "190150",
                                                                    "nombre":  "Zamora",
                                                                    "canton":  {
                                                                                   "id":  1,
                                                                                   "codigoDpa":  "1901",
                                                                                   "nombre":  "Zamora",
                                                                                   "provincia":  {
                                                                                                     "id":  1,
                                                                                                     "codigoDpa":  "19",
                                                                                                     "nombre":  "Zamora Chinchipe"
                                                                                                 }
                                                                               }
                                                                }
                                              }
                               },
                     "usuarioCreador":  {
                                            "id":  2,
                                            "nombreCompleto":  "Asistente de desarrollo",
                                            "rol":  {
                                                        "id":  2,
                                                        "nombre":  "ASISTENTE"
                                                    }
                                        },
                     "usuarioRevisor":  {
                                            "id":  1,
                                            "nombreCompleto":  "Administrador de desarrollo",
                                            "rol":  {
                                                        "id":  1,
                                                        "nombre":  "ADMINISTRADOR"
                                                    }
                                        },
                     "categorias":  [
                                        {
                                            "id":  2,
                                            "nombre":  "Música",
                                            "descripcion":  "Conciertos y presentaciones musicales."
                                        }
                                    ]
                 },
                 {
                     "id":  3,
                     "titulo":  "Evento cultural de demostración 03",
                     "descripcion":  "Evento programado y aprobado para pruebas de consulta, relaciones y optimización.",
                     "fechaInicio":  "2026-09-19T19:00:00.000",
                     "fechaFin":  "2026-09-19T22:00:00.000",
                     "costoReferencial":  0,
                     "estadoEvento":  "PROGRAMADO",
                     "estadoRevision":  "APROBADO",
                     "fuenteInformacion":  "ZAMORAFEST_DEMO_T029_03",
                     "fechaCreacion":  "2026-08-20T05:09:56.028",
                     "fechaActualizacion":  "2026-08-19T18:00:00.000",
                     "fechaRevision":  "2026-08-19T17:00:00.000",
                     "lugar":  {
                                   "id":  1,
                                   "nombre":  "Parque Lineal de Zamora",
                                   "tipoLugar":  "PARQUE",
                                   "direccionReferencial":  "Zamora, Zamora Chinchipe",
                                   "referencia":  null,
                                   "latitud":  null,
                                   "longitud":  null,
                                   "sector":  {
                                                  "id":  1,
                                                  "nombre":  "Cabecera parroquial",
                                                  "tipoSector":  "CABECERA_PARROQUIAL",
                                                  "parroquia":  {
                                                                    "id":  1,
                                                                    "codigoDpa":  "190150",
                                                                    "nombre":  "Zamora",
                                                                    "canton":  {
                                                                                   "id":  1,
                                                                                   "codigoDpa":  "1901",
                                                                                   "nombre":  "Zamora",
                                                                                   "provincia":  {
                                                                                                     "id":  1,
                                                                                                     "codigoDpa":  "19",
                                                                                                     "nombre":  "Zamora Chinchipe"
                                                                                                 }
                                                                               }
                                                                }
                                              }
                               },
                     "usuarioCreador":  {
                                            "id":  2,
                                            "nombreCompleto":  "Asistente de desarrollo",
                                            "rol":  {
                                                        "id":  2,
                                                        "nombre":  "ASISTENTE"
                                                    }
                                        },
                     "usuarioRevisor":  {
                                            "id":  1,
                                            "nombreCompleto":  "Administrador de desarrollo",
                                            "rol":  {
                                                        "id":  1,
                                                        "nombre":  "ADMINISTRADOR"
                                                    }
                                        },
                     "categorias":  [
                                        {
                                            "id":  3,
                                            "nombre":  "Gastronomía",
                                            "descripcion":  "Ferias y muestras gastronómicas."
                                        }
                                    ]
                 },
                 {
                     "id":  4,
                     "titulo":  "Evento cultural de demostración 04",
                     "descripcion":  "Evento programado y aprobado para pruebas de consulta, relaciones y optimización.",
                     "fechaInicio":  "2026-09-26T19:00:00.000",
                     "fechaFin":  "2026-09-26T22:00:00.000",
                     "costoReferencial":  5,
                     "estadoEvento":  "PROGRAMADO",
                     "estadoRevision":  "APROBADO",
                     "fuenteInformacion":  "ZAMORAFEST_DEMO_T029_04",
                     "fechaCreacion":  "2026-08-20T05:09:56.042",
                     "fechaActualizacion":  "2026-08-19T18:00:00.000",
                     "fechaRevision":  "2026-08-19T17:00:00.000",
                     "lugar":  {
                                   "id":  1,
                                   "nombre":  "Parque Lineal de Zamora",
                                   "tipoLugar":  "PARQUE",
                                   "direccionReferencial":  "Zamora, Zamora Chinchipe",
                                   "referencia":  null,
                                   "latitud":  null,
                                   "longitud":  null,
                                   "sector":  {
                                                  "id":  1,
                                                  "nombre":  "Cabecera parroquial",
                                                  "tipoSector":  "CABECERA_PARROQUIAL",
                                                  "parroquia":  {
                                                                    "id":  1,
                                                                    "codigoDpa":  "190150",
                                                                    "nombre":  "Zamora",
                                                                    "canton":  {
                                                                                   "id":  1,
                                                                                   "codigoDpa":  "1901",
                                                                                   "nombre":  "Zamora",
                                                                                   "provincia":  {
                                                                                                     "id":  1,
                                                                                                     "codigoDpa":  "19",
                                                                                                     "nombre":  "Zamora Chinchipe"
                                                                                                 }
                                                                               }
                                                                }
                                              }
                               },
                     "usuarioCreador":  {
                                            "id":  2,
                                            "nombreCompleto":  "Asistente de desarrollo",
                                            "rol":  {
                                                        "id":  2,
                                                        "nombre":  "ASISTENTE"
                                                    }
                                        },
                     "usuarioRevisor":  {
                                            "id":  1,
                                            "nombreCompleto":  "Administrador de desarrollo",
                                            "rol":  {
                                                        "id":  1,
                                                        "nombre":  "ADMINISTRADOR"
                                                    }
                                        },
                     "categorias":  [
                                        {
                                            "id":  1,
                                            "nombre":  "Cultura",
                                            "descripcion":  "Eventos culturales y tradicionales."
                                        }
                                    ]
                 },
                 {
                     "id":  5,
                     "titulo":  "Evento cultural de demostración 05",
                     "descripcion":  "Evento programado y aprobado para pruebas de consulta, relaciones y optimización.",
                     "fechaInicio":  "2026-10-03T19:00:00.000",
                     "fechaFin":  "2026-10-03T22:00:00.000",
                     "costoReferencial":  0,
                     "estadoEvento":  "PROGRAMADO",
                     "estadoRevision":  "APROBADO",
                     "fuenteInformacion":  "ZAMORAFEST_DEMO_T029_05",
                     "fechaCreacion":  "2026-08-20T05:09:56.057",
                     "fechaActualizacion":  "2026-08-19T18:00:00.000",
                     "fechaRevision":  "2026-08-19T17:00:00.000",
                     "lugar":  {
                                   "id":  1,
                                   "nombre":  "Parque Lineal de Zamora",
                                   "tipoLugar":  "PARQUE",
                                   "direccionReferencial":  "Zamora, Zamora Chinchipe",
                                   "referencia":  null,
                                   "latitud":  null,
                                   "longitud":  null,
                                   "sector":  {
                                                  "id":  1,
                                                  "nombre":  "Cabecera parroquial",
                                                  "tipoSector":  "CABECERA_PARROQUIAL",
                                                  "parroquia":  {
                                                                    "id":  1,
                                                                    "codigoDpa":  "190150",
                                                                    "nombre":  "Zamora",
                                                                    "canton":  {
                                                                                   "id":  1,
                                                                                   "codigoDpa":  "1901",
                                                                                   "nombre":  "Zamora",
                                                                                   "provincia":  {
                                                                                                     "id":  1,
                                                                                                     "codigoDpa":  "19",
                                                                                                     "nombre":  "Zamora Chinchipe"
                                                                                                 }
                                                                               }
                                                                }
                                              }
                               },
                     "usuarioCreador":  {
                                            "id":  2,
                                            "nombreCompleto":  "Asistente de desarrollo",
                                            "rol":  {
                                                        "id":  2,
                                                        "nombre":  "ASISTENTE"
                                                    }
                                        },
                     "usuarioRevisor":  {
                                            "id":  1,
                                            "nombreCompleto":  "Administrador de desarrollo",
                                            "rol":  {
                                                        "id":  1,
                                                        "nombre":  "ADMINISTRADOR"
                                                    }
                                        },
                     "categorias":  [
                                        {
                                            "id":  2,
                                            "nombre":  "Música",
                                            "descripcion":  "Conciertos y presentaciones musicales."
                                        }
                                    ]
                 }
             ],
    "meta":  {
                 "page":  1,
                 "limit":  5,
                 "total":  12,
                 "totalPages":  3
             }
}
```

## Verificacion

La respuesta fue obtenida mediante una ejecucion real del backend de ZamoraFest.

No se utilizaron datos simulados ni una API externa.

La solicitud respondio HTTP 200, produjo JSON valido y contiene la propiedad data.

La evidencia no requiere credenciales ni tokens porque el listado consultado es publico.

La repeticion del consumo desde la aplicacion instalada en el Samsung corresponde a T065.
