import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { auth } from '../middleware/auth';
import { requestLogger } from '../middleware/requestLogger';
import { isXMLHeader, xmlResponse } from '../middleware/xmlResponse';
import { io } from '../websocketServer';
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

		if (isXMLHeader(req)) {
			const xmlCars = {
				cars: {
					car: cars
				},
				size: carsLength
			};
			xmlResponse(res, xmlCars, 200);
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
			if (isXMLHeader(req)) {
				xmlResponse(res, car, 200);
			} else {
				res.status(200).json(car);
			}
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// POST /cars - create a new car
carsRoute.post('', auth, requestLogger, async (req, res) => {
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

		if (isXMLHeader(req)) {
			xmlResponse(res, car, 201);
		} else {
			res.status(201).json(car);
		}

		const allCars = await prisma.car.findMany();
		// emitting all cars to listeners
		io.emit('carCreated', allCars);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// PUT /cars/:id - edit a existing car
carsRoute.put('/:id', auth, requestLogger, async (req, res) => {
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

		if (isXMLHeader(req)) {
			xmlResponse(res, car, 201);
		} else {
			res.status(201).json(car);
		}

		// emitting to all listeners of specific car listeners
		io.emit('carUpdated', {id: car.id, car: car});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// DELETE /cars/:id - Delete a car with the given ID
carsRoute.delete('/:id', auth, requestLogger, async (req, res) => {
	const id = parseInt(req.params.id);
	try {
		const deletedCar = await prisma.car.delete({
			where: {id},
		});
		if (isXMLHeader(req)) {
			xmlResponse(res, deletedCar, 200);
		} else {
			res.status(200).json(deletedCar);
		}
		io.emit('carDeleted', {id: deletedCar.id, car: deletedCar});
	} catch (error) {
		console.error(error);
		res.status(500).json({error: 'Internal server error'});
	}
});
