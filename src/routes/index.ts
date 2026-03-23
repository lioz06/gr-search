import { Application } from "express";
import graphroutes from "./graphroutes.routes";

export default class Routes {
  constructor(app: Application) {
    app.use("/api/routes", graphroutes);
  }
}