import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/bcrypt';
import { verifyEmail } from '../utils/verifyEmail';
import { isXMLHeader, xmlResponse } from '../middleware/xmlResponse';


const prisma = new PrismaClient();
export const registrationRoute = Router();

registrationRoute.post('/', async (req,res) => {
	const { email, firstName, lastName, password } = req.body;

	if(password.length < 5) {
		return res.status(409).json({errorMessage: 'Password should be minimum 5 characters'});
	}

	if(!(await isEmailValid(email))) {
		return res.status(409).json({errorMessage: 'Email not valid'});
	}

	if(!(await isEmailInUse(email))) {
		return res.status(409).json({errorMessage: 'Email is already in use'})
	}

	try {
		const user = await prisma.user.create({
			data: {
				email,
				firstName,
				lastName,
				password: await hashPassword(password),
			}
		});

		const responseObject = {response: 'User has been registered successfully', email: user.email};

		if (isXMLHeader(req)) {
			xmlResponse(res, responseObject, 200);
		} else {
			res.status(200).json(responseObject);
		}

	} catch (error) {
		res.status(500).json({ errorMessage: 'An error has occurred, user has not been registered', error: error });
	}
})

async function isEmailValid(email: string) {
	try {
		const result = await verifyEmail(email);
		return result.success;
	} catch (error: any) {
		console.log("Error: " + error);
		return false;
	}
}

async function isEmailInUse(email: string) {
	try {
		// Check if user already exists
		const userExists = await prisma.user.findUnique({
			where: {
				email: email
			},
		});
		return !userExists;
	} catch (err: any) {
		console.log("Error: " + err)
		return false
	}
}