/* eslint-disable indent */
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';
import { ITutor } from '../types/json-schema-interfaces';

@Entity('Tutor')
export class Tutor implements ITutor {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({type: 'bytea', nullable: true})
	photo: Buffer;

	@Column('text', {nullable: true})
	about: string;

	@OneToOne(() => User, { cascade: true })
	@JoinColumn()
	user: User;
}