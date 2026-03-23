import _ from 'lodash';
import { logger } from '../logger/logger';

export interface Node {
  name: string;
  kind: string;
  publicExposed?: boolean;
  vulnerabilities?: any[];
}

export interface Edge {
  from: string;
  to: string | string[];
}

export type Route = Node[];


export class GQLRouteEngine {
  private nodes: Map<string, Node>;
  private adjList: Map<string, string[]>;

  constructor(nodes: Node[], edges: Edge[]) {
    this.nodes = new Map(nodes.map(n => [n.name, n]));
    this.adjList = new Map();
    
    edges.forEach(edge => {
      const targets = Array.isArray(edge.to) ? edge.to : [edge.to];
      this.adjList.set(edge.from, targets);
    });
  }

  // Evaluates a single node property: "kind == rds"
  private evalNode(node: Node, condition: string): boolean {
    const [path, op, val] = condition.trim().split(/\s+/);
    const actual = _.get(node, path);
    const expected = val === 'true' ? true : val === 'false' ? false : val;

    switch (op) {
      case '==': return actual === expected;
      case '!=': return actual !== expected;
      case '>':  return Number(actual) > Number(expected);
      case 'exists': return actual !== undefined;
      default: return false;
    }
  }

  // Evaluates a Route (Path) based on GQL scope: "start", "end", or "any"
  private evalRoute(route: Route, query: string): boolean {
    if (query.includes(' AND ')) return query.split(' AND ').every(q => this.evalRoute(route, q));
    if (query.includes(' OR ')) return query.split(' OR ').some(q => this.evalRoute(route, q));

    if (!query.startsWith('start.') && !query.startsWith('end.') && !query.startsWith('any.')) {
      query = `any.${query}`;
    }

    const [scope, ...conditionParts] = query.trim().split('.');
    const condition = conditionParts.join('.');

    switch (scope) {
      case 'start': return this.evalNode(route[0], condition);
      case 'end':   return this.evalNode(route[route.length - 1], condition);
      case 'any':   return route.some(node => this.evalNode(node, condition));
      default:      return false;
    }
  }

  public findFilteredRoutes(gqlQuery: string): Route[] {
    const allPaths: Route[] = [];

    const dfs = (currentName: string, path: Route) => {
      const node = this.nodes.get(currentName);
      if (!node || path.some(p => p.name === node.name)) return; // Prevent cycles

      const newPath = [...path, node];
      allPaths.push(newPath);

      const neighbors = this.adjList.get(currentName) || [];
      neighbors.forEach(neighbor => dfs(neighbor, newPath));
    };

    // Begin traversal from all nodes to ensure we catch all possible routes
    Array.from(this.nodes.keys()).forEach(name => dfs(name, []));

    logger.info(`Total routes found: ${allPaths.length}`);

    const filteredRoutes = allPaths.filter(route => this.evalRoute(route, gqlQuery));
    
    logger.info(`Filtered routes: ${filteredRoutes.length}`);
    return filteredRoutes;
  }

  public findCompleteFilteredRoutes(gqlQuery: string): Route[] {
    const completeRoutes: Route[] = [];

    const dfs = (currentName: string, path: Route) => {
        const node = this.nodes.get(currentName);
        if (!node || path.some(p => p.name === node.name)) return;

        const newPath = [...path, node];
        const neighbors = this.adjList.get(currentName) || [];

        // Check if this is a terminal node (no neighbors)
        if (neighbors.length === 0) {
            // Only add if it matches the GQL criteria
            if (this.evalRoute(newPath, gqlQuery)) {
                completeRoutes.push(newPath);
            }
            return;
        }

        // Otherwise, continue exploring
        neighbors.forEach(neighbor => dfs(neighbor, newPath));
    };

    // Start traversal ONLY from entry points (nodes with no incoming edges) 
    // or public services to ensure we get "top-down" complete routes.
    const entryPoints = this.getEntryPoints();
    entryPoints.forEach(name => dfs(name, []));

    return completeRoutes;
  }

  private getEntryPoints(): string[] {
      const allTargets = new Set(Array.from(this.adjList.values()).flat());
      return Array.from(this.nodes.keys()).filter(name => !allTargets.has(name));
  }  
}

