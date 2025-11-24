export * from "./users.schema";
export * from "./accounts.schema";
export * from "./categories.schema";
export * from "./transactions.schema";

import { users } from "./users.schema";
import { accounts } from "./accounts.schema";
import { categories } from "./categories.schema";
import { transactions } from "./transactions.schema";

export const schema = {
    users,
    accounts,
    categories,
    transactions,
};