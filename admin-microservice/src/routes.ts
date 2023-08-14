import { ProductController } from "./controller/ProductController";

export const Routes = [
  {
    method: "post",
    route: "/products",
    controller: ProductController,
    action: "create",
  },
  {
    method: "get",
    route: "/products",
    controller: ProductController,
    action: "findAll",
  },
  {
    method: "get",
    route: "/products/:id",
    controller: ProductController,
    action: "findOne",
  },
  {
    method: "delete",
    route: "/products/:id",
    controller: ProductController,
    action: "delete",
  },
  {
    method: "post",
    route: "/products/:id/like",
    controller: ProductController,
    action: "like",
  },
];
