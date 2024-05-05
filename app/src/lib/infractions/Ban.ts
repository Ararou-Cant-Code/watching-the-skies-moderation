import { type Message } from "discord.js";
import { BaseInfraction, type Infraction } from "../classes/BaseInfraction.js";
import { type Client } from "../structures/Client.js";

export class BanInfraction extends BaseInfraction {
  public constructor(infraction: Infraction, client: Client) {
    super(infraction, client);

    this.type = "Ban";
  }

  public issue = async (message: Message) => {
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
}
