import { Command } from "../../lib/structures/Command.js";
import { DurationFormatter } from "@sapphire/time-utilities";
import type Context from "../../lib/structures/Context.js";
import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { ApplyCommandOptions } from "../../lib/utils/functions.js";

@ApplyCommandOptions<Command.Options>({
  slashCapable: true,
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Get bot latency.")
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
  name: "Ping",
  permissions: {
    commands_channel: true,
  },
  description: "Get bot latency.",
})
export default class PingCommand extends Command {
  public override run = async (ctx: Context) => {
    const msg = await ctx.reply("Pinging...");
    return msg.edit(
      `Pong! \`(Message: ${Math.round(
        (msg.editedTimestamp || msg.createdTimestamp) - (ctx.editedTimestamp || ctx.createdTimestamp),
      )}ms. Websocket: ${this.context.client.ws.ping}ms. Uptime: ${new DurationFormatter().format(
        this.context.client.uptime!,
      )})\``,
    );
  };
}
