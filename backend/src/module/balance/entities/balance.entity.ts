import { IsISO8601 } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EnergySubtype, EnergyType } from './energy.enums';
import {
  energyTypeTransformer,
  energySubtypeTransformer,
} from '../transformers/energy.transformers';

@Entity()
export class Balance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'type',
    type: 'enum',
    enum: EnergyType,
    nullable: false,
    transformer: energyTypeTransformer,
  })
  type: EnergyType;

  @Column({
    name: 'sub_type',
    type: 'enum',
    enum: EnergySubtype,
    nullable: false,
    transformer: energySubtypeTransformer,
  })
  subtype: EnergySubtype;

  @Column({
    name: 'value',
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  value: number;

  @Column({
    name: 'percentage',
    type: 'decimal',
    precision: 10,
    scale: 3,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  percentage: number;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'date', type: 'date' })
  date: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
