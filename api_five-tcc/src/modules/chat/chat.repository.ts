import { Inject, Injectable } from "@nestjs/common";
import { DRIZZLE } from "src/db/database/database.constants";
import type { DrizzleDB } from "src/db/types/drizzleDB";

@Injectable()
export class ChatRepository {
    constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) { }

}