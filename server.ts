import express, { Express } from 'express';
import cors from 'cors';
import { carsRoute } from './routes/cars';
import swaggerUi from 'swagger-ui-express';
import bodyParser from "body-parser";
import * as swaggerDocument from './swagger.json';

const server: Express = express();

server.use(cors());
server.use(bodyParser.json());

server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

server.use('/cars', carsRoute);

server.use((err, res) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});


server.listen(3000, () => {
    console.log('Server has started http://localhost:3000');
})