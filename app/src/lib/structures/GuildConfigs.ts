import type { GuildConfigOptions } from "../utils/constants.js";

export const guildConfigs: Map<string, GuildConfigOptions> = new Map();

guildConfigs
  .set(
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
  )
  .set(
    "1076882457044979753", // Watching The Skies Main
    {
      channels: {
        commands: "1076948498299244585",
      },
      roles: {
        allStaff: "NOT_NEEDED",

        staff: {
          tmod: ["1076921778925998190"],
          mod: ["1076885425257459774"],
          hmod: ["1076885306424442890"],
          admin: ["1076885306424442890"],
          owner: ["1076938251815895050", "1076885156100591756"],
        },
      },
    },
  );
