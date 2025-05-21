import { Injectable } from "@nestjs/common";
import { Readable } from "stream";
import * as csv from "csv-parser";

type RawTransaction = {
  from: string;
  to: string;
  amount: string;
};

type ParsedTransaction = {
  from: string;
  to: string;
  amount: number;
  suspicious: boolean;
};

type InvalidTransaction = {
  from: string;
  to: string;
  amount: number;
  reason: "NEGATIVE_AMOUNT" | "DUPLICATE";
};

@Injectable()
export class UploadService {
  async processFile(file: Express.Multer.File) {
    const stream = Readable.from(file.buffer);

    const validatedTransactions: ParsedTransaction[] = [];
    const invalidTransactions: InvalidTransaction[] = [];

    const duplicatesSet = new Set<string>();

    const SUSPICIOUS_AMOUNT = 50_000_00;

    await new Promise<void>((resolve, reject) => {
      stream
        .pipe(csv({ separator: ";" }))
        .on("data", (row: RawTransaction) => {
          const amount = Number(row.amount);

          const key = `${row.from}-${row.to}-${amount}`;

          if (amount < 0) {
            invalidTransactions.push({
              from: row.from,
              to: row.to,
              amount,
              reason: "NEGATIVE_AMOUNT",
            });
            return;
          }

          if (duplicatesSet.has(key)) {
            invalidTransactions.push({
              from: row.from,
              to: row.to,
              amount,
              reason: "DUPLICATE",
            });
            return;
          }

          duplicatesSet.add(key);

          validatedTransactions.push({
            from: row.from,
            to: row.to,
            amount,
            suspicious: amount > SUSPICIOUS_AMOUNT,
          });
        })
        .on("error", reject)
        .on("end", resolve);
    });

    return {
      inserted: validatedTransactions.length,
      suspicious: validatedTransactions.filter((t) => t.suspicious).length,
      rejected: invalidTransactions.length,
      rejections: invalidTransactions,
    };
  }
}
