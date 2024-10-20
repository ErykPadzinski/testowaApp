import React from 'react';
import {SafeAreaView, StatusBar} from 'react-native';
import CurrencyConverter from './components/CurrencyConverter';
import {ThemeProvider} from './components/ThemeContext';

const App = () => {
  return (
    <ThemeProvider>
      <SafeAreaView style={{flex: 1}}>
        <StatusBar barStyle="dark-content" />
        <CurrencyConverter />
      </SafeAreaView>
    </ThemeProvider>
  );
};

export default App;
