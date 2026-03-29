import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { OtpPurpose, OtpRecord } from "../entities/OtpRecord";

export class OtpRepository {
  private readonly repository: Repository<OtpRecord>;

  constructor() {
    this.repository = AppDataSource.getRepository(OtpRecord);
  }

  async createOtp(
    email: string,
    otp: string,
    purpose: OtpPurpose,
  ): Promise<OtpRecord> {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const record = this.repository.create({
      email,
      otp,
      purpose,
      expiresAt,
      isUsed: false,
    });

    return this.repository.save(record);
  }

  async findValidOtp(
    email: string,
    otp: string,
    purpose: OtpPurpose,
  ): Promise<OtpRecord | null> {
    return this.repository
      .createQueryBuilder("otp")
      .where("otp.email = :email", { email })
      .andWhere("otp.otp = :otp", { otp })
      .andWhere("otp.purpose = :purpose", { purpose })
      .andWhere("otp.is_used = :isUsed", { isUsed: false })
      .andWhere("otp.expires_at >= :now", { now: new Date() })
      .orderBy("otp.id", "DESC")
      .getOne();
  }

  async markAsUsed(id: number): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(OtpRecord)
      .set({ isUsed: true })
      .where("id = :id", { id })
      .execute();
  }
}

export const otpRepository = new OtpRepository();
