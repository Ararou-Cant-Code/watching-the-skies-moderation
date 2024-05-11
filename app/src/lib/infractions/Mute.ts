import { GuildMember, type Message } from "discord.js";
import { BaseInfraction, type Infraction } from "../classes/BaseInfraction.js";
import { type Client } from "../structures/Client.js";
import { Duration } from "@sapphire/time-utilities";
import type { GuildConfigOptions } from "../utils/constants.js";

export class MuteInfraction extends BaseInfraction {
  public constructor(infraction: Infraction, client: Client) {
    super(infraction, client);

    this.type = "Mute";
  }

  public issue = async (message: Message) => {
    const member = await message.guild!.members.fetch(this.memberId);
    const check = await this.#runChecks(message, member);
    if (check) return;

    const infraction = await this.saveToDatabase();

    const modLog = await this.getModLog(message, infraction);
    return member
      .timeout(new Duration(this.expiresAtString!).offset)
      .then(() => this.postInChannel(message, infraction))
      .then(() => this.sendDm(message, infraction))
      .then(() => this.getWebhookClient().send({ embeds: [modLog] }));
  };

  #runChecks = (message: Message, member: GuildMember) => {
    const guildConfig = (this.client.stores.get("guilds")!.get(message.guild!.id)! as { config: GuildConfigOptions })
      .config;

    if (this.checks.isStaff(member, guildConfig)) return message.reply("You cannot mute a staff member, you meanie.");
    if (member.user.bot) return message.reply("You cannot mute a bot.");
    if (this.reason.length >= 300) return message.reply("You cannot provide a reason that long.");
  };
}
