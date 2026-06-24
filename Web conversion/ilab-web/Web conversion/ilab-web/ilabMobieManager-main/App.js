import React from 'react';
import { I18nManager, View, Text } from 'react-native';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import ReduxThunk from 'redux-thunk';
import notifee, { EventType } from '@notifee/react-native';

import reducers from './src/reducers';
import RootScene from './src/components/RootScene';
import Router from './src/scenes/Router';
import translationsObject from './src/lang';
import I18n from './src/lang/i18n';

I18nManager.allowRTL(false);

const store = createStore(reducers, {}, applyMiddleware(ReduxThunk));
I18n.setTranslations(translationsObject);

notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification, pressAction } = detail;
  if (type === EventType.ACTION_PRESS && pressAction.id === 'mark-as-read')
    await notifee.cancelNotification(notification.id);
});

const App = () => (
  <Provider store={store}>
    <RootScene>
      <Router />
    </RootScene>
  </Provider>
);

export default App;
