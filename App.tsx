import React from 'react';
import {SafeAreaView, StatusBar} from 'react-native';
import CurrencyConverter from './components/CurrencyConverter';

const App = () => {
  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar barStyle="dark-content" />
      <CurrencyConverter />
    </SafeAreaView>
  );
};

export default App;
