
import { Request, Response } from "express";
import { Edge, GQLRouteEngine, Node } from "./engine";
import data from '../../train-ticket-be.json';


const engine = new GQLRouteEngine(data.nodes as Node[], data.edges as Edge[]);

export function routes(req: Request, res: Response) {
const gql = req.query.gql as string;

  if (!gql) {
    return res.status(400).json({ error: "GQL query required. Example: start.publicExposed == true" });
  }

  try {
    const routes = engine.findCompleteFilteredRoutes(gql);
    res.json({
      count: routes.length,
      routes: routes
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to process GQL query" });
  }
}
