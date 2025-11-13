export * from "./users.schema";
export * from "./accounts.schema";

import { users } from "./users.schema";
import { accounts } from "./accounts.schema";

export const schema = {
    users,
    accounts,
};