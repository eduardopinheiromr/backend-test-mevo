import { Injectable } from "@nestjs/common";
import { Readable } from "stream";
import * as csv from "csv-parser";
import { PrismaService } from "src/prisma.service";
import { TransactionStatus } from "generated/prisma";

type RawTransaction = {
  from: string;
  to: string;
  amount: string;
};

type ParsedTransaction = {
  from: string;
  to: string;
  amount: number;
  suspicious?: boolean;
};

type InvalidTransaction = ParsedTransaction & {
  reason: "NEGATIVE_AMOUNT" | "DUPLICATE";
};

@Injectable()
export class UploadService {
  constructor(private readonly prisma: PrismaService) {}

  async processFile(file: Express.Multer.File) {
    const stream = Readable.from(file.buffer);

    const validated: ParsedTransaction[] = [];
    const invalid: InvalidTransaction[] = [];

    const duplicates = new Set<string>();

    const SUSPICIOUS_AMOUNT = 50_000_00;

    await new Promise<void>((resolve, reject) => {
      stream
        .pipe(csv({ separator: ";" }))
        .on("data", (row: RawTransaction) => {
          const amount = Number(row.amount);
          const suspicious = amount > SUSPICIOUS_AMOUNT;
          const { from, to } = row;

          const key = `${row.from}-${row.to}-${amount}`;

          if (amount < 0) {
            invalid.push({
              from,
              to,
              amount,
              reason: "NEGATIVE_AMOUNT",
            });
            return;
          }

          if (duplicates.has(key)) {
            invalid.push({
              from,
              to,
              amount,
              suspicious,
              reason: "DUPLICATE",
            });
            return;
          }

          duplicates.add(key);

          validated.push({
            from,
            to,
            amount,
            suspicious,
          });
        })
        .on("error", reject)
        .on("end", resolve);
    });

    const fileName = file.originalname;

    await this.prisma.transaction.createMany({
      data: validated.map((t) => ({
        ...t,
        status: TransactionStatus.VALID,
        suspicious: t.suspicious || false,
        fileName,
        reason: null,
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
      inserted: validated.length,
      suspicious: validated.filter((t) => t.suspicious).length,
      rejected: invalid.length,
      rejections: invalid,
    };
  }
}
