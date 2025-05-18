import express from 'express';
import morgan from 'morgan';
import rateLimiter from './middlewares/rateLimiter';
import requestLogger from './middlewares/requestLogger';
import errorHandler from './middlewares/errorHandler';
import marketplaceRoutes from './routes/marketplace.route';
import healthRoute from './routes/health.route';
import notFound from './middlewares/notFound';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const swaggerDoc = YAML.load('./public/docs/swagger.yaml');
const app = express();

app.use(express.json());
app.use(rateLimiter);
app.use(morgan('dev'));
app.use(requestLogger);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/health', healthRoute);
app.use(notFound);  
app.use(errorHandler);

export default app;
