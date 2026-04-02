import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ActivityIndicator, View, Text, StatusBar } from 'react-native';

import { store, persistor } from './src/store/store';
import { AppNavigator } from './src/navigation/AppNavigator';

import { ErrorBoundary } from './src/components/ErrorBoundary';
import { useTheme } from './src/theme/colors';

const Loading = () => {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
      <ActivityIndicator size="large" color={theme.primary} />
      <Text style={{ marginTop: 16, fontSize: 16, fontWeight: '600', color: theme.text, fontFamily: 'serif' }}>Loading FinanceTracker...</Text>
    </View>
  );
};

function App(): React.JSX.Element {
  const theme = useTheme();
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={<Loading />} persistor={persistor}>
          <SafeAreaProvider>
            <StatusBar barStyle={theme.statusBar} backgroundColor={theme.background} />
            <AppNavigator />
          </SafeAreaProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
