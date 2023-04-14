/* eslint-disable indent */
import { Column, Entity } from 'typeorm';
import { User } from './User';

@Entity('Tutor')
export class Tutor  extends User {
	@Column({type: 'bytea', nullable: true})
	photo: Buffer;

	@Column('text', {nullable: true})
	about: string;
}