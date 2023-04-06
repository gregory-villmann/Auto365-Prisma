import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { auth } from '../middleware/auth';
import xml2js from 'xml2js';

const prisma = new PrismaClient();
export const carsRoute = Router();

// GET /cars - get all cars with pagination
carsRoute.get('/', async (req, res) => {
	try {
		let {pageIndex, pageSize} = req.query;
		const skip = Number(pageIndex) >= 0 ? Number(pageIndex) * Number(pageSize) : 0;
		const carsLength = await prisma.car.count();
		const cars = await prisma.car.findMany({
			select: {
				id: true,
				make: true,
				model: true,
				year: true,
				price: true,
				image: true
			},
			skip,
			take: Number(pageSize),
		});
		const acceptHeader = req.headers.accept || '';
		if (acceptHeader.includes('application/xml') || acceptHeader.includes('text/xml')) {
			const xmlCars = {
				cars: {
					car: cars
				},
				size: carsLength
			};
			const builder = new xml2js.Builder();
			const xml = builder.buildObject(xmlCars);
			res.set('Content-Type', 'application/xml');
			res.send(xml);
		} else {
			res.status(200).json({cars: cars, size: carsLength});
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// GET /cars/:id - get a specific car by ID
carsRoute.get('/:id', async (req, res) => {
	const { id } = req.params;

	try {
		const car = await prisma.car.findUnique({
			where: {
				id: parseInt(id),
			},
		});

		if (!car) {
			res.status(404).json({ error: 'Car not found' });
		} else {
			const acceptHeader = req.headers.accept || '';
			if (acceptHeader.includes('application/xml') || acceptHeader.includes('text/xml')) {
				const builder = new xml2js.Builder();
				const xml = builder.buildObject(car);
				res.set('Content-Type', 'application/xml');
				res.send(xml);
			} else {
				res.json(car);
			}
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// POST /cars/new - create a new car
carsRoute.post('/new', auth, async (req, res) => {
	const {make, model, year, mileage, price, image} = req.body;

	try {
		const car = await prisma.car.create({
			data: {
				make,
				model,
				year: parseInt(year),
				mileage: parseInt(mileage),
				price: parseInt(price),
				image,
				userId: 1
			},
		});

		res.status(201).json(car);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// PUT /cars/:id - edit a existing car
carsRoute.put('/:id', auth, async (req, res) => {
	const id = parseInt(req.params.id);
	const {make, model, year, mileage, price, image} = req.body;

	try {
		const car = await prisma.car.update({
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

// DELETE /cars/:id - Delete a car with the given ID
carsRoute.delete('/:id', auth, async (req, res) => {
	const id = parseInt(req.params.id);
	try {
		const deletedCar = await prisma.car.delete({
			where: {id},
		});

		res.status(200).json(deletedCar);
	} catch (error) {
		console.error(error);
		res.status(500).json({error: 'Internal server error'});
	}
});
