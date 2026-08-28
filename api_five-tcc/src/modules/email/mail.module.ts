import { Module } from '@nestjs/common';
import { MailService } from './mail.sevice';

@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}