/* eslint-disable indent */
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Shelter } from './Shelters';

export enum PetType {
	DOG = 'dog',
	CAT = 'cat'
}

export enum SizeVariety {
	XXSMALL = 'xxs',
	XSMALL = 'xs',
	SMALL = 's',
	MEDIUM = 'm',
	LARGE = 'l',
	XLARGE = 'xl'
}

export enum AgeUnit {
	DAYS = 'd',
	MONTHS = 'm',
	YEARS = 'y'
}

export enum Gender {
	FEMALE = 'f',
	MALE = 'm'
}

@Entity('Pet')
export class Pet {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	name: string;

	@Column()
	age: number;

	@Column({
		type: 'enum',
		enum: AgeUnit,
		default: AgeUnit.YEARS
	})
	age_unit: AgeUnit;

	@Column({
		type: 'enum',
		enum: SizeVariety,
		default: SizeVariety.MEDIUM
	})
	size_variety: SizeVariety;

	@Column({
		type: 'enum',
		enum: PetType,
		default: PetType.CAT
	})
	type: PetType;

	@Column()
	adopted: boolean;

	@Column({type: 'bytea', nullable: true})
	photo: Buffer;

	@CreateDateColumn()
	create_date: string;

	@UpdateDateColumn()
	update_date: string;

	@ManyToOne(() => Shelter, (shelter) => shelter.pets)
	shelter: Shelter;
}
