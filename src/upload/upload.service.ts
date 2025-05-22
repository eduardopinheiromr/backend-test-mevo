import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { TransactionStatus } from "../../generated/prisma";
import { TransactionValidatorService } from "./transaction-validator.service";

@Injectable()
export class UploadService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly validator: TransactionValidatorService,
  ) {}

  async processFile(file: Express.Multer.File) {
    const { valid, invalid } = await this.validator.parseAndValidate(
      file.buffer,
    );
    const fileName = file.originalname;

    await this.prisma.transaction.createMany({
      data: valid.map((t) => ({
        ...t,
        status: TransactionStatus.VALID,
        suspicious: t.suspicious || false,
        reason: null,
        fileName,
      })),
    });

    await this.prisma.transaction.createMany({
      data: invalid.map((t) => ({
        ...t,
        status: TransactionStatus.INVALID,
        fileName,
      })),
    });

    return {
      inserted: valid.length,
      suspicious: valid.filter((t) => t.suspicious).length,
      rejected: invalid.length,
      rejections: invalid,
    };
  }
}
