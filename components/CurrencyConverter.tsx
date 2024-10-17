import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, Button, StyleSheet, Switch} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {useTheme} from './ThemeContext';

interface ExchangeRates {
  [key: string]: number;
}

const CurrencyConverter = () => {
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('PLN');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [result, setResult] = useState('');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});

  const {theme, toggleTheme} = useTheme();

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  const fetchExchangeRates = async () => {
    try {
      const response = await fetch(
        'https://api.nbp.pl/api/exchangerates/tables/A/?format=json',
      );
      const data = await response.json();
      const rates = data[0].rates.reduce(
        (acc: Record<string, number>, rate: {code: string; mid: number}) => {
          acc[rate.code] = rate.mid;
          return acc;
        },
        {},
      );
      rates['PLN'] = 1;
      setExchangeRates(rates);
    } catch (error) {
      console.error('Błąd podczas pobierania kursów walut:', error);
    }
  };

  const convertCurrency = () => {
    if (amount && fromCurrency && toCurrency) {
      const fromRate = exchangeRates[fromCurrency];
      const toRate = exchangeRates[toCurrency];
      const convertedAmount = (parseFloat(amount) / fromRate) * toRate;
      setResult(
        `${amount} ${fromCurrency} = ${convertedAmount.toFixed(
          2,
        )} ${toCurrency}`,
      );
    }
  };

  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Konwerter walut</Text>
      <Switch
        value={theme === 'dark'}
        onValueChange={toggleTheme}
        style={styles.switch}
      />
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Wpisz kwotę"
        placeholderTextColor={theme === 'dark' ? '#888' : '#444'}
        value={amount}
        onChangeText={setAmount}
      />
      <View style={styles.pickerContainer}>
        <Picker
          style={styles.picker}
          selectedValue={fromCurrency}
          onValueChange={itemValue => setFromCurrency(itemValue)}>
          {Object.keys(exchangeRates).map(currency => (
            <Picker.Item
              key={currency}
              label={currency}
              value={currency}
              color={theme === 'dark' ? '#fff' : '#000'}
            />
          ))}
        </Picker>
        <Picker
          style={styles.picker}
          selectedValue={toCurrency}
          onValueChange={itemValue => setToCurrency(itemValue)}>
          {Object.keys(exchangeRates).map(currency => (
            <Picker.Item
              key={currency}
              label={currency}
              value={currency}
              color={theme === 'dark' ? '#fff' : '#000'}
            />
          ))}
        </Picker>
      </View>
      <Button title="Przelicz" onPress={convertCurrency} />
      <Text style={styles.result}>{result}</Text>
    </View>
  );
};

const getStyles = (theme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      justifyContent: 'center',
      backgroundColor: theme === 'dark' ? '#222' : '#fff',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
      color: theme === 'dark' ? '#fff' : '#000',
    },
    input: {
      borderWidth: 1,
      borderColor: theme === 'dark' ? '#444' : '#ccc',
      padding: 10,
      marginBottom: 10,
      color: theme === 'dark' ? '#fff' : '#000',
    },
    pickerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    picker: {
      flex: 1,
      color: theme === 'dark' ? '#fff' : '#000',
    },
    result: {
      marginTop: 20,
      fontSize: 18,
      textAlign: 'center',
      color: theme === 'dark' ? '#fff' : '#000',
    },
    switch: {
      alignSelf: 'flex-end',
      marginBottom: 10,
    },
  });

export default CurrencyConverter;
