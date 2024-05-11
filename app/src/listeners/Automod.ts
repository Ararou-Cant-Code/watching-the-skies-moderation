import { Events, Message } from "discord.js";
import type { Client } from "../lib/structures/Client.js";
import Listener from "../lib/structures/Listener.js";
import { automodRunFunctions } from "../lib/automod/modules/index.js";

export default abstract class AutomodListener extends Listener {
  public constructor(client: Client) {
    super(client, { name: "Automod", event: Events.MessageCreate });
  }

  public override run = async (message: Message) => {
    if (message.author.bot) return;

    if (message.author.partial) await message.author.fetch();
    if (message.member?.partial) await message.member.fetch();

    return this.client.automod.run(message, automodRunFunctions);
  }
}
