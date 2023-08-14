import axios from "axios";
import { AppDataSource } from "../data-source";
import { Product } from "../entities/Product.entity";

import { Request, Response, NextFunction } from "express";
import { ObjectId } from "bson";

export class ProductController {
  private productRepository = AppDataSource.getRepository(Product);

  findAll(request: Request, response: Response, next: NextFunction) {
    return this.productRepository.find();
  }

  async like(request: Request, response: Response, next: NextFunction) {
    const { id } = request.params;

    const product = await this.productRepository.findOneBy({
      id,
    });

    await axios.post(
      `http://localhost:3331/products/${product.adminId}/like`,
      {}
    );

    return this.productRepository.increment({ id }, "likes", 1);
  }
}
