import { comparePasswords } from './bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export async function isPasswordValid(email: string, password: string): Promise<boolean> {
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
			return false;
		}
	} catch (error: any) {
		console.log('Error: Error has occured while verifying password' + error);
		return false;
	}
}