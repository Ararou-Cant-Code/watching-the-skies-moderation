import type { Message } from "discord.js";
import type { Client } from "../structures/Client.js";
import type { GuildConfigOptions } from "../utils/constants.js";
import Checks from "./Checks.js";

export class PermissionsManager {
  public checks: Checks;
  public client: Client;

  public constructor(client: Client) {
    this.checks = new Checks();
    this.client = client;
  }

  public messageRun = (message: Message, guildConfig: GuildConfigOptions) => {
    return this.#checkForStaff(message, guildConfig);
  };

  #checkForStaff = (message: Message, guildConfig: GuildConfigOptions) => {
    const roles = guildConfig.roles!.staff;

    return message.member!.roles.cache.hasAny(
      ...roles!.tmod,
      ...roles!.mod,
      ...roles!.hmod,
      ...roles!.admin,
      ...roles!.owner,
    );
  };
}
