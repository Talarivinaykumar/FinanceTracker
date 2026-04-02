import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ActivityIndicator, View, Text } from 'react-native';

import { store, persistor } from './src/store/store';
import { AppNavigator } from './src/navigation/AppNavigator';

import { ErrorBoundary } from './src/components/ErrorBoundary';

const Loading = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#faf9fa' }}>
    <ActivityIndicator size="large" color="#094cb2" />
    <Text style={{ marginTop: 16, fontSize: 16, fontWeight: '600', color: '#1b1c1d', fontFamily: 'serif' }}>Loading FinanceTracker...</Text>
  </View>
);

function App(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={<Loading />} persistor={persistor}>
          <SafeAreaProvider>
            <AppNavigator />
          </SafeAreaProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
