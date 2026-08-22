import type { JsonObject } from 'swagger-ui-express';

// Contrato OpenAPI vigente de ZamoraFest.
// Mantener sincronizado con rutas, validaciones y respuestas reales del backend.

export const openApiDocument: JsonObject = {
  "openapi": "3.1.0",
  "info": {
    "title": "ZamoraFest API",
    "version": "1.0.0",
    "description": "Contrato HTTP vigente del backend ZamoraFest realineado con el modelo canónico de Semana 4. La documentación interactiva y el documento JSON se exponen únicamente fuera de producción."
  },
  "servers": [
    {
      "url": "/api/v1",
      "description": "Servidor relativo de la API v1"
    }
  ],
  "tags": [
    {
      "name": "Sistema"
    },
    {
      "name": "Autenticación"
    },
    {
      "name": "Categorías"
    },
    {
      "name": "Eventos"
    },
    {
      "name": "Programaciones"
    },
    {
      "name": "Imágenes"
    },
    {
      "name": "Favoritos"
    },
    {
      "name": "Recordatorios"
    }
  ],
  "paths": {
    "/health": {
      "get": {
        "tags": [
          "Sistema"
        ],
        "summary": "Comprobar disponibilidad del backend",
        "security": [],
        "responses": {
          "200": {
            "description": "Servicio disponible.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "status",
                    "service"
                  ],
                  "properties": {
                    "status": {
                      "type": "string",
                      "const": "ok"
                    },
                    "service": {
                      "type": "string",
                      "const": "zamorafest-backend"
                    }
                  }
                }
              }
            }
          },
          "500": {
            "$ref": "#/components/responses/InternalError"
          }
        }
      }
    },
    "/auth/register": {
      "post": {
        "tags": [
          "Autenticación"
        ],
        "summary": "Registrar un visitante",
        "description": "El registro público asigna el rol VISITANTE.",
        "security": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/RegisterRequest"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Usuario registrado.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "data"
                  ],
                  "properties": {
                    "data": {
                      "$ref": "#/components/schemas/UsuarioAutenticado"
                    }
                  }
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "409": {
            "$ref": "#/components/responses/Conflict"
          },
          "500": {
            "$ref": "#/components/responses/InternalError"
          }
        }
      }
    },
    "/auth/login": {
      "post": {
        "tags": [
          "Autenticación"
        ],
        "summary": "Iniciar sesión",
        "security": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/LoginRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Sesión iniciada.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "data"
                  ],
                  "properties": {
                    "data": {
                      "$ref": "#/components/schemas/AuthSession"
                    }
                  }
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "500": {
            "$ref": "#/components/responses/InternalError"
          }
        }
      }
    },
    "/auth/refresh": {
      "post": {
        "tags": [
          "Autenticación"
        ],
        "summary": "Renovar la sesión",
        "security": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/RefreshRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Par de tokens renovado.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "data"
                  ],
                  "properties": {
                    "data": {
                      "$ref": "#/components/schemas/AuthSession"
                    }
                  }
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "500": {
            "$ref": "#/components/responses/InternalError"
          }
        }
      }
    },
    "/categorias": {
      "get": {
        "tags": [
          "Categorías"
        ],
        "summary": "Listar categorías activas",
        "security": [],
        "responses": {
          "200": {
            "description": "Categorías activas.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "data"
                  ],
                  "properties": {
                    "data": {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/Categoria"
                      }
                    }
                  }
                }
              }
            }
          },
          "500": {
            "$ref": "#/components/responses/InternalError"
          }
        }
      }
    },
    "/eventos": {
      "get": {
        "tags": [
          "Eventos"
        ],
        "summary": "Listar eventos públicos",
        "description": "Devuelve únicamente eventos PROGRAMADO/APROBADO. La respuesta incluye X-Cache con HIT o MISS.",
        "security": [],
        "parameters": [
          {
            "name": "page",
            "in": "query",
            "schema": {
              "type": "integer",
              "minimum": 1,
              "default": 1
            }
          },
          {
            "name": "limit",
            "in": "query",
            "schema": {
              "type": "integer",
              "minimum": 1,
              "maximum": 50,
              "default": 10
            }
          },
          {
            "name": "cantonId",
            "in": "query",
            "schema": {
              "$ref": "#/components/schemas/EntityId"
            }
          },
          {
            "name": "categoriaId",
            "in": "query",
            "schema": {
              "$ref": "#/components/schemas/EntityId"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Listado paginado de eventos públicos.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "data",
                    "meta"
                  ],
                  "properties": {
                    "data": {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/Evento"
                      }
                    },
                    "meta": {
                      "type": "object",
                      "required": [
                        "page",
                        "limit",
                        "total",
                        "totalPages"
                      ],
                      "properties": {
                        "page": {
                          "type": "integer"
                        },
                        "limit": {
                          "type": "integer"
                        },
                        "total": {
                          "type": "integer"
                        },
                        "totalPages": {
                          "type": "integer"
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "500": {
            "$ref": "#/components/responses/InternalError"
          }
        }
      },
      "post": {
        "tags": [
          "Eventos"
        ],
        "summary": "Crear un evento",
        "description": "Requiere rol ASISTENTE. El evento se crea en BORRADOR/PENDIENTE.",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateEventoRequest"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Evento creado.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "data"
                  ],
                  "properties": {
                    "data": {
                      "$ref": "#/components/schemas/Evento"
                    }
                  }
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "500": {
            "$ref": "#/components/responses/InternalError"
          }
        }
      }
    },
    "/eventos/{id}": {
      "parameters": [
        {
          "name": "id",
          "in": "path",
          "required": true,
          "description": "Identificador entero del evento.",
          "schema": {
            "$ref": "#/components/schemas/EntityId"
          }
        }
      ],
      "get": {
        "tags": [
          "Eventos"
        ],
        "summary": "Obtener un evento público",
        "security": [],
        "responses": {
          "200": {
            "description": "Evento público.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "data"
                  ],
                  "properties": {
                    "data": {
                      "$ref": "#/components/schemas/Evento"
                    }
                  }
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "500": {
            "$ref": "#/components/responses/InternalError"
          }
        }
      },
      "patch": {
        "tags": [
          "Eventos"
        ],
        "summary": "Actualizar un evento",
        "description": "ASISTENTE puede actualizar sus propios borradores. ADMINISTRADOR actúa según la política vigente.",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateEventoRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Evento actualizado.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "data"
                  ],
                  "properties": {
                    "data": {
                      "$ref": "#/components/schemas/Evento"
                    }
                  }
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "500": {
            "$ref": "#/components/responses/InternalError"
          }
        }
      },
      "delete": {
        "tags": [
          "Eventos"
        ],
        "summary": "Eliminar lógicamente un evento",
        "description": "Requiere rol ADMINISTRADOR. El estado funcional pasa a ELIMINADO.",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "204": {
            "description": "Evento eliminado lógicamente."
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "500": {
            "$ref": "#/components/responses/InternalError"
          }
        }
      }
    },
    "/eventos/{id}/revision": {
      "parameters": [
        {
          "name": "id",
          "in": "path",
          "required": true,
          "description": "Identificador entero del evento.",
          "schema": {
            "$ref": "#/components/schemas/EntityId"
          }
        }
      ],
      "post": {
        "tags": [
          "Eventos"
        ],
        "summary": "Revisar un evento",
        "description": "Requiere rol ADMINISTRADOR.",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReviewEventoRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Evento revisado.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "data"
                  ],
                  "properties": {
                    "data": {
                      "$ref": "#/components/schemas/Evento"
                    }
                  }
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "409": {
            "$ref": "#/components/responses/Conflict"
          },
          "500": {
            "$ref": "#/components/responses/InternalError"
          }
        }
      }
    },
    "/eventos/{id}/publicacion": {
      "parameters": [
        {
          "name": "id",
          "in": "path",
          "required": true,
          "description": "Identificador entero del evento.",
          "schema": {
            "$ref": "#/components/schemas/EntityId"
          }
        }
      ],
      "post": {
        "tags": [
          "Eventos"
        ],
        "summary": "Publicar un evento aprobado",
        "description": "Requiere rol ADMINISTRADOR. Un evento BORRADOR/APROBADO pasa a PROGRAMADO/APROBADO.",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "200": {
            "description": "Evento publicado.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "data"
                  ],
                  "properties": {
                    "data": {
                      "$ref": "#/components/schemas/Evento"
                    }
                  }
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "409": {
            "$ref": "#/components/responses/Conflict"
          },
          "500": {
            "$ref": "#/components/responses/InternalError"
          }
        }
      }
    },
    "/eventos/{eventoId}/programaciones": {
      "parameters": [
        {
          "name": "eventoId",
          "in": "path",
          "required": true,
          "description": "Identificador entero del evento.",
          "schema": {
            "$ref": "#/components/schemas/EntityId"
          }
        }
      ],
      "get": {
        "tags": [
          "Programaciones"
        ],
        "summary": "Listar programaciones activas de un evento público",
        "security": [],
        "responses": {
          "200": {
            "description": "Programaciones del evento.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "data"
                  ],
                  "properties": {
                    "data": {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/Programacion"
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "500": {
            "$ref": "#/components/responses/InternalError"
          }
        }
      },
      "post": {
        "tags": [
          "Programaciones"
        ],
        "summary": "Crear una programación",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateProgramacionRequest"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Programación creada.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "data"
                  ],
                  "properties": {
                    "data": {
                      "$ref": "#/components/schemas/Programacion"
                    }
                  }
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "500": {
            "$ref": "#/components/responses/InternalError"
          }
        }
      }
    },
    "/eventos/{eventoId}/programaciones/{programacionId}": {
      "parameters": [
        {
          "name": "eventoId",
          "in": "path",
          "required": true,
          "description": "Identificador entero del evento.",
          "schema": {
            "$ref": "#/components/schemas/EntityId"
          }
        },
        {
          "name": "programacionId",
          "in": "path",
          "required": true,
          "description": "Identificador entero de la programación.",
          "schema": {
            "$ref": "#/components/schemas/EntityId"
          }
        }
      ],
      "get": {
        "tags": [
          "Programaciones"
        ],
        "summary": "Obtener una programación de un evento público",
        "security": [],
        "responses": {
          "200": {
            "description": "Programación.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "data"
                  ],
                  "properties": {
                    "data": {
                      "$ref": "#/components/schemas/Programacion"
                    }
                  }
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "500": {
            "$ref": "#/components/responses/InternalError"
          }
        }
      },
      "patch": {
        "tags": [
          "Programaciones"
        ],
        "summary": "Actualizar una programación",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateProgramacionRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Programación actualizada.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "data"
                  ],
                  "properties": {
                    "data": {
                      "$ref": "#/components/schemas/Programacion"
                    }
                  }
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "500": {
            "$ref": "#/components/responses/InternalError"
          }
        }
      },
      "delete": {
        "tags": [
          "Programaciones"
        ],
        "summary": "Desactivar una programación",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "204": {
            "description": "Programación desactivada."
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "500": {
            "$ref": "#/components/responses/InternalError"
          }
        }
      }
    },
    "/eventos/{eventoId}/imagenes": {
      "parameters": [
        {
          "name": "eventoId",
          "in": "path",
          "required": true,
          "description": "Identificador entero del evento.",
          "schema": {
            "$ref": "#/components/schemas/EntityId"
          }
        }
      ],
      "get": {
        "tags": [
          "Imágenes"
        ],
        "summary": "Listar imágenes activas de un evento público",
        "security": [],
        "responses": {
          "200": {
            "description": "Imágenes del evento.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "data"
                  ],
                  "properties": {
                    "data": {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/Imagen"
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "500": {
            "$ref": "#/components/responses/InternalError"
          }
        }
      },
      "post": {
        "tags": [
          "Imágenes"
        ],
        "summary": "Registrar una imagen de un evento",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateImagenRequest"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Imagen registrada.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "data"
                  ],
                  "properties": {
                    "data": {
                      "$ref": "#/components/schemas/Imagen"
                    }
                  }
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "409": {
            "$ref": "#/components/responses/Conflict"
          },
          "500": {
            "$ref": "#/components/responses/InternalError"
          }
        }
      }
    },
    "/eventos/{eventoId}/imagenes/{imagenId}": {
      "parameters": [
        {
          "name": "eventoId",
          "in": "path",
          "required": true,
          "description": "Identificador entero del evento.",
          "schema": {
            "$ref": "#/components/schemas/EntityId"
          }
        },
        {
          "name": "imagenId",
          "in": "path",
          "required": true,
          "description": "Identificador entero de la imagen.",
          "schema": {
            "$ref": "#/components/schemas/EntityId"
          }
        }
      ],
      "get": {
        "tags": [
          "Imágenes"
        ],
        "summary": "Obtener una imagen de un evento público",
        "security": [],
        "responses": {
          "200": {
            "description": "Imagen.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "data"
                  ],
                  "properties": {
                    "data": {
                      "$ref": "#/components/schemas/Imagen"
                    }
                  }
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "500": {
            "$ref": "#/components/responses/InternalError"
          }
        }
      },
      "delete": {
        "tags": [
          "Imágenes"
        ],
        "summary": "Desactivar una imagen",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "204": {
            "description": "Imagen desactivada."
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "500": {
            "$ref": "#/components/responses/InternalError"
          }
        }
      }
    },
    "/favoritos": {
      "get": {
        "tags": [
          "Favoritos"
        ],
        "summary": "Listar favoritos del usuario autenticado",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "200": {
            "description": "Favoritos del usuario.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "data"
                  ],
                  "properties": {
                    "data": {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/Favorito"
                      }
                    }
                  }
                }
              }
            }
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "500": {
            "$ref": "#/components/responses/InternalError"
          }
        }
      },
      "post": {
        "tags": [
          "Favoritos"
        ],
        "summary": "Agregar un evento público a favoritos",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateFavoritoRequest"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Favorito creado.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "data"
                  ],
                  "properties": {
                    "data": {
                      "$ref": "#/components/schemas/Favorito"
                    }
                  }
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "409": {
            "$ref": "#/components/responses/Conflict"
          },
          "500": {
            "$ref": "#/components/responses/InternalError"
          }
        }
      }
    },
    "/favoritos/{eventoId}": {
      "parameters": [
        {
          "name": "eventoId",
          "in": "path",
          "required": true,
          "description": "Identificador entero del evento favorito.",
          "schema": {
            "$ref": "#/components/schemas/EntityId"
          }
        }
      ],
      "delete": {
        "tags": [
          "Favoritos"
        ],
        "summary": "Eliminar un favorito propio",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "204": {
            "description": "Favorito eliminado."
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "500": {
            "$ref": "#/components/responses/InternalError"
          }
        }
      }
    },
    "/recordatorios": {
      "get": {
        "tags": [
          "Recordatorios"
        ],
        "summary": "Listar recordatorios propios",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "200": {
            "description": "Recordatorios del usuario.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "data"
                  ],
                  "properties": {
                    "data": {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/Recordatorio"
                      }
                    }
                  }
                }
              }
            }
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "500": {
            "$ref": "#/components/responses/InternalError"
          }
        }
      },
      "post": {
        "tags": [
          "Recordatorios"
        ],
        "summary": "Crear un recordatorio",
        "description": "El registro funcional se persiste en PostgreSQL y luego se intenta encolar en BullMQ. Un fallo de cola devuelve 503.",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateRecordatorioRequest"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Recordatorio creado y encolado.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "data"
                  ],
                  "properties": {
                    "data": {
                      "$ref": "#/components/schemas/Recordatorio"
                    }
                  }
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "503": {
            "$ref": "#/components/responses/ServiceUnavailable"
          },
          "500": {
            "$ref": "#/components/responses/InternalError"
          }
        }
      }
    },
    "/recordatorios/{id}": {
      "parameters": [
        {
          "name": "id",
          "in": "path",
          "required": true,
          "description": "Identificador entero del recordatorio.",
          "schema": {
            "$ref": "#/components/schemas/EntityId"
          }
        }
      ],
      "get": {
        "tags": [
          "Recordatorios"
        ],
        "summary": "Obtener un recordatorio propio",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "200": {
            "description": "Recordatorio.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "data"
                  ],
                  "properties": {
                    "data": {
                      "$ref": "#/components/schemas/Recordatorio"
                    }
                  }
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "500": {
            "$ref": "#/components/responses/InternalError"
          }
        }
      },
      "delete": {
        "tags": [
          "Recordatorios"
        ],
        "summary": "Desactivar un recordatorio propio",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "204": {
            "description": "Recordatorio desactivado."
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "409": {
            "$ref": "#/components/responses/Conflict"
          },
          "500": {
            "$ref": "#/components/responses/InternalError"
          }
        }
      }
    }
  },
  "components": {
    "securitySchemes": {
      "bearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "description": "JWT de acceso. Vigencia funcional: 15 minutos."
      }
    },
    "schemas": {
      "EntityId": {
        "type": "integer",
        "format": "int32",
        "minimum": 1,
        "maximum": 2147483647
      },
      "LocalDateTime": {
        "type": "string",
        "pattern": "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}(?::\\d{2}(?:\\.\\d{1,3})?)?$",
        "description": "Fecha y hora local del dominio, sin offset, interpretada por ZamoraFest en America/Guayaquil.",
        "example": "2026-08-22T19:30:00.000"
      },
      "Rol": {
        "type": "string",
        "enum": [
          "VISITANTE",
          "ASISTENTE",
          "ADMINISTRADOR"
        ]
      },
      "EstadoEvento": {
        "type": "string",
        "enum": [
          "BORRADOR",
          "PROGRAMADO",
          "CANCELADO",
          "FINALIZADO",
          "ELIMINADO"
        ]
      },
      "EstadoRevision": {
        "type": "string",
        "enum": [
          "PENDIENTE",
          "APROBADO",
          "RECHAZADO"
        ]
      },
      "TipoImagen": {
        "type": "string",
        "enum": [
          "AFICHE",
          "FOTOGRAFIA",
          "OTRA"
        ]
      },
      "Categoria": {
        "type": "object",
        "required": [
          "id",
          "nombre",
          "descripcion"
        ],
        "properties": {
          "id": {
            "$ref": "#/components/schemas/EntityId"
          },
          "nombre": {
            "type": "string"
          },
          "descripcion": {
            "type": [
              "string",
              "null"
            ]
          }
        }
      },
      "UsuarioAutenticado": {
        "type": "object",
        "required": [
          "id",
          "nombre",
          "email",
          "rol"
        ],
        "properties": {
          "id": {
            "$ref": "#/components/schemas/EntityId"
          },
          "nombre": {
            "type": "string"
          },
          "email": {
            "type": "string",
            "format": "email"
          },
          "rol": {
            "$ref": "#/components/schemas/Rol"
          }
        }
      },
      "AuthSession": {
        "type": "object",
        "required": [
          "accessToken",
          "refreshToken",
          "tokenType",
          "expiresIn",
          "usuario"
        ],
        "properties": {
          "accessToken": {
            "type": "string"
          },
          "refreshToken": {
            "type": "string"
          },
          "tokenType": {
            "type": "string",
            "const": "Bearer"
          },
          "expiresIn": {
            "type": "integer",
            "example": 900
          },
          "usuario": {
            "$ref": "#/components/schemas/UsuarioAutenticado"
          }
        }
      },
      "RegisterRequest": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "nombre",
          "email",
          "password"
        ],
        "properties": {
          "nombre": {
            "type": "string",
            "minLength": 2,
            "maxLength": 100
          },
          "email": {
            "type": "string",
            "format": "email",
            "maxLength": 254
          },
          "password": {
            "type": "string",
            "format": "password",
            "minLength": 8,
            "maxLength": 72
          }
        }
      },
      "LoginRequest": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "email",
          "password"
        ],
        "properties": {
          "email": {
            "type": "string",
            "format": "email",
            "maxLength": 254
          },
          "password": {
            "type": "string",
            "format": "password",
            "minLength": 1,
            "maxLength": 72
          }
        }
      },
      "RefreshRequest": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "refreshToken"
        ],
        "properties": {
          "refreshToken": {
            "type": "string",
            "minLength": 1
          }
        }
      },
      "LugarEvento": {
        "type": "object",
        "description": "Lugar con jerarquía territorial devuelto por los eventos.",
        "required": [
          "id",
          "nombre",
          "tipoLugar",
          "sector"
        ],
        "properties": {
          "id": {
            "$ref": "#/components/schemas/EntityId"
          },
          "nombre": {
            "type": "string"
          },
          "tipoLugar": {
            "type": "string",
            "enum": [
              "PARQUE",
              "COLISEO",
              "BALNEARIO",
              "CANCHA",
              "RECINTO_FERIAL",
              "CASA_COMUNAL",
              "OTRO"
            ]
          },
          "direccionReferencial": {
            "type": [
              "string",
              "null"
            ]
          },
          "referencia": {
            "type": [
              "string",
              "null"
            ]
          },
          "latitud": {
            "type": [
              "string",
              "null"
            ],
            "description": "Decimal de PostgreSQL serializado por Prisma."
          },
          "longitud": {
            "type": [
              "string",
              "null"
            ],
            "description": "Decimal de PostgreSQL serializado por Prisma."
          },
          "sector": {
            "type": "object",
            "required": [
              "id",
              "nombre",
              "tipoSector",
              "parroquia"
            ],
            "properties": {
              "id": {
                "$ref": "#/components/schemas/EntityId"
              },
              "nombre": {
                "type": "string"
              },
              "tipoSector": {
                "type": "string",
                "enum": [
                  "BARRIO",
                  "COMUNIDAD",
                  "RECINTO",
                  "CIUDADELA",
                  "CABECERA_PARROQUIAL",
                  "OTRO"
                ]
              },
              "parroquia": {
                "type": "object",
                "required": [
                  "id",
                  "codigoDpa",
                  "nombre",
                  "canton"
                ],
                "properties": {
                  "id": {
                    "$ref": "#/components/schemas/EntityId"
                  },
                  "codigoDpa": {
                    "type": "string"
                  },
                  "nombre": {
                    "type": "string"
                  },
                  "canton": {
                    "type": "object",
                    "required": [
                      "id",
                      "codigoDpa",
                      "nombre",
                      "provincia"
                    ],
                    "properties": {
                      "id": {
                        "$ref": "#/components/schemas/EntityId"
                      },
                      "codigoDpa": {
                        "type": "string"
                      },
                      "nombre": {
                        "type": "string"
                      },
                      "provincia": {
                        "type": "object",
                        "required": [
                          "id",
                          "codigoDpa",
                          "nombre"
                        ],
                        "properties": {
                          "id": {
                            "$ref": "#/components/schemas/EntityId"
                          },
                          "codigoDpa": {
                            "type": "string"
                          },
                          "nombre": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "UsuarioResumen": {
        "type": "object",
        "required": [
          "id",
          "nombreCompleto",
          "rol"
        ],
        "properties": {
          "id": {
            "$ref": "#/components/schemas/EntityId"
          },
          "nombreCompleto": {
            "type": "string"
          },
          "rol": {
            "type": "object",
            "required": [
              "id",
              "nombre"
            ],
            "properties": {
              "id": {
                "$ref": "#/components/schemas/EntityId"
              },
              "nombre": {
                "$ref": "#/components/schemas/Rol"
              }
            }
          }
        }
      },
      "Evento": {
        "type": "object",
        "required": [
          "id",
          "titulo",
          "descripcion",
          "fechaInicio",
          "fechaFin",
          "costoReferencial",
          "estadoEvento",
          "estadoRevision",
          "fuenteInformacion",
          "fechaCreacion",
          "fechaActualizacion",
          "fechaRevision",
          "lugar",
          "usuarioCreador",
          "usuarioRevisor",
          "categorias"
        ],
        "properties": {
          "id": {
            "$ref": "#/components/schemas/EntityId"
          },
          "titulo": {
            "type": "string",
            "maxLength": 200
          },
          "descripcion": {
            "type": [
              "string",
              "null"
            ]
          },
          "fechaInicio": {
            "$ref": "#/components/schemas/LocalDateTime"
          },
          "fechaFin": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/LocalDateTime"
              },
              {
                "type": "null"
              }
            ]
          },
          "costoReferencial": {
            "type": "number",
            "minimum": 0,
            "maximum": 99999999.99,
            "multipleOf": 0.01
          },
          "estadoEvento": {
            "$ref": "#/components/schemas/EstadoEvento"
          },
          "estadoRevision": {
            "$ref": "#/components/schemas/EstadoRevision"
          },
          "fuenteInformacion": {
            "type": [
              "string",
              "null"
            ],
            "maxLength": 500
          },
          "fechaCreacion": {
            "$ref": "#/components/schemas/LocalDateTime"
          },
          "fechaActualizacion": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/LocalDateTime"
              },
              {
                "type": "null"
              }
            ]
          },
          "fechaRevision": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/LocalDateTime"
              },
              {
                "type": "null"
              }
            ]
          },
          "lugar": {
            "$ref": "#/components/schemas/LugarEvento"
          },
          "usuarioCreador": {
            "$ref": "#/components/schemas/UsuarioResumen"
          },
          "usuarioRevisor": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/UsuarioResumen"
              },
              {
                "type": "null"
              }
            ]
          },
          "categorias": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Categoria"
            }
          }
        }
      },
      "CreateEventoRequest": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "titulo",
          "fechaInicio",
          "costoReferencial",
          "lugarId",
          "categoriaIds"
        ],
        "properties": {
          "titulo": {
            "type": "string",
            "minLength": 1,
            "maxLength": 200
          },
          "descripcion": {
            "type": [
              "string",
              "null"
            ],
            "minLength": 1
          },
          "fechaInicio": {
            "$ref": "#/components/schemas/LocalDateTime"
          },
          "fechaFin": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/LocalDateTime"
              },
              {
                "type": "null"
              }
            ]
          },
          "costoReferencial": {
            "type": "number",
            "minimum": 0,
            "maximum": 99999999.99,
            "multipleOf": 0.01
          },
          "lugarId": {
            "$ref": "#/components/schemas/EntityId"
          },
          "categoriaIds": {
            "type": "array",
            "minItems": 1,
            "uniqueItems": true,
            "items": {
              "$ref": "#/components/schemas/EntityId"
            }
          },
          "fuenteInformacion": {
            "type": [
              "string",
              "null"
            ],
            "minLength": 1,
            "maxLength": 500
          }
        }
      },
      "UpdateEventoRequest": {
        "type": "object",
        "additionalProperties": false,
        "minProperties": 1,
        "properties": {
          "titulo": {
            "type": "string",
            "minLength": 1,
            "maxLength": 200
          },
          "descripcion": {
            "type": [
              "string",
              "null"
            ],
            "minLength": 1
          },
          "fechaInicio": {
            "$ref": "#/components/schemas/LocalDateTime"
          },
          "fechaFin": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/LocalDateTime"
              },
              {
                "type": "null"
              }
            ]
          },
          "costoReferencial": {
            "type": "number",
            "minimum": 0,
            "maximum": 99999999.99,
            "multipleOf": 0.01
          },
          "lugarId": {
            "$ref": "#/components/schemas/EntityId"
          },
          "categoriaIds": {
            "type": "array",
            "minItems": 1,
            "uniqueItems": true,
            "items": {
              "$ref": "#/components/schemas/EntityId"
            }
          },
          "fuenteInformacion": {
            "type": [
              "string",
              "null"
            ],
            "minLength": 1,
            "maxLength": 500
          }
        }
      },
      "ReviewEventoRequest": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "decision"
        ],
        "properties": {
          "decision": {
            "type": "string",
            "enum": [
              "APROBAR",
              "RECHAZAR"
            ]
          }
        }
      },
      "Programacion": {
        "type": "object",
        "required": [
          "id",
          "eventoId",
          "lugarId",
          "tituloActividad",
          "descripcion",
          "fechaHoraInicio",
          "fechaHoraFin",
          "artistaInvitado",
          "orden",
          "estado",
          "lugar"
        ],
        "properties": {
          "id": {
            "$ref": "#/components/schemas/EntityId"
          },
          "eventoId": {
            "$ref": "#/components/schemas/EntityId"
          },
          "lugarId": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/EntityId"
              },
              {
                "type": "null"
              }
            ]
          },
          "tituloActividad": {
            "type": "string",
            "maxLength": 200
          },
          "descripcion": {
            "type": [
              "string",
              "null"
            ]
          },
          "fechaHoraInicio": {
            "$ref": "#/components/schemas/LocalDateTime"
          },
          "fechaHoraFin": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/LocalDateTime"
              },
              {
                "type": "null"
              }
            ]
          },
          "artistaInvitado": {
            "type": [
              "string",
              "null"
            ],
            "maxLength": 200
          },
          "orden": {
            "type": [
              "integer",
              "null"
            ],
            "minimum": 0,
            "maximum": 2147483647
          },
          "estado": {
            "type": "boolean"
          },
          "lugar": {
            "type": [
              "object",
              "null"
            ],
            "properties": {
              "id": {
                "$ref": "#/components/schemas/EntityId"
              },
              "nombre": {
                "type": "string"
              },
              "tipoLugar": {
                "type": "string"
              },
              "direccionReferencial": {
                "type": [
                  "string",
                  "null"
                ]
              }
            }
          }
        }
      },
      "CreateProgramacionRequest": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "tituloActividad",
          "fechaHoraInicio"
        ],
        "properties": {
          "tituloActividad": {
            "type": "string",
            "minLength": 1,
            "maxLength": 200
          },
          "descripcion": {
            "type": [
              "string",
              "null"
            ],
            "minLength": 1
          },
          "fechaHoraInicio": {
            "$ref": "#/components/schemas/LocalDateTime"
          },
          "fechaHoraFin": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/LocalDateTime"
              },
              {
                "type": "null"
              }
            ]
          },
          "lugarId": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/EntityId"
              },
              {
                "type": "null"
              }
            ]
          },
          "artistaInvitado": {
            "type": [
              "string",
              "null"
            ],
            "minLength": 1,
            "maxLength": 200
          },
          "orden": {
            "type": [
              "integer",
              "null"
            ],
            "minimum": 0,
            "maximum": 2147483647
          }
        }
      },
      "UpdateProgramacionRequest": {
        "type": "object",
        "additionalProperties": false,
        "minProperties": 1,
        "properties": {
          "tituloActividad": {
            "type": "string",
            "minLength": 1,
            "maxLength": 200
          },
          "descripcion": {
            "type": [
              "string",
              "null"
            ],
            "minLength": 1
          },
          "fechaHoraInicio": {
            "$ref": "#/components/schemas/LocalDateTime"
          },
          "fechaHoraFin": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/LocalDateTime"
              },
              {
                "type": "null"
              }
            ]
          },
          "lugarId": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/EntityId"
              },
              {
                "type": "null"
              }
            ]
          },
          "artistaInvitado": {
            "type": [
              "string",
              "null"
            ],
            "minLength": 1,
            "maxLength": 200
          },
          "orden": {
            "type": [
              "integer",
              "null"
            ],
            "minimum": 0,
            "maximum": 2147483647
          }
        }
      },
      "ProgramacionResumen": {
        "type": "object",
        "required": [
          "id",
          "eventoId",
          "tituloActividad",
          "fechaHoraInicio",
          "fechaHoraFin",
          "estado"
        ],
        "properties": {
          "id": {
            "$ref": "#/components/schemas/EntityId"
          },
          "eventoId": {
            "$ref": "#/components/schemas/EntityId"
          },
          "tituloActividad": {
            "type": "string"
          },
          "fechaHoraInicio": {
            "$ref": "#/components/schemas/LocalDateTime"
          },
          "fechaHoraFin": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/LocalDateTime"
              },
              {
                "type": "null"
              }
            ]
          },
          "estado": {
            "type": "boolean"
          }
        }
      },
      "Imagen": {
        "type": "object",
        "required": [
          "id",
          "eventoId",
          "programacionId",
          "urlImagen",
          "tipoImagen",
          "descripcion",
          "esPrincipal",
          "fechaSubida",
          "estado",
          "programacion"
        ],
        "properties": {
          "id": {
            "$ref": "#/components/schemas/EntityId"
          },
          "eventoId": {
            "$ref": "#/components/schemas/EntityId"
          },
          "programacionId": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/EntityId"
              },
              {
                "type": "null"
              }
            ]
          },
          "urlImagen": {
            "type": "string",
            "format": "uri",
            "maxLength": 2048
          },
          "tipoImagen": {
            "$ref": "#/components/schemas/TipoImagen"
          },
          "descripcion": {
            "type": [
              "string",
              "null"
            ],
            "maxLength": 255
          },
          "esPrincipal": {
            "type": "boolean"
          },
          "fechaSubida": {
            "$ref": "#/components/schemas/LocalDateTime"
          },
          "estado": {
            "type": "boolean"
          },
          "programacion": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/ProgramacionResumen"
              },
              {
                "type": "null"
              }
            ]
          }
        }
      },
      "CreateImagenRequest": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "urlImagen",
          "tipoImagen"
        ],
        "properties": {
          "urlImagen": {
            "type": "string",
            "format": "uri",
            "maxLength": 2048
          },
          "tipoImagen": {
            "$ref": "#/components/schemas/TipoImagen"
          },
          "descripcion": {
            "type": [
              "string",
              "null"
            ],
            "minLength": 1,
            "maxLength": 255
          },
          "programacionId": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/EntityId"
              },
              {
                "type": "null"
              }
            ]
          },
          "esPrincipal": {
            "type": "boolean",
            "default": false
          }
        }
      },
      "Favorito": {
        "type": "object",
        "required": [
          "eventoId",
          "fechaAgregado",
          "evento"
        ],
        "properties": {
          "eventoId": {
            "$ref": "#/components/schemas/EntityId"
          },
          "fechaAgregado": {
            "$ref": "#/components/schemas/LocalDateTime"
          },
          "evento": {
            "type": "object",
            "required": [
              "id",
              "titulo",
              "fechaInicio",
              "fechaFin",
              "costoReferencial",
              "estadoEvento",
              "estadoRevision",
              "lugar",
              "categorias"
            ],
            "properties": {
              "id": {
                "$ref": "#/components/schemas/EntityId"
              },
              "titulo": {
                "type": "string"
              },
              "fechaInicio": {
                "$ref": "#/components/schemas/LocalDateTime"
              },
              "fechaFin": {
                "oneOf": [
                  {
                    "$ref": "#/components/schemas/LocalDateTime"
                  },
                  {
                    "type": "null"
                  }
                ]
              },
              "costoReferencial": {
                "type": "number",
                "minimum": 0
              },
              "estadoEvento": {
                "$ref": "#/components/schemas/EstadoEvento"
              },
              "estadoRevision": {
                "$ref": "#/components/schemas/EstadoRevision"
              },
              "lugar": {
                "$ref": "#/components/schemas/LugarEvento"
              },
              "categorias": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/Categoria"
                }
              }
            }
          }
        }
      },
      "CreateFavoritoRequest": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "eventoId"
        ],
        "properties": {
          "eventoId": {
            "$ref": "#/components/schemas/EntityId"
          }
        }
      },
      "Recordatorio": {
        "type": "object",
        "required": [
          "id",
          "eventoId",
          "programacionId",
          "fechaNotificacion",
          "activo",
          "fechaCreacion",
          "evento",
          "programacion"
        ],
        "properties": {
          "id": {
            "$ref": "#/components/schemas/EntityId"
          },
          "eventoId": {
            "$ref": "#/components/schemas/EntityId"
          },
          "programacionId": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/EntityId"
              },
              {
                "type": "null"
              }
            ]
          },
          "fechaNotificacion": {
            "$ref": "#/components/schemas/LocalDateTime"
          },
          "activo": {
            "type": "boolean"
          },
          "fechaCreacion": {
            "$ref": "#/components/schemas/LocalDateTime"
          },
          "evento": {
            "type": "object",
            "required": [
              "id",
              "titulo",
              "fechaInicio",
              "fechaFin",
              "estadoEvento",
              "estadoRevision"
            ],
            "properties": {
              "id": {
                "$ref": "#/components/schemas/EntityId"
              },
              "titulo": {
                "type": "string"
              },
              "fechaInicio": {
                "$ref": "#/components/schemas/LocalDateTime"
              },
              "fechaFin": {
                "oneOf": [
                  {
                    "$ref": "#/components/schemas/LocalDateTime"
                  },
                  {
                    "type": "null"
                  }
                ]
              },
              "estadoEvento": {
                "$ref": "#/components/schemas/EstadoEvento"
              },
              "estadoRevision": {
                "$ref": "#/components/schemas/EstadoRevision"
              }
            }
          },
          "programacion": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/ProgramacionResumen"
              },
              {
                "type": "null"
              }
            ]
          }
        }
      },
      "CreateRecordatorioRequest": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "eventoId",
          "fechaNotificacion"
        ],
        "properties": {
          "eventoId": {
            "$ref": "#/components/schemas/EntityId"
          },
          "programacionId": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/EntityId"
              },
              {
                "type": "null"
              }
            ]
          },
          "fechaNotificacion": {
            "$ref": "#/components/schemas/LocalDateTime"
          }
        }
      },
      "ErrorResponse": {
        "type": "object",
        "required": [
          "error"
        ],
        "properties": {
          "error": {
            "type": "object",
            "required": [
              "code",
              "message"
            ],
            "properties": {
              "code": {
                "type": "string",
                "example": "VALIDATION_ERROR"
              },
              "message": {
                "type": "string",
                "example": "La solicitud contiene datos inválidos."
              },
              "details": {
                "description": "Detalle opcional. Los errores de validación usan una lista de objetos con path y message."
              }
            }
          }
        }
      }
    },
    "responses": {
      "BadRequest": {
        "description": "Solicitud inválida o fallo de validación.",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/ErrorResponse"
            }
          }
        }
      },
      "Unauthorized": {
        "description": "Autenticación requerida, credenciales inválidas o token inválido.",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/ErrorResponse"
            }
          }
        }
      },
      "Forbidden": {
        "description": "El usuario autenticado no tiene permisos para la operación.",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/ErrorResponse"
            }
          }
        }
      },
      "NotFound": {
        "description": "El recurso solicitado no existe o no está disponible.",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/ErrorResponse"
            }
          }
        }
      },
      "Conflict": {
        "description": "La operación entra en conflicto con el estado actual del recurso.",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/ErrorResponse"
            }
          }
        }
      },
      "ServiceUnavailable": {
        "description": "Dependencia temporalmente no disponible.",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/ErrorResponse"
            }
          }
        }
      },
      "InternalError": {
        "description": "Error interno no controlado.",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/ErrorResponse"
            }
          }
        }
      }
    }
  }
};
