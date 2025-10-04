const axios = require('axios');

/**
 * Fetch available currencies from REST Countries API
 * @returns {Promise<Array>} Array of currencies
 */
const getAvailableCurrencies = async () => {
  try {
    const response = await axios.get(process.env.COUNTRIES_API_URL);
    const currencies = new Set();
    
    response.data.forEach(country => {
      if (country.currencies) {
        Object.keys(country.currencies).forEach(code => {
          currencies.add(code);
        });
      }
    });
    
    return Array.from(currencies).sort();
  } catch (error) {
    console.error('Error fetching currencies:', error.message);
    // Return default currencies if API fails
    return ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SEK', 'NZD', 'INR'];
  }
};

/**
 * Convert currency using exchange rate API
 * @param {Number} amount - Amount to convert
 * @param {String} fromCurrency - Source currency
 * @param {String} toCurrency - Target currency
 * @returns {Promise<Object>} Conversion result with amount and rate
 */
const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  try {
    if (fromCurrency === toCurrency) {
      return {
        originalAmount: amount,
        convertedAmount: amount,
        exchangeRate: 1,
        fromCurrency,
        toCurrency
      };
    }

    const response = await axios.get(`${process.env.EXCHANGE_RATE_API_URL}/${fromCurrency}`);
    const exchangeRate = response.data.rates[toCurrency];
    
    if (!exchangeRate) {
      throw new Error(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
    }
    
    const convertedAmount = amount * exchangeRate;
    
    return {
      originalAmount: amount,
      convertedAmount: Math.round(convertedAmount * 100) / 100, // Round to 2 decimal places
      exchangeRate,
      fromCurrency,
      toCurrency,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Currency conversion error:', error.message);
    throw new Error(`Failed to convert ${fromCurrency} to ${toCurrency}: ${error.message}`);
  }
};

/**
 * Get current exchange rate between two currencies
 * @param {String} fromCurrency - Source currency
 * @param {String} toCurrency - Target currency
 * @returns {Promise<Number>} Exchange rate
 */
const getExchangeRate = async (fromCurrency, toCurrency) => {
  try {
    if (fromCurrency === toCurrency) return 1;
    
    const response = await axios.get(`${process.env.EXCHANGE_RATE_API_URL}/${fromCurrency}`);
    return response.data.rates[toCurrency] || 1;
  } catch (error) {
    console.error('Error fetching exchange rate:', error.message);
    return 1; // Default to 1 if API fails
  }
};

module.exports = {
  getAvailableCurrencies,
  convertCurrency,
  getExchangeRate
};