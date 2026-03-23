import _ from 'lodash';

type Predicate = (node: any) => boolean;

export class QueryParser {
  // Evaluates a single condition: "path op value"
  private static evalCondition(node: any, condition: string): boolean {
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

  // Parses complex strings with AND/OR
  public static parse(query: string): Predicate {
    return (node: any) => {
      if (query.includes(' AND ')) {
        return query.split(' AND ').every(q => this.parse(q)(node));
      }
      if (query.includes(' OR ')) {
        return query.split(' OR ').some(q => this.parse(q)(node));
      }
      return this.evalCondition(node, query);
    };
  }
}