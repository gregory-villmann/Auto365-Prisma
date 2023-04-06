import { NextFunction, Request, Response } from 'express';
import { verifySession } from '../utils/verifySession';

export const auth = async (req: Request, res: Response, next: NextFunction) => {
	const token = req.header('Authorization');

	if (!token) {
		res.status(400).json({errorMessage: 'Missing auth header'});
		return;
	}

	try {
		if (await verifySession(token)) {
			next();
		} else {
			res.status(401).json({errorMessage: 'Session not found'});
			return;
		}
	} catch (err) {
		res.status(401).json({errorMessage: 'error' + err});
		return;
	}
};