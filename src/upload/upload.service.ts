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

type InvalidTransaction = Omit<ParsedTransaction, "suspicious"> & {
  reason: "NEGATIVE_AMOUNT" | "DUPLICATE";
};

@Injectable()
export class UploadService {
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

          const key = `${row.from}-${row.to}-${amount}`;

          // 1. **Valores Negativos**: Operações com valores negativos são consideradas inválidas.
          if (amount < 0) {
            invalid.push({
              from: row.from,
              to: row.to,
              amount,
              reason: "NEGATIVE_AMOUNT",
            });
            return;
          }

          // 2. **Operações Duplicadas**: Uma operação é duplicada se existir outra operação no arquivo com os mesmos valores de `to`, `from`, e `amount`. Tais operações são consideradas inválidas.
          if (duplicates.has(key)) {
            invalid.push({
              from: row.from,
              to: row.to,
              amount,
              reason: "DUPLICATE",
            });
            return;
          }

          duplicates.add(key);

          validated.push({
            from: row.from,
            to: row.to,
            amount,
            // 3. **Valores Suspeitos**: Operações com valores acima de R$50.000,00 são marcadas como suspeitas, mas ainda válidas para inclusão no banco de dados.
            suspicious: amount > SUSPICIOUS_AMOUNT,
          });
        })
        .on("error", reject)
        .on("end", resolve);
    });

    return {
      inserted: validated.length,
      suspicious: validated.filter((t) => t.suspicious).length,
      rejected: invalid.length,
      rejections: invalid,
    };
  }
}
