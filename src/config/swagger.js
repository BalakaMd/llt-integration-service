const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LittleLifeTrip Integration Service API',
      version: '1.0.0',
      description:
        'API for Google Maps, OpenWeatherMap, and Google Calendar integrations',
    },
    servers: [
      {
        url: '/api/v1/integrations',
        description: 'Integration API',
      },
    ],
    tags: [
      { name: 'Maps', description: 'Google Maps integration' },
      { name: 'Weather', description: 'OpenWeatherMap integration' },
      { name: 'Calendar', description: 'Google Calendar integration' },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
