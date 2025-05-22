import { Test, TestingModule } from "@nestjs/testing";
import { UploadService } from "./upload.service";
import { TransactionValidatorService } from "./transaction-validator.service";
import { PrismaService } from "../prisma.service";

describe("UploadService", () => {
  let service: UploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        {
          provide: TransactionValidatorService,
          useValue: {
            parseAndValidate: jest.fn().mockResolvedValue({
              valid: [],
              invalid: [],
            }),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            transaction: {
              createMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  const csv = "from;to;amount\n5801917533081;7665183596724;10000";
  it("should process a file and return summary", async () => {
    const mockFile = {
      buffer: Buffer.from(csv),
      originalname: "test.csv",
    } as Express.Multer.File;

    const result = await service.processFile(mockFile);

    expect(result).toEqual({
      inserted: 0,
      suspicious: 0,
      rejected: 0,
      rejections: [],
    });
  });
});
