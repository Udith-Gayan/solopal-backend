import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';


config(); // Load .env

export const typeOrmConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    url: `postgresql://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`,
    autoLoadEntities: true,
    synchronize: true, // Set false in prod
};