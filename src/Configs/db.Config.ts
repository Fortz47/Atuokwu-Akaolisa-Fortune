const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');

const env = dotenv.config();
dotenvExpand.expand(env);

const config = {
  development: {
    url: process.env.DEV_DB_URL
  },
  test: {
    url: process.env.TEST_DB_URL
  },
  production: {
    url: process.env.PROD_DB_URL
  },
};

const mode = process.env.NODE_ENV || 'development';

// @ts-ignore
export default config[mode] 