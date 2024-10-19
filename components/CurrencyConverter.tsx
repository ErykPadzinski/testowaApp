import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {useTheme} from './ThemeContext';

interface ExchangeRates {
  [key: string]: number;
}

const CurrencyConverter = () => {
  const [amount, setAmount] = useState('0,00');
  const [fromCurrency, setFromCurrency] = useState('PLN');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [result, setResult] = useState('0,00');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [exchangeRate, setExchangeRate] = useState('');
  const [showFromCurrencyList, setShowFromCurrencyList] = useState(false);
  const [showToCurrencyList, setShowToCurrencyList] = useState(false);

  const {theme, toggleTheme} = useTheme();

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  useEffect(() => {
    updateExchangeRate();
  }, [fromCurrency, toCurrency, exchangeRates]);

  useEffect(() => {
    convertCurrency();
  }, [amount, fromCurrency, toCurrency, exchangeRates]);

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

  const updateExchangeRate = () => {
    if (fromCurrency && toCurrency) {
      const fromRate = exchangeRates[fromCurrency];
      const toRate = exchangeRates[toCurrency];
      const rate = toRate / fromRate;
      setExchangeRate(`1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`);
    }
  };

  const convertCurrency = () => {
    if (amount && fromCurrency && toCurrency) {
      const fromRate = exchangeRates[fromCurrency];
      const toRate = exchangeRates[toCurrency];
      const convertedAmount = (parseFloat(amount) / fromRate) * toRate;
      setResult(convertedAmount.toFixed(2));
    } else {
      setResult('');
    }
  };
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Konwerter walut</Text>

      <View style={styles.exchangeRateContainer}>
        <TextInput
          style={styles.exchangeRateInput}
          editable={false}
          value={`Kurs wymiany\n${exchangeRate}`}
          multiline={true}
        />
      </View>
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.currencyButton}
          onPress={() => setShowFromCurrencyList(true)}>
          <Image
            source={{
              uri: `https://flagcdn.com/w20/${fromCurrency.toLowerCase()}.png`,
            }}
            style={styles.flagIcon}
          />
          <Text style={styles.currencyButtonText}>{fromCurrency}</Text>
          <Text style={styles.arrowIcon}>▼</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="0,00"
          placeholderTextColor="#888"
          value={amount}
          onChangeText={setAmount}
        />
      </View>
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.currencyButton}
          onPress={() => setShowToCurrencyList(true)}>
          <Image
            source={{
              uri: `https://flagcdn.com/w20/${toCurrency.toLowerCase()}.png`,
            }}
            style={styles.flagIcon}
          />
          <Text style={styles.currencyButtonText}>{toCurrency}</Text>
          <Text style={styles.arrowIcon}>▼</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          editable={false}
          value={result ? result : '0,00'}
        />
      </View>
      <Switch
        value={theme === 'dark'}
        onValueChange={toggleTheme}
        style={styles.switch}
      />
      {showFromCurrencyList && (
        <View style={styles.currencyListContainer}>
          <ScrollView style={styles.currencyList}>
            {Object.keys(exchangeRates).map(currency => (
              <TouchableOpacity
                key={currency}
                style={styles.currencyItem}
                onPress={() => {
                  setFromCurrency(currency);
                  setShowFromCurrencyList(false);
                  updateExchangeRate();
                }}>
                <Text style={styles.currencyItemText}>{currency}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      {showToCurrencyList && (
        <View style={styles.currencyListContainer}>
          <ScrollView style={styles.currencyList}>
            {Object.keys(exchangeRates).map(currency => (
              <TouchableOpacity
                key={currency}
                style={styles.currencyItem}
                onPress={() => {
                  setToCurrency(currency);
                  setShowToCurrencyList(false);
                  updateExchangeRate();
                }}>
                <Text style={styles.currencyItemText}>{currency}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const getStyles = (theme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme === 'dark' ? '#000' : '#f4f4f4',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
      color: theme === 'dark' ? '#fff' : '#000',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
      backgroundColor: '#fff',
      borderRadius: 15,
      overflow: 'hidden',
    },
    input: {
      flex: 1,
      fontSize: 24,
      color: '#888',
      textAlign: 'right',
      paddingVertical: 15,
      paddingHorizontal: 20,
    },
    currencyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 15,
      paddingHorizontal: 20,
    },
    currencyButtonText: {
      fontSize: 18,
      color: theme === 'dark' ? '#fff' : '#000',
      marginRight: 5,
    },
    arrowIcon: {
      fontSize: 12,
      color: '#666',
    },
    exchangeRate: {
      fontSize: 16,
      marginBottom: 15,
      textAlign: 'center',
      color: theme === 'dark' ? '#888' : '#666',
    },
    switch: {
      alignSelf: 'flex-end',
      marginTop: 20,
    },
    currencyListContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    currencyList: {
      backgroundColor: theme === 'dark' ? '#1c1c1e' : '#fff',
      borderRadius: 12,
      padding: 10,
      maxHeight: '80%',
      width: '80%',
    },
    currencyItem: {
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme === 'dark' ? '#2c2c2e' : '#e0e0e0',
    },
    currencyItemText: {
      fontSize: 18,
      color: theme === 'dark' ? '#fff' : '#000',
    },
    exchangeRateContainer: {
      marginBottom: 15,
      backgroundColor: '#e0e0e0',
      borderRadius: 15,
      overflow: 'hidden',
    },
    exchangeRateInput: {
      fontSize: 16,
      color: '#000',
      textAlign: 'left',
      paddingVertical: 15,
      paddingHorizontal: 20,
    },
    exchangeRateLabel: {
      fontSize: 14,
      color: '#888',
      marginBottom: 5,
    },
    exchangeRateValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#000',
    },
    flagIcon: {
      width: 20,
      height: 20,
      marginRight: 10,
    },
  });

export default CurrencyConverter;
