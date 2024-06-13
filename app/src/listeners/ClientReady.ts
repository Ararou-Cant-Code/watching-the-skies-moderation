import { ActivityType, Collection, Events, Guild, OAuth2Guild, REST, Routes } from "discord.js";
import { Client } from "../lib/structures/Client.js";
import Listener from "../lib/structures/Listener.js";
import type { GuildConfigOptions } from "../lib/utils/constants.js";
import type { Command } from "../lib/structures/Command.js";
import { guildConfigs } from "../lib/structures/GuildConfigs.js";

const guildCollectionData: Collection<string, { guild: Guild | OAuth2Guild; config?: GuildConfigOptions }> =
  new Collection();

export default abstract class ClientReadyListener extends Listener {
  public constructor(client: Client) {
    super(client, {
      name: "ClientReady",
      event: Events.ClientReady,
    });
  }

  public override run = async () => {
    await this.handleSlashCommands();

    this.client.logger.info(`Signed in as ${this.client.user!.tag} (${this.client.user!.id})`);

    this.client.user!.setPresence({
      status: "idle",
      activities: [
        {
          type: ActivityType.Watching,
          name: "the skies!",
        },
      ],
    });

    // Handle Stores
    for (const guild of (await this.client.guilds.fetch()).values()) {
      try {
        guildCollectionData.set(guild.id, {
          guild,
          config: guildConfigs.get(guild.id),
        });
      } catch (err) {
        continue;
      }
    }

    this.client.stores.set("guilds", guildCollectionData);
  };

  private handleSlashCommands = async () => {
    const rest = new REST().setToken(process.env.TOKEN!);
    const commands = (this.client.stores.get("slash-commands")! as Collection<string, Command>)
      .map((c: Command) => c)
      .filter((c: Command) => c.options.slashCapable || false)
      .map((c: Command) => c.options.data)
      .filter((c) => c)
      .map((c) => c!.toJSON());

    const data = (await rest.put(Routes.applicationCommands(this.client.application!.id), {
      body: commands,
    })) as unknown[];
    return this.client.logger.info(`[/] Reloaded ${data.length} slash commands.`);
  };
}
