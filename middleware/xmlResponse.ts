import { Response, Request } from 'express';
import xml2js from 'xml2js';

export const xmlResponse = (res: Response, object: any, status: number) => {
	const builder = new xml2js.Builder();
	const xml = builder.buildObject(object);
	res.set('Content-Type', 'application/xml');
	res.status(status).send(xml);
};

export const isXMLHeader = (req: Request) => {
	const acceptHeader = req.headers.accept || '';
	return acceptHeader.includes('application/xml') || acceptHeader.includes('text/xml');
};