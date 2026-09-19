import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact,
} from '@ionic/react';
import {
  IonReactRouter,
} from '@ionic/react-router';
import {
  Redirect,
  Route,
} from 'react-router-dom';

import EnvironmentStatusPage from './pages/EnvironmentStatusPage';
import ExploreEventsPage from './pages/ExploreEventsPage';
import RegisterPage from './pages/RegisterPage';
import LoginRoute from './routing/LoginRoute';
import { ApplicationStateProvider } from './state/ApplicationStateContext';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import '@ionic/react/css/palettes/dark.system.css';

import './theme/variables.css';

setupIonicReact();

function App() {
  return (
    <ApplicationStateProvider>
      <IonApp>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route
              exact
              path="/login"
              component={LoginRoute}
            />

            <Route
              exact
              path="/register"
              component={RegisterPage}
            />

            <Route
              exact
              path="/environment"
              component={
                EnvironmentStatusPage
              }
            />

            <Route
              exact
              path="/explore"
              component={
                ExploreEventsPage
              }
            />

            <Route
              exact
              path="/"
              render={() => (
                <Redirect to="/login" />
              )}
            />
          </IonRouterOutlet>
        </IonReactRouter>
      </IonApp>
    </ApplicationStateProvider>
  );
}

export default App;
