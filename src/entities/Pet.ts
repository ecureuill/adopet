/* eslint-disable indent */
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Shelter } from './Shelter';
import { AgeUnit, PetType, SizeVariety } from '../types/enums';
import { IPet } from '../types/schemas';

@Entity('Pet')
export class Pet extends BaseEntity implements IPet{
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

	@Column({default: false})
	adopted: boolean;

	@Column({type: 'bytea', nullable: true})
	photo: Buffer;

	@CreateDateColumn()
	create_date: string;

	@UpdateDateColumn()
	update_date: string;

	@DeleteDateColumn()
	delete_date: string;

	@ManyToOne(() => Shelter, (shelter) => shelter.pets, {
		onDelete: 'CASCADE',
		orphanedRowAction: 'delete', 
		nullable: false
	})
	shelter: Shelter;

	@Column('uuid')
	shelterId: string;
}
