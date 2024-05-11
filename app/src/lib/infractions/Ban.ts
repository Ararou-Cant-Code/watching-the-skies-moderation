import { GuildMember, type Message } from "discord.js";
import { BaseInfraction, type Infraction } from "../classes/BaseInfraction.js";
import { type Client } from "../structures/Client.js";
import type { GuildConfigOptions } from "../utils/constants.js";

export class BanInfraction extends BaseInfraction {
  public constructor(infraction: Infraction, client: Client) {
    super(infraction, client);

    this.type = "Ban";
  }

  public issue = async (message: Message) => {
    let check;

    const isBanned = await message.guild!.bans.fetch(this.memberId).catch(() => null);
    if (isBanned) return message.reply("That member is already banned.");

    const guildMember = await message.guild!.members.fetch(this.memberId).catch(() => null);
    if (guildMember) check = await this.#runChecks(message, guildMember);
    else check = await this.#runOfflineChecks(message);

    if (check) return;

    const infraction = await this.saveToDatabase();

    const modLog = await this.getModLog(message, infraction);
    return this.sendDm(message, infraction)
      .then(() => this.postInChannel(message, infraction))
      .then(() =>
        message.guild!.members.ban(this.memberId, {
          reason: `Banned by ${message.author.username} for "${this.reason}".`,
        }),
      )
      .then(() => this.getWebhookClient().send({ embeds: [modLog] }));
  };

  #runChecks = (message: Message, member: GuildMember) => {
    const guildConfig = (this.client.stores.get("guilds")!.get(message.guild!.id)! as { config: GuildConfigOptions })
      .config;

    if (this.checks.isStaff(member, guildConfig)) return message.reply("You cannot ban a staff member, you meanie.");
    if (member.user.bot) throw "You cannot ban a bot.";
    if (this.reason.length >= 300) return message.reply("You cannot provide a reason that long.");
  };

  #runOfflineChecks = async (message: Message) => {
    const user = await this.client.users.fetch(this.memberId);

    if (user.bot) return message.reply("You cannot ban a bot.");
    if (this.reason.length >= 300) return message.reply("You cannot provide a reason that long.");
  };
}
