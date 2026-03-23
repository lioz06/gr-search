import { Router } from "express";
import { routes } from "../graph/routes.controller";

class GraphRoutes {
  router = Router();

  constructor() {
    this.intializeRoutes();
  }

  intializeRoutes() {
    this.router.get("/", routes);
  }
}

export default new GraphRoutes().router;