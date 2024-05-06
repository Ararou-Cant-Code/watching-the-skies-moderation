import type { GuildConfigOptions } from "../utils/constants.js";

export const guildConfigs: Map<string, GuildConfigOptions> = new Map();

guildConfigs.set(
  "1235442068189347840", // WTS Moderation Testing
  {
    channels: {
      commands: "1235443728349663263",
    },
    roles: {
      allStaff: "1235443027850432572",

      staff: {
        tmod: ["1235443027850432572"],
        mod: ["1235443027850432572"],
        hmod: ["1235443027850432572"],
        admin: ["1235443027850432572"],
        owner: ["1235443027850432572"],
      },
    },
    permissions: {
      staff: {
        roles: [""],
        nodes: ["ping.command"],
      },
    },
  },
);
