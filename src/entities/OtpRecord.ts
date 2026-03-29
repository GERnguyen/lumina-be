import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

export enum OtpPurpose {
  REGISTER = "REGISTER",
  FORGOT_PASSWORD = "FORGOT_PASSWORD",
  UPDATE_PROFILE = "UPDATE_PROFILE",
}

@Entity({ name: "otp_records" })
export class OtpRecord {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 120 })
  email!: string;

  @ManyToOne(() => User, (user) => user.otpRecords, {
    nullable: true,
    onDelete: "SET NULL",
  })
  user?: User;

  @Column({ type: "varchar", length: 6 })
  otp!: string;

  @Column({ type: "varchar", length: 30 })
  purpose!: OtpPurpose;

  @Column({ name: "expires_at", type: "datetime" })
  expiresAt!: Date;

  @Column({ name: "is_used", type: "boolean", default: false })
  isUsed!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
