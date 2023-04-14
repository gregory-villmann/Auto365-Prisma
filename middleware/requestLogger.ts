import { NextFunction, Request, Response } from 'express';
import winston from 'winston';
import { format } from 'date-fns-tz';


const logger = winston.createLogger({
	format: winston.format.combine(
		winston.format.timestamp({format: getTimestamp}),
		winston.format.json()
	),
	transports: [
		new winston.transports.File({filename: './logs/requests.log'}),
	],
});

function getTimestamp() {
	return format(new Date(), 'dd.MM.yyyy HH:mm:ss.SSS OOOO', {
		timeZone: 'Europe/Tallinn',
	});
}

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
	const {method, originalUrl, query, body, header} = req;

	logger.info(JSON.stringify({
		method,
		originalUrl,
		query,
		body,
		header,
	}));

	next();
};
