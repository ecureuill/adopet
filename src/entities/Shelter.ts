/* eslint-disable indent */

import { Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Pet } from './Pet';
import { User } from './User';
import { IShelter } from '../types/schemas';

@Entity('Shelter')
export class Shelter implements IShelter{
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@OneToMany(() => Pet, (pet) => pet.shelter, {
		cascade: ['remove']
	})
	pets: Pet[];

	@OneToOne(() => User)
	@JoinColumn()
	user: User;
}