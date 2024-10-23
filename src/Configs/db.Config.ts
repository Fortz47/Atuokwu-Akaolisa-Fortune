const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');

const env = dotenv.config();
dotenvExpand.expand(env);

const dbConfig = {
  url: process.env.DB_URL || 'mongodb://127.0.0.1:27017/API_DB'
};

export default dbConfig 