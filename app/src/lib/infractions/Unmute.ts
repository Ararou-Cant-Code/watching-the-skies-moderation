import { type Message } from "discord.js";
import { BaseInfraction, type Infraction } from "../classes/BaseInfraction.js";
import { type Client } from "../structures/Client.js";

export class UnmuteInfraction extends BaseInfraction {
  public constructor(infraction: Infraction, client: Client) {
    super(infraction, client);

    this.type = "Unmute";
  }

  public issue = async (message: Message) => {
    const member = await message.guild!.members.fetch(this.memberId);

    const infraction = await this.saveToDatabase();

    const modLog = await this.getModLog(message, infraction);
    return member
      .timeout(null)
      .then(() => this.postInChannel(message, infraction))
      .then(() => this.sendDm(message, infraction))
      .then(() => this.getWebhookClient().send({ embeds: [modLog] }));
  };
}
