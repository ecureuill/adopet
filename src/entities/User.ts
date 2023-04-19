/* eslint-disable indent */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('User')
export class User {
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