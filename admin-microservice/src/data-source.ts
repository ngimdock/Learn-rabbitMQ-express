import "reflect-metadata";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "microservice_admin",
  password: "microservice_admin",
  database: "microservice_admin",
  synchronize: true,
  logging: false,
  entities: ["src/entities/**/*.entity{.ts,.js}"],
  migrations: [],
  subscribers: [],
});
