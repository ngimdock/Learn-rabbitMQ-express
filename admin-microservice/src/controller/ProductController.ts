import { PRODUCT_EVENTS, RABBITMQ_CHANNEL } from "../constants";
import { AppDataSource } from "../data-source";
import { Product } from "../entities/Product.entity";
import { NextFunction, Request, Response } from "express";

export class ProductController {
  private productRepository = AppDataSource.getRepository(Product);

  async create(req: Request, res: Response, next: NextFunction) {
    const rabbitMqChannel = req.app.get(RABBITMQ_CHANNEL);

    const data = req.body;


    const product = Object.assign(new Product(), { ...data });

    const productCreated = await this.productRepository.save(product);

    

    rabbitMqChannel.sendToQueue(
      PRODUCT_EVENTS.PRODUCT_CREATED,
      Buffer.from(JSON.stringify(productCreated))
    );

    return productCreated;
  }

  findAll(req: Request, res: Response, next: NextFunction) {
    return this.productRepository.find();
  }

  async findOne(req: Request, res: Response, next: NextFunction) {
    const id = parseInt(req.params.id);

    const product = await this.productRepository.findOneBy({ id });

    if (!product) throw Error("Product not found.");

    return product;
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    const rabbitMqChannel = req.app.get(RABBITMQ_CHANNEL);

    const id = parseInt(req.params.id);

    let productToRemove = await this.productRepository.findOneBy({ id });

    if (!productToRemove) {
      return "Product not found.";
    }

    rabbitMqChannel.sendToQueue(PRODUCT_EVENTS.PRODUCT_DELETED, Buffer.from(JSON.stringify(id)))

    return this.productRepository.remove(productToRemove);
  }

  like(req: Request, res: Response, next: NextFunction) {
    const id = parseInt(req.params.id);

    console.log({ adminId: id })

    console.log("Product liked in admin app.");

    return this.productRepository.increment({ id }, "likes", 1);
  }
}
