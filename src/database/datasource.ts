import { DataSource, DataSourceOptions } from 'typeorm';
import { Task } from './entities/task.entity';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();

const configService = new ConfigService();

export const dataSourceOptions = (
  configService: ConfigService,
): DataSourceOptions => {
  return {
    name: 'postgres',
    type: 'postgres',
    url: configService.get('DATABASE_URL'),
    entities: [User, Task],
    synchronize: true,
  };
};

const dataSource = new DataSource(dataSourceOptions(configService));
export default dataSource;
