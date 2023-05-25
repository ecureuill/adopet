/* eslint-disable indent */
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Pet } from './Pet';
import { Tutor } from './Tutor';

@Entity('Adoption')
export class Adoption extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@OneToOne(() => Pet, { cascade: ['update']})
	@JoinColumn()
	pet: Pet;

	@Column()
	petId: string;

	@OneToOne(() => Tutor)
	@JoinColumn()
	tutor: Tutor;

	@Column()
	tutorId: string;

	@Column({type: 'uuid'})
	shelterId: string;


	@DeleteDateColumn()
	delete_date?: string | null;

	@CreateDateColumn()
	create_date?: string | null;

	constructor(o?: Partial<Adoption>){
		super();

		if(o !== undefined){
			this.pet = o.pet!;
			this.tutor = o.tutor!;
			this.petId = o.petId!;
			this.tutorId = o.tutorId!;
			this.shelterId = o.shelterId!;
		}
	}

}