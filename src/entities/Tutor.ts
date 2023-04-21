/* eslint-disable indent */
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './User';
import { ITutor } from '../types/schemas';

@Entity('Tutor')
export class Tutor implements ITutor {
	@Column('uuid', {
		generated: 'uuid',
		primary: true,
		select: false
	})
	id: string;

	@Column({type: 'bytea', nullable: true})
	photo: Buffer;

	@Column('text', {nullable: true})
	about: string;

	@OneToOne(() => User, { cascade: true })
	@JoinColumn()
	user: User;
}