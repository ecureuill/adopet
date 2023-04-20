import { JwtPayload } from 'jsonwebtoken';

export interface UserJwtPayload extends JwtPayload {
	id: string,
}