import express, { Express } from 'express';
import cors from 'cors';
import { carsRoute } from './routes/cars';
import swaggerUi from 'swagger-ui-express';
import bodyParser from 'body-parser';
import * as swaggerDocument from './swagger.json';
import { registrationRoute } from './routes/registration';
import { sessionsRoute } from './routes/sessions';
import { logsRoute } from './routes/logs';
import https from 'https';
import fs from 'fs';

const server: Express = express();

const options = {
    key: fs.readFileSync('./certs/server.key'),
    cert: fs.readFileSync('./certs/server.crt')
};

server.use(cors());
server.use(bodyParser.json());

server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
server.use('/logs', logsRoute);
server.use('/cars', carsRoute);
server.use('/register', registrationRoute);
server.use('/sessions', sessionsRoute);

server.use((err, res) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

const httpsServer = https.createServer(options, server);

httpsServer.listen(3000, () => {
    console.log('Server has started https://localhost:3000');
});