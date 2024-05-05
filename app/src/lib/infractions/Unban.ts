import { type Message } from "discord.js";
import { BaseInfraction, type Infraction } from "../classes/BaseInfraction.js";
import { type Client } from "../structures/Client.js";

export class UnbanInfraction extends BaseInfraction {
  public constructor(infraction: Infraction, client: Client) {
    super(infraction, client);

    this.type = "Unban";
  }

  public issue = async (message: Message) => {
    const infraction = await this.saveToDatabase();

    const modLog = await this.getModLog(message, infraction);
    return message
      .guild!.bans.remove(this.memberId)
      .then(() => this.postInChannel(message, infraction))
      .then(() => this.getWebhookClient().send({ embeds: [modLog] }));
  };
}
