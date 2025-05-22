import { TransactionValidatorService } from "./transaction-validator.service";

function buffer(csv: string): Buffer {
  return Buffer.from(csv, "utf-8");
}

describe("TransactionValidatorService", () => {
  let service: TransactionValidatorService;

  beforeEach(() => {
    service = new TransactionValidatorService();
  });

  it("valida uma transação correta", async () => {
    const csv = "from;to;amount\n5801917533081;7665183596724;10000";
    const result = await service.parseAndValidate(buffer(csv));

    expect(result.valid).toHaveLength(1);
    expect(result.invalid).toHaveLength(0);
  });

  it("rejeita valor negativo", async () => {
    const csv = "from;to;amount\n5801917533081;7665183596724;-5000";
    const result = await service.parseAndValidate(buffer(csv));

    expect(result.valid).toHaveLength(0);
    expect(result.invalid[0].reason).toBe("NEGATIVE_AMOUNT");
  });

  it("marca duplicata", async () => {
    const csv =
      "from;to;amount\n5801917533081;7665183596724;10000\n5801917533081;7665183596724;10000";
    const result = await service.parseAndValidate(buffer(csv));

    expect(result.valid).toHaveLength(1);
    expect(result.invalid[0].reason).toBe("DUPLICATE");
  });

  it("detecta suspeita corretamente", async () => {
    const csv = "from;to;amount\n5801917533081;7665183596724;5100000";
    const result = await service.parseAndValidate(buffer(csv));

    expect(result.valid[0].suspicious).toBe(true);
  });
});
