import bcrypt from 'bcrypt';
const saltRounds = 10;


export const passwordToHash = (password: string) => 
{
	return bcrypt.hashSync(password, saltRounds);
};

export const passwordCompareHash = (password: string, encrypted: string) => {
	return bcrypt.compareSync(password, encrypted);
};