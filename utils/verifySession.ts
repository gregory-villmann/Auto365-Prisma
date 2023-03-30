import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function verifySession(token: string): Promise<boolean> {
	const doesSessionExist = await prisma.session.findUnique({
		where: {
			id: token
		}
	});
	console.log(doesSessionExist);
	return !!doesSessionExist;
}