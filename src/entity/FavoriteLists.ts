/* eslint-disable indent */
import { Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Pet } from './Pets';
import { Tutor } from './Tutors';

@Entity('FavoriteList')
export class FavoriteList {
	@ManyToOne(() => Tutor, (tutor) => tutor.id)
	tutor: Tutor;

	@ManyToOne(() => Pet, (pet) => pet.id)
	pet: Pet;

	@PrimaryColumn()
	tutorId: string;

	@PrimaryColumn()
	petId: string;

}