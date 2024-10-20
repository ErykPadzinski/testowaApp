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
  const [currencyNames, setCurrencyNames] = useState<{[key: string]: string}>(
    {},
  );

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
        (
          acc: Record<string, number>,
          rate: {code: string; mid: number; currency: string},
        ) => {
          acc[rate.code] = rate.mid;
          return acc;
        },
        {},
      );
      rates['PLN'] = 1;
      setExchangeRates(rates);

      const names = data[0].rates.reduce(
        (
          acc: Record<string, string>,
          rate: {code: string; currency: string},
        ) => {
          acc[rate.code] = rate.currency;
          return acc;
        },
        {},
      );
      names['PLN'] = 'Polski złoty';
      setCurrencyNames(names);
    } catch (error) {
      console.error('Błąd podczas pobierania kursów walut:', error);
    }
  };

  const updateExchangeRate = () => {
    if (fromCurrency && toCurrency) {
      const fromRate = exchangeRates[fromCurrency];
      const toRate = exchangeRates[toCurrency];
      let rate;
      if (fromCurrency === 'PLN') {
        rate = 1 / toRate;
      } else if (toCurrency === 'PLN') {
        rate = fromRate;
      } else {
        rate = fromRate / toRate;
      }
      setExchangeRate(`1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`);
    }
  };

  const convertCurrency = () => {
    if (amount && fromCurrency && toCurrency) {
      const fromRate = exchangeRates[fromCurrency];
      const toRate = exchangeRates[toCurrency];
      let convertedAmount;
      if (fromCurrency === 'PLN') {
        convertedAmount = parseFloat(amount.replace(',', '.')) / toRate;
      } else if (toCurrency === 'PLN') {
        convertedAmount = parseFloat(amount.replace(',', '.')) * fromRate;
      } else {
        convertedAmount =
          (parseFloat(amount.replace(',', '.')) * fromRate) / toRate;
      }
      setResult(convertedAmount.toFixed(2).replace('.', ','));
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
              uri: `https://raw.githubusercontent.com/transferwise/currency-flags/master/src/flags/${fromCurrency.toLowerCase()}.png`,
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
              uri: `https://raw.githubusercontent.com/transferwise/currency-flags/master/src/flags/${toCurrency.toLowerCase()}.png`,
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setShowFromCurrencyList(false)}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
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
                <View style={styles.currencyItemContent}>
                  <Text style={styles.currencyCode}>{currency}</Text>
                  <Text style={styles.currencyName}>
                    {currencyNames[currency] || currency}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      {showToCurrencyList && (
        <View style={styles.currencyListContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setShowToCurrencyList(false)}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
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
                <Text style={styles.currencyCode}>{currency}</Text>
                <Text style={styles.currencyName}>
                  {currencyNames[currency] || currency}
                </Text>
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
      backgroundColor: theme === 'dark' ? '#333' : '#fff',
      borderRadius: 15,
      overflow: 'hidden',
    },
    input: {
      flex: 1,
      fontSize: 24,
      color: theme === 'dark' ? '#fff' : '#888',
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
      backgroundColor: theme === 'dark' ? '#1c1c1e' : '#fff',
      justifyContent: 'center',
      alignItems: 'center',
    },
    currencyList: {
      flex: 1,
      padding: 20,
    },
    currencyItem: {
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme === 'dark' ? '#444' : '#e0e0e0',
      marginHorizontal: -20,
    },
    currencyItemText: {
      fontSize: 18,
      color: theme === 'dark' ? '#fff' : '#000',
    },
    currencyCode: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#000',
    },
    currencyName: {
      fontSize: 14,
      color: theme === 'dark' ? '#aaa' : '#888',
      marginTop: 5,
    },
    exchangeRateContainer: {
      marginBottom: 15,
      backgroundColor: theme === 'dark' ? '#333' : '#e0e0e0',
      borderRadius: 15,
      overflow: 'hidden',
    },
    exchangeRateInput: {
      fontSize: 16,
      color: theme === 'dark' ? '#fff' : '#000',
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
    backButton: {
      position: 'absolute',
      top: 20,
      left: 20,
      zIndex: 1,
    },
    backButtonText: {
      fontSize: 30,
      color: theme === 'dark' ? '#fff' : '#000',
    },
    currencyItemContent: {
      flexDirection: 'column',
      paddingHorizontal: 20,
    },
  });

export default CurrencyConverter;
