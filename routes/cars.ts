import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const carsRoute = Router();

// GET /cars - get all cars with pagination
carsRoute.get('/', async (req, res) => {
	try {
		const { pageIndex, pageSize } = req.query;
		const skip = pageIndex >= 0 ? pageIndex * pageSize : 0;
		const carsLength = await prisma.cars.count();
		const cars = await prisma.cars.findMany({
			select: {
				id: true,
				make: true,
				model: true,
				year: true,
				price: true,
				image: true
			},
			skip,
			take: parseInt(pageSize),
		});
		res.status(200).json({cars:cars, size: carsLength});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// GET /cars/:id - get a specific car by ID
carsRoute.get('/:id', async (req, res) => {
	const { id } = req.params;

	try {
		const car = await prisma.cars.findUnique({
			where: {
				id: parseInt(id),
			},
		});

		if (!car) {
			res.status(404).json({ error: 'Car not found' });
		} else {
			res.json(car);
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// POST /cars/new - create a new car
carsRoute.post('/new', async (req, res) => {
	const { make, model, year, mileage, price, image } = req.body;

	try {
		const car = await prisma.cars.create({
			data: {
				make,
				model,
				year: parseInt(year),
				mileage: parseInt(mileage),
				price: parseInt(price),
				image,
			},
		});

		res.status(201).json(car);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// PUT /cars/:id - edit a existing car
carsRoute.put('/:id', async (req, res) => {
	const id = parseInt(req.params.id)
	const { make, model, year, mileage, price, image } = req.body;

	try {
		const car = await prisma.cars.update({
			where: {id},
			data: {
				make,
				model,
				year: parseInt(year),
				mileage: parseInt(mileage),
				price: parseInt(price),
				image,
			},
		});

		res.status(200).json(car)
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal server error' });
	}
});
