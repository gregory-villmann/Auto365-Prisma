import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { comparePasswords } from '../utils/bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { verifySession } from '../utils/verifySession';



const prisma = new PrismaClient();
export const sessionsRoute = Router();

sessionsRoute.post('/', async (req, res) => {
	// TODO: Lisada valideerimised, et email ja parool oleks päringu kehas olemas
	// TODO: Kontrollida, et päringuga saadetud emailiga kasutaja eksisteerib
	// TODO: Võrrelda, kas andmebaasi salvestatud parooliräsi klapib saadetud parooliga, kui see ära räsida (ja saata veateade kui mitte)
	// TODO: Luua andmebaasi uus sessioon sellele kasutajale
	// TODO: Saata päringu vastusena selle uue sessiooni id

	const { email, password } = req.body;

	if (email === "" || password === "") {
		return res.status(500).json({errorMessage: "Email or Password is empty"});
	}

	const isPwValid = await isPasswordValid(email, password);
	if (isPwValid) {
		const userId = await prisma.user.findUnique({
			where: {
				email: email,
			},
			select: {
				id: true
			}
		});

		const uuid = uuidv4();
		if (userId) {
			await prisma.session.create({
				data: {
					id: 'Bearer ' + uuid,
					userId: userId.id
				}
			});
			res.status(200).json({uuid: 'Bearer ' + uuid});
		}
	} else {
		res.status(500).json({errorMessage: "Valideerimine ebaõnnestus"});
	}
	/*
	try {
		const isPwValid = await isPasswordValid(email, password);
		console.log("isPasswordValid? " + isPwValid);
		res.status(200).json({isPWValid: isPwValid});
	} catch (err: Error) {
		console.log(err);
		res.status(500).json({errorMessage: "Valideerimine ebaõnnestus"});
	}*/


})

sessionsRoute.post('/verify', async (req, res) => {
	const {token} = req.body;
	console.log(token)
	const istokenvalid = await verifySession(token);
	res.status(200).json({onValidToken: istokenvalid})
})


async function isPasswordValid(email: string, password: string): Promise<boolean> {
	try {
		const hashedPassword = await prisma.user.findUnique({
			where: {
				email: email
			},
			select: {
				password: true
			}
		});
		if (hashedPassword?.password) {
			return comparePasswords(password, hashedPassword.password);
		} else {
			return false
		}
	} catch (error: any) {
		console.log("Error: Error has occured while verifying password" + error);
		return false;
	}
}