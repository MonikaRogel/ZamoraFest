import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import AsyncStateView from '../components/ui/AsyncStateView';
import EventCard from '../components/ui/EventCard';
import FilterChip from '../components/ui/FilterChip';
import ScreenHeader from '../components/ui/ScreenHeader';
import {
  ApiRequestError,
  zamoraFestApi,
} from '../services/api/zamorafest-api';
import type { Evento } from '../types/api';

import './ExploreEventsPage.css';

type LoadState = 'loading' | 'success' | 'error';

function formatEventDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Fecha por confirmar';
  }

  return new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
}

function formatEventCost(value: number): string {
  if (value === 0) {
    return 'Gratuito';
  }

  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

function getEventStartTime(event: Evento): number | null {
  const startTime = new Date(event.fechaInicio).getTime();

  return Number.isNaN(startTime) ? null : startTime;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (error.status === null) {
      return 'No fue posible conectarse con ZamoraFest. Revise su conexión e intente nuevamente.';
    }

    if (error.status >= 500) {
      return 'El servicio de eventos no está disponible temporalmente. Intente nuevamente en unos momentos.';
    }
  }

  return 'No fue posible cargar los eventos. Intente nuevamente.';
}

function ExploreEventsPage() {
  const [events, setEvents] = useState<readonly Evento[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    null,
  );

  const loadEvents = useCallback(async () => {
    setLoadState('loading');
    setErrorMessage('');

    try {
      const response = await zamoraFestApi.getEventos();

      setEvents(response.data);
      setLoadState('success');
    } catch (error) {
      setEvents([]);
      setErrorMessage(getErrorMessage(error));
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          events.flatMap((event) =>
            event.categorias.map((category) => category.nombre),
          ),
        ),
      ).sort((a, b) => a.localeCompare(b, 'es')),
    [events],
  );

  const visibleEvents = useMemo(() => {
    if (selectedCategory === null) {
      return events;
    }

    return events.filter((event) =>
      event.categorias.some(
        (category) => category.nombre === selectedCategory,
      ),
    );
  }, [events, selectedCategory]);

  const nextEvent = useMemo(() => {
    const now = Date.now();

    return (
      [...visibleEvents]
        .filter((event) => {
          const startTime = getEventStartTime(event);

          return startTime !== null && startTime >= now;
        })
        .sort((firstEvent, secondEvent) => {
          const firstStart = getEventStartTime(firstEvent);
          const secondStart = getEventStartTime(secondEvent);

          return (
            (firstStart ?? Number.POSITIVE_INFINITY) -
            (secondStart ?? Number.POSITIVE_INFINITY)
          );
        })[0] ?? null
    );
  }, [visibleEvents]);

  const remainingEvents = useMemo(
    () =>
      nextEvent === null
        ? visibleEvents
        : visibleEvents.filter((event) => event.id !== nextEvent.id),
    [nextEvent, visibleEvents],
  );

  return (
    <IonPage>
      <IonHeader className="zf-app-header">
        <IonToolbar>
          <IonTitle className="zf-app-brand">
            <span className="zf-app-brand__name">
              ZamoraFest
            </span>

            <span
              className="zf-app-brand__separator"
              aria-hidden="true"
            ></span>

            <span className="zf-app-brand__descriptor">
              Agenda cultural y festiva
            </span>
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <main className="zf-explore">
          <ScreenHeader
            title="Descubre Zamora Chinchipe"
            description="Fiestas, ferias, música y tradiciones de la provincia."
          />

          {loadState === 'loading' && (
            <AsyncStateView
              state="loading"
              title="Cargando eventos"
              message="Estamos consultando la agenda disponible."
            />
          )}

          {loadState === 'error' && (
            <AsyncStateView
              state="error"
              title="No pudimos cargar los eventos"
              message={errorMessage}
              onAction={() => {
                void loadEvents();
              }}
            />
          )}

          {loadState === 'success' && events.length === 0 && (
            <AsyncStateView
              state="empty"
              title="No hay eventos disponibles"
              message="La agenda no tiene eventos publicados en este momento."
            />
          )}

          {loadState === 'success' && events.length > 0 && (
            <>
              {categories.length > 0 && (
                <section
                  className="zf-explore__filters"
                  aria-label="Filtrar eventos por categoría"
                >
                  <FilterChip
                    label="Todos"
                    selected={selectedCategory === null}
                    onClick={() => {
                      setSelectedCategory(null);
                    }}
                  />

                  {categories.map((category) => (
                    <FilterChip
                      key={category}
                      label={category}
                      selected={selectedCategory === category}
                      onClick={() => {
                        setSelectedCategory(category);
                      }}
                    />
                  ))}
                </section>
              )}

              {visibleEvents.length === 0 ? (
                <AsyncStateView
                  state="empty"
                  title="Sin coincidencias"
                  message="No hay eventos disponibles para el filtro seleccionado."
                />
              ) : (
                <>
                  {nextEvent && (
                    <section
                      className="zf-explore__featured"
                      aria-labelledby="zf-next-event-heading"
                    >
                      <div className="zf-explore__section-heading">
                        <h2 id="zf-next-event-heading">
                          Próximo evento
                        </h2>
                      </div>

                      <EventCard
                        variant="featured"
                        title={nextEvent.titulo}
                        description={nextEvent.descripcion}
                        dateLabel={formatEventDate(
                          nextEvent.fechaInicio,
                        )}
                        locationLabel={nextEvent.lugar.nombre}
                        categoryLabels={nextEvent.categorias.map(
                          (category) => category.nombre,
                        )}
                        costLabel={formatEventCost(
                          nextEvent.costoReferencial,
                        )}
                      />
                    </section>
                  )}

                  {remainingEvents.length > 0 && (
                    <section
                      className="zf-explore__events"
                      aria-labelledby="zf-more-events-heading"
                    >
                      <div className="zf-explore__section-heading">
                        <h2 id="zf-more-events-heading">
                          {nextEvent
                            ? 'Más eventos'
                            : 'Eventos disponibles'}
                        </h2>
                      </div>

                      <div
                        className="zf-explore__list"
                        aria-label="Eventos disponibles"
                      >
                        {remainingEvents.map((event) => (
                          <EventCard
                            key={event.id}
                            variant="compact"
                            title={event.titulo}
                            description={event.descripcion}
                            dateLabel={formatEventDate(
                              event.fechaInicio,
                            )}
                            locationLabel={event.lugar.nombre}
                            categoryLabels={event.categorias.map(
                              (category) => category.nombre,
                            )}
                            costLabel={formatEventCost(
                              event.costoReferencial,
                            )}
                          />
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}
            </>
          )}
        </main>
      </IonContent>
    </IonPage>
  );
}

export default ExploreEventsPage;