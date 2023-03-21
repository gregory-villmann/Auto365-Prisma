import { Router } from 'express';
//import { PrismaClient } from '@prisma/client';

//const prisma = new PrismaClient();
export const carsRoute = Router();

carsRoute.get('/', async (req, res) => {
	res.status(200).json({test: 'test'});
})
