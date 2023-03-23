const verifier = require('@gradeup/email-verify');

export async function verifyEmail(email: string): Promise<any> {
	return new Promise((resolve, reject) => {
		verifier.verify(email, (err: any, info: any) => {
			if (err) {
				reject(JSON.stringify(info));
			} else {
				resolve(info);
			}
		});
	});
}