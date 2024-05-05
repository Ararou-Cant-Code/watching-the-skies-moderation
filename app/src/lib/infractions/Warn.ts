import { type Message } from "discord.js";
import { BaseInfraction, type Infraction } from "../classes/BaseInfraction.js";
import { type Client } from "../structures/Client.js";

export class WarnInfraction extends BaseInfraction {
  public constructor(infraction: Infraction, client: Client) {
    super(infraction, client);

    this.type = "Warn";
  }

  public issue = async (message: Message) => {
    const infraction = await this.saveToDatabase();

    const modLog = await this.getModLog(message, infraction);
    return this.postInChannel(message, infraction)
      .then(() => this.sendDm(message, infraction))
      .then(() => this.getWebhookClient().send({ embeds: [modLog] }));
  };
}
