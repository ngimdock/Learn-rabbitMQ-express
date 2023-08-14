import * as express from "express";
import * as bodyParser from "body-parser";
import { AppDataSource } from "./data-source";
import { initRoutes } from "./routesSetup";
import * as dotenv from "dotenv";
import * as amqp from "amqplib/callback_api";
import { PRODUCT_EVENTS } from "./constants";
import { Product } from "./entities/Product.entity";

dotenv.config();

const app = express();
app.use(bodyParser.json());

initRoutes(app);

// Connect to Database first
AppDataSource.initialize()
  .then(async () => {
    const productRepository = AppDataSource.getRepository(Product);

    // connect to RabbitMQ second
    amqp.connect(process.env.RABBITMQ_URL, (err0, connection) => {
      if (err0) throw err0;

      connection.createChannel((err1, channel) => {
        if (err1) throw err1;

        console.log("Connected to RabbitMQ main-microservice");

        channel.assertQueue(PRODUCT_EVENTS.PRODUCT_CREATED, { durable: false });
        channel.assertQueue(PRODUCT_EVENTS.PRODUCT_DELETED, { durable: false });

        channel.consume(
          PRODUCT_EVENTS.PRODUCT_CREATED,
          async (msg) => {
            const eventProduct = JSON.parse(msg.content.toString());

            const product = new Product();
            product.adminId = eventProduct.id;
            product.title = eventProduct.title;
            product.image = eventProduct.image;
            product.likes = eventProduct.likes;

            await productRepository.save(product);

            console.log("Product created in main app.");
          },
          { noAck: true }
        );

        channel.consume(
          PRODUCT_EVENTS.PRODUCT_DELETED,
          async (msg) => {
            const productId = parseInt(msg.content.toString());

            const productToRemove = await productRepository.findOneBy({
              adminId: productId,
            });

            await productRepository.remove(productToRemove);

            console.log("Product deleted in main app.");
          },
          { noAck: true }
        );

        // Start application last
        app.listen(3332, () =>
          console.log("Express server has started on port 3332.")
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
