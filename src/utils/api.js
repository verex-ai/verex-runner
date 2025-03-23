const axios = require("axios");

/**
 * Make an API request to the Verex API
 *
 * @param {Object} options - Request options
 * @param {string} options.method - HTTP method
 * @param {string} options.url - Request URL
 * @param {Object} [options.data] - Request body data
 * @param {string} options.apiKey - Verex API key
 * @returns {Promise<Object>} API response data
 */
async function makeApiRequest({ method, url, data, apiKey }) {
  try {
    const headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };

    const response = await axios({
      method,
      url,
      data,
      headers,
    });

    return response.data;
  } catch (error) {
    // Format error message
    const errorMessage = error.response?.data || error.message;
    const enhancedError = new Error(`API request failed: ${errorMessage}`);
    enhancedError.originalError = error;
    enhancedError.status = error.response?.status;
    enhancedError.data = error.response?.data;

    throw enhancedError;
  }
}

module.exports = {
  makeApiRequest,
};
