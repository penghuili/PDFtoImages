import React from 'react';
import { Provider as StoreProvider, useDispatch } from 'react-redux';
import { useLocation } from 'wouter';
import PDFtoImages from './PDFtoImages';
import { apps } from './shared/js/apps';
import createTheme from './shared/react-pure/createTheme';
import AppContainer from './shared/react/AppContainer';
import Toast from './shared/react/Toast';
import { HooksOutsieWrapper, setHook } from './shared/react/hooksOutside';
import store from './store';

setHook('location', useLocation);
setHook('dispatch', useDispatch);

const theme = createTheme(apps.pdf37.color);

function App() {
  return (
    <StoreProvider store={store}>
      <AppContainer theme={theme}>
        <PDFtoImages />
        <Toast />
      </AppContainer>
      <HooksOutsieWrapper />
    </StoreProvider>
  );
}

export default App;
