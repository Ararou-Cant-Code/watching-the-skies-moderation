import { type Message } from "discord.js";
import { BaseInfraction, type Infraction } from "../classes/BaseInfraction.js";
import { type Client } from "../structures/Client.js";
import type Args from "../structures/Args.js";

export class WarnInfraction extends BaseInfraction {
  public constructor(infraction: Infraction, client: Client) {
    super(infraction, client);

    this.type = "Warn";
  }

  public issue = async (message: Message, args: Args) => {
    const infraction = await this.saveToDatabase();

    const modLog = await this.getModLog(message, infraction);
    return this.postInChannel(message, infraction)
      .then(() => (args.getFlags("silent", "s") ? null : this.sendDm(message, infraction)))
      .then(() => this.getWebhookClient().send({ embeds: [modLog] }));
  };
}
