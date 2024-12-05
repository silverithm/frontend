const apiUrl = process.env.REACT_APP_API_URL;
const restApiKey = process.env.REACT_APP_REST_API_KEY;
const appKey = process.env.REACT_APP_APP_KEY;
const dispatchUrl = process.env.REACT_APP_DISPATCH_URL;
const payment_client_key = process.env.PAYMENT_CLIENT_KEY;
const payment_secret_key = process.env.PAYMENT_SECRET_KEY;
const payment_customer_key = process.env.PAYMENT_CUSTOMER_KEY;

const config = {
  apiUrl,
  restApiKey,
  appKey,
  dispatchUrl,
  payment_client_key,
  payment_secret_key,
  payment_customer_key,
};

export default config;
