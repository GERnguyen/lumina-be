import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@Entity({ name: "profiles" })
export class Profile {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "full_name", type: "varchar", length: 150 })
  fullName!: string;

  @Column({ name: "phone_number", type: "varchar", length: 20, nullable: true })
  phoneNumber?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  avatar?: string;

  @Column({ type: "text", nullable: true })
  bio?: string;

  // Owning side with unique foreign key to enforce one-to-one relation.
  @OneToOne(() => User, (user) => user.profile, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;
}
