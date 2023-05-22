import createHttpError from 'http-errors';

export interface Variant {
	[key: string]: string | Buffer;
}

export const assignProperties = <TEntity> (body: object, entity: TEntity): TEntity => {
	const newEntity = Object.keys(body).reduce((prev: TEntity, key: string) => {
		const dynamicKey = key as keyof object;
		
		if(typeof body[dynamicKey] === 'object' && !Buffer.isBuffer(entity[dynamicKey])){
			
			if(Array.isArray(body[dynamicKey]))
			{
				loopObject(body[dynamicKey], prev[dynamicKey]);
			}
			else
			{
				prev[dynamicKey] = assignProperties(body[dynamicKey], prev[dynamicKey]);
			}
		}
		else
			prev[dynamicKey] = body[dynamicKey];

		return prev;

	}, entity);
	
	return newEntity;
};

const loopObject = (objArray: Array<object>, entityArray: Array<object>) => {
	
	objArray.forEach(
		obj => {

			if(Array.isArray(obj))
				loopObject(obj, entityArray);

			else if(typeof obj === 'object')
			{
				
				const ID = 'id' as keyof object;
				
				if(obj[ID] !== undefined){

					const index = entityArray.findIndex( 
						(objEnt: object) => {
							return objEnt[ID] === obj[ID];
						}
					);

					if(index !== -1){
						
						entityArray[index] = assignProperties(obj, entityArray[index]);

					}
					else {
						entityArray.push(obj);
					}
				}
				else {
					entityArray.push(obj);
				}
			}
			else {
				throw new createHttpError.NotImplemented('array of not objects');
				//To DO
			}
		});
};

export const clone = (obj: any) => {
	if(obj == null || typeof(obj) != 'object')
		return obj;
	
	if(Array.isArray(obj))
	{
		const temp: any[] = [];
		obj.forEach(item => {
			temp.push(clone(obj));
		});
		return temp;
	}
	else
	{
		const temp = {...obj}; 
		Object.keys(obj).forEach(key => {
			temp[key] = clone(obj[key]);
		});

		return temp;
	}
};