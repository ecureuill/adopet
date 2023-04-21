/* eslint-disable indent */
import { Column, Entity } from 'typeorm';
import { Role } from '../types/enums';
import { IUser } from '../types/schemas';

@Entity('User')
export class User implements IUser {
	@Column('uuid', {
		generated: 'uuid',
		primary: true,
		select: false
	})
	id: string;

	@Column({
		type: 'enum',
		enum: Role,
		select: false
	})
	role: Role;

	@Column({unique: true})
	email: string;

	@Column({select: false})
	password: string;

	@Column()
	name: string;

	@Column({nullable: true})
	phone: string;

	@Column({nullable: true})
	city: string;

	@Column({nullable: true})
	state: string;
}