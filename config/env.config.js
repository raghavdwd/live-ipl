/**
 * Environment Configuration
 * Parses and exports environment variables
 */
require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
};
