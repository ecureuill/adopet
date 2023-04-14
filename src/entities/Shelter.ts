/* eslint-disable indent */

import { Entity, OneToMany } from 'typeorm';
import { Pet } from './Pet';
import { User } from './User';

@Entity('Shelter')
export class Shelter extends User {
	@OneToMany(() => Pet, (pet) => pet.shelter, {
		cascade: ['remove']
	})
	pets: Pet[];
}