import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '../middleware/auth';
import { isPasswordValid } from '../utils/verifyPassword';
import { requestLogger } from '../middleware/requestLogger';
import { isXMLHeader, xmlResponse } from '../middleware/xmlResponse';

const prisma = new PrismaClient();
export const sessionsRoute = Router();

sessionsRoute.post('/', requestLogger, async (req, res) => {

	const {email, password} = req.body;

	if (email === '' || password === '') {
		return res.status(500).json({errorMessage: 'Email or Password is empty'});
	}

	const isPwValid = await isPasswordValid(email, password);
	if (isPwValid) {
		const user = await prisma.user.findUnique({
			where: {
				email: email,
			},
			select: {
				id: true,
				firstName: true
			}
		});

		const uuid = uuidv4();
		if (user) {
			await prisma.session.create({
				data: {
					id: 'Bearer ' + uuid,
					userId: user.id
				}
			});

			let responseObject = {firstName: user.firstName, uuid: 'Bearer ' + uuid};

			if (isXMLHeader(req)) {
				xmlResponse(res, responseObject, 200);
			} else {
				res.status(200).json(responseObject);
			}
		}
	} else {
		res.status(500).json({errorMessage: 'Valideerimine ebaõnnestus'});
	}
})

sessionsRoute.delete('', auth, requestLogger, async (req, res) => {
	const token = req.header('Authorization');
	try {
		await prisma.session.delete({
			where: {
				id: token
			}
		});
		res.status(204);
	} catch (error) {
		res.status(404).json({error});
	}
})
