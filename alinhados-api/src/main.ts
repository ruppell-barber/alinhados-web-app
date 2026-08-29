import 'reflect-metadata';
import './shared/container';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { generateOpenApiDocument } from '@alinhados/contracts';
import '@alinhados/contracts';
import { httpLogger } from './shared/infra/http/middlewares/httpLogger';
import { globalErrorHandler } from './shared/infra/http/middlewares/globalErrorHandler';
import { perfilRoutes } from './modules/perfil/adapters/api-web/router/perfil.routes';
import { identidadeRouter } from './modules/identidade/adapters/api-web/router/identidade.routes';
import { discoveryRouter } from './modules/discovery/adapters/api-web/router/discovery.routes';
import { container } from './shared/container';
import { IEnvService } from './shared/infra/services/env';


const app = express();
const openApiDocument = generateOpenApiDocument();
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));


app.use(httpLogger);
app.use(express.json());
app.use('/perfil', perfilRoutes);
app.use('/identidade', identidadeRouter);
app.use('/discovery', discoveryRouter);

app.use(globalErrorHandler);


const envService = container.resolve<IEnvService>('IEnvService');
const port = envService.get('PORT');

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});
