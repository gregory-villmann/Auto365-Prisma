import { Router } from 'express';
import { auth } from '../middleware/auth';
import fs from 'fs';
import path from 'path';

export const logsRoute = Router();

logsRoute.get('/', auth, async (req, res) => {
	try {
		const logFilePath = path.join(__dirname, '..', 'logs', 'requests.log');
		const logs = fs.readFileSync(logFilePath, 'utf8');
		const logEntries = logs
			.split('\n')
			.filter(Boolean)
			.map((line) => JSON.parse(line));
		res.send(logEntries);
	} catch (error) {
		console.error(error);
		res.status(500).send('Error retrieving logs');
	}
});
