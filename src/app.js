require('dotenv').config();

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { sequelize } = require('./models');
const { connectRedis } = require('./utils/redisClient');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

app.use('/integrations/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/v1/integrations', routes);

app.get('/integrations/health', (req, res) => {
  res.json({ status: 'ok', service: 'integration-service' });
});

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    await sequelize.sync();
    console.log('Database synced');

    await connectRedis();
    console.log('Redis connected');

    app.listen(PORT, () => {
      console.log(`Integration Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

start();
