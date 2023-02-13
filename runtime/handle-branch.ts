import { Handle } from './handle';
import { Branch, ComparisonType, OperatorType } from './types';

const comparisons: Record<ComparisonType, (a: boolean[]) => boolean> = {
  [ComparisonType.All]: (a: boolean[]) => a.every(Boolean),
  [ComparisonType.Any]: (a: boolean[]) => a.some(Boolean),
};

const operations: Record<OperatorType, (a: any, b: any) => boolean> = {
  [OperatorType.Eq]: (a, b) => a === b,
  [OperatorType.Gt]: (a, b) => a > b,
  [OperatorType.Gte]: (a, b) => a >= b,
  [OperatorType.Lt]: (a, b) => a < b,
  [OperatorType.Lte]: (a, b) => a <= b,
  [OperatorType.Neq]: (a, b) => a !== b,
  [OperatorType.Includes]: (a, b) => Boolean(a?.includes?.(b)),
  [OperatorType.StartsWith]: (a, b) => Boolean(a?.startsWith?.(b)),
  [OperatorType.EndsWith]: (a, b) => Boolean(a?.endsWith?.(b)),
};

export const handleBranch: Handle<Branch> = (schema, sessions, io, next) => {
  return (chat, node) => {
    const session = sessions[chat.contact.id];
    const branch = node.branches.find((branch) =>
      comparisons[branch.type](
        branch.conditions.map((condition) =>
          operations[condition.operator](
            session.variables[condition.variable1],
            session.variables[condition.variable2],
          ),
        ),
      ),
    );

    if (branch) {
      sessions[chat.contact.id].node = schema.nodes[<any>branch.next];
    } else {
      sessions[chat.contact.id].node = schema.nodes[<any>node.default];
    }

    next();
  };
};
