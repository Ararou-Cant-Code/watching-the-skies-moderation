import { Client } from "./lib/structures/Client.js";
import { ClientOptions } from "./lib/utils/constants.js";

import "dotenv/config";

export const client = new Client(ClientOptions);

(async () => {
  return client.start(process.env.TOKEN!);
})();
