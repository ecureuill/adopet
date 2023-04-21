/* eslint-disable indent */
import { Column, CreateDateColumn, Entity, ManyToOne, UpdateDateColumn } from 'typeorm';
import { Shelter } from './Shelter';
import { AgeUnit, PetType, SizeVariety } from '../types/enums';
import { IPet } from '../types/schemas';

@Entity('Pet')
export class Pet implements IPet{
	@Column('uuid', {
		generated: 'uuid',
		primary: true,
		select: false
	})
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

	@Column({default: false})
	adopted: boolean;

	@Column({type: 'bytea', nullable: true})
	photo: Buffer;

	@CreateDateColumn()
	create_date: string;

	@UpdateDateColumn()
	update_date: string;

	@ManyToOne(() => Shelter, (shelter) => shelter.pets, {
		onDelete: 'CASCADE',
		orphanedRowAction: 'delete', 
		nullable: false
	})
	shelter: Shelter;

	@Column({type: 'uuid'})
	shelterId: string;
}
