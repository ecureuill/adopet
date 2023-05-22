/* eslint-disable indent */
import { BaseEntity, Column, DeleteDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';
import { ITutor } from '../types/schemas';

@Entity('Tutor')
export class Tutor extends BaseEntity implements ITutor {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({type: 'bytea', nullable: true})
	photo: Buffer;

	@Column('text', {nullable: true})
	about: string;

	@OneToOne(() => User, { cascade: true })
	@JoinColumn()
	user: User;

	@Column('uuid')
	userId: string;

	@DeleteDateColumn()
	delete_date: string;

	constructor();
	constructor(tutor: Tutor);
	constructor(tutor?: Tutor){
		super();
		Object.assign(this, tutor);
	}
}