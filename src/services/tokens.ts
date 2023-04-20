import jwt from 'jsonwebtoken';
import { jwtSecret, jwtSignOptions, jwtVerifyOptions } from '../config';
import { UserJwtPayload } from '../types/interfaces';

export const verifyJwtToken = (token: string) => {
	return jwt.verify(token.replace('Bearer ', ''), jwtSecret, jwtVerifyOptions) as jwt.JwtPayload as UserJwtPayload;
};

export const createJwtToken = (payload: UserJwtPayload) => {
	return jwt.sign({ 
		...payload
	}, jwtSecret, jwtSignOptions);
};