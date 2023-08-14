import * as express from "express";
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import { AppDataSource } from "./data-source";
import { Routes } from "./routes";
import { Product } from "./entities/Product.entity";
import { initRoutes } from "./routesSetup";
import * as dotenv from "dotenv";
import * as amqp from "amqplib/callback_api";
import { RABBITMQ_CHANNEL } from "./constants";

dotenv.config();

const app = express();
app.use(bodyParser.json());

initRoutes(app);

// Connect to Database first
AppDataSource.initialize()
  .then(async () => {
    // connect to RabbitMQ second
    amqp.connect(process.env.RABBITMQ_URL, (err0, connection) => {
      if (err0) throw err0;

      connection.createChannel((err1, channel) => {
        if (err1) throw err1;

        console.log("Connected to RabbitMQ Admin-microservice");

        app.set(RABBITMQ_CHANNEL, channel);

        // Start application last
        app.listen(3331, () =>
          console.log("Express server has started on port 3331.")
        );

        process.on("beforeExit", () => {
          console.log("Disconnect from RabbitMQ!");

          // disconnect to RabbitMQ
          connection.close();
        });
      });
    });
  })
  .catch((error) => console.log(error));
