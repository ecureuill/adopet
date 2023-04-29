/* eslint-disable indent */

import { BaseEntity, BeforeSoftRemove, Column, DeleteDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Pet } from './Pet';
import { User } from './User';
import { IShelter } from '../types/schemas';

@Entity('Shelter')
export class Shelter extends BaseEntity implements IShelter{
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@OneToMany(() => Pet, (pet) => pet.shelter, {
		cascade: true
	})
	pets: Pet[];

	@OneToOne(() => User, { cascade: true})
	@JoinColumn()
	user: User;

	@Column('uuid')
	userId: string;

	@Column('boolean', { default: false})
	inactive: boolean;

	@DeleteDateColumn()
	delete_date: string;

	@BeforeSoftRemove()
	updateInactive(){
		this.inactive = true;
	}

	public static async getShelterIdByUser(userId: string){
		const shelter = await Shelter.findOneByOrFail({userId: userId});

		return shelter.id;
	}
}