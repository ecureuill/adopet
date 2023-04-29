/* eslint-disable indent */
import { BaseEntity, Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../types/enums';
import { IUser } from '../types/schemas';

@Entity('User')
export class User extends BaseEntity implements IUser {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({
		type: 'enum',
		enum: Role,
	})
	role: Role;

	@Column({unique: true})
	email: string;

	@Column()
	password: string;

	@Column()
	name: string;

	@Column({nullable: true})
	phone: string;

	@Column({nullable: true})
	city: string;

	@Column({nullable: true})
	state: string;

	@DeleteDateColumn()
	delete_date: string;

	constructor();
	constructor(user: IUser);
	constructor(user?: IUser){
		super();
		Object.assign(this, user);
	}
}