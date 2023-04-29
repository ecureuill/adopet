import createHttpError from 'http-errors';

export interface Variant {
	[key: string]: string | Buffer;
}

export const assignProperties = <TEntity> (body: object, entity: TEntity): TEntity => {
	const newEntity = Object.keys(body).reduce((prev: TEntity, key: string) => {
		const dynamicKey = key as keyof object;
		if(typeof body[dynamicKey] === 'object'){
			console.log(`${dynamicKey} is object`);
			
			if(Array.isArray(body[dynamicKey]))
			{
				console.log(`${dynamicKey} also is an array`);
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
			console.log(obj);

			if(Array.isArray(obj))
			{
				loopObject(obj, entityArray);
			}
			else if(typeof obj === 'object')
			{
				console.log('objArray is array of objects');
				
				const ID = 'id' as keyof object;
				
				if(obj[ID] !== undefined){

					console.log('has id property');
					console.log(obj[ID]);
					console.log(entityArray);
					const index = entityArray.findIndex( 
						(objEnt: object) => {
							console.debug(objEnt);
							return objEnt[ID] === obj[ID];
						}
					);

					if(index !== -1){
						console.log('find related property on entity');
						console.log(entityArray[index]);
						
						entityArray[index] = assignProperties(obj, entityArray[index]);
						console.log(entityArray[index]);

					}
					else {
						console.debug('Cant find id in original entity, will be treated as new object');
						entityArray.push(obj);
					}
				}
				else {
					console.debug('No id, will be treated as new object');
					entityArray.push(obj);
				}
			}
			else {
				throw new createHttpError.NotImplemented('array of not objects');
				//To DO
			}
		});

};