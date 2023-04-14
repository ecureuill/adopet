import { NextFunction, Request, Response } from 'express';

export const asyncHandler = (fn: {(request: Request, response: Response, next: NextFunction): Promise<any> }) => (request: Request, response: Response, next: NextFunction) => {
	return Promise
		.resolve(fn(request, response, next))
		.catch(next);
};