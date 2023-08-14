import { ProductController } from "./controller/ProductController";

export const Routes = [
  {
    method: "get",
    route: "/products",
    controller: ProductController,
    action: "findAll",
  },
  {
    method: "post",
    route: "/products/:id/like",
    controller: ProductController,
    action: "like",
  },
];
