import { Controller } from "@nestjs/common";
import { ChatService } from "./chat.service"

@Controller('Chats')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

}