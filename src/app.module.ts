import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/database';
import { HealthController, PrismaService } from './prismaa/prisma.service';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaModule } from './prismaa/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { MessagesModule } from './modules/messages/messages.module';
import { AdminModule } from './modules/admin/admin.module';
import { GroupChatModule } from './modules/group-chat/group-chat.module';
import { ReportsModule } from './modules/reports/reports.module';
import { FriendshipsModule } from './modules/friendships/friendships.module';
import { FeedbackModule } from './modules/feedback/feedback.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(typeOrmConfig),
    TerminusModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    ActivitiesModule,
    MessagesModule,
    AdminModule,
    GroupChatModule,
    ReportsModule,
    FriendshipsModule,
    FeedbackModule
  ],
  controllers: [AppController, HealthController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
