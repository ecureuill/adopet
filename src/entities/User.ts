/* eslint-disable indent */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IUser } from '../types/schemas';

@Entity('User')
export class User implements IUser {
	@PrimaryGeneratedColumn('uuid')
	id: string;

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
}