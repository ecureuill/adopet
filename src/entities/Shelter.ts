/* eslint-disable indent */

import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { Pet } from './Pet';
import { User } from './User';
import { IShelter } from '../types/schemas';

@Entity('Shelter')
export class Shelter implements IShelter{
	@Column('uuid', {
		generated: 'uuid',
		primary: true,
		select: false
	})
	id: string;

	@OneToMany(() => Pet, (pet) => pet.shelter, {
		cascade: ['remove']
	})
	pets: Pet[];

	@OneToOne(() => User, { cascade: true})
	@JoinColumn()
	user: User;
}