import { Injectable } from "@nestjs/common";
import { Readable } from "stream";
import * as csv from "csv-parser";

type RawTransaction = {
  from: string;
  to: string;
  amount: string;
};

export type ValidatedTransaction = {
  from: string;
  to: string;
  amount: number;
  suspicious?: boolean;
};

export type InvalidTransaction = ValidatedTransaction & {
  reason: "NEGATIVE_AMOUNT" | "DUPLICATE";
};

@Injectable()
export class TransactionValidatorService {
  private readonly SUSPICIOUS_AMOUNT = 50_000_00;

  async parseAndValidate(buffer: Buffer) {
    const stream = Readable.from(buffer);

    const valid: ValidatedTransaction[] = [];
    const invalid: InvalidTransaction[] = [];

    const duplicates = new Set<string>();

    await new Promise<void>((resolve, reject) => {
      stream
        .pipe(csv({ separator: ";" }))
        .on("data", (row: RawTransaction) => {
          const amount = Number(row.amount);
          const suspicious = amount > this.SUSPICIOUS_AMOUNT;
          const { from, to } = row;
          const key = `${from}-${to}-${amount}`;

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
              reason: "DUPLICATE",
              suspicious,
            });
            return;
          }

          duplicates.add(key);
          valid.push({ from, to, amount, suspicious });
        })
        .on("error", reject)
        .on("end", resolve);
    });

    return { valid, invalid };
  }
}
