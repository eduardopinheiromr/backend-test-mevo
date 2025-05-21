import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { UploadService } from "./upload.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes } from "@nestjs/swagger";
import { Readable } from "stream";
import * as csv from "csv-parser";

@Controller("upload")
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post("csv")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
    const stream = Readable.from(file.buffer);

    let results: any[] = [];

    stream.pipe(csv()).on("data", (data) => results.push(data));

    console.log(results);
  }
}
