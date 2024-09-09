import { Module } from '@nestjs/common';
import { UserModule } from './core/user/user.module';
import { TaskModule } from './core/task/task.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './core/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './database/datasource';

@Module({
  imports: [
    UserModule,
    TaskModule,
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: dataSourceOptions,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
