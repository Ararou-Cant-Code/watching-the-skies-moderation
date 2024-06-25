import { Command } from "../../lib/structures/Command.js";
import { DurationFormatter } from "@sapphire/time-utilities";
import type Context from "../../lib/structures/Context.js";
import { EmbedBuilder, version as DJSVersion } from "discord.js";
import { ApplyCommandOptions } from "../../lib/utils/functions.js";

@ApplyCommandOptions<Command.Options>({
  name: "Botstats",
  permissions: {
    commands_channel: true,
  },
  description: "Get current bot stats.",
})
export default class BotstatsCommand extends Command {
  public override run = async (ctx: Context) => {
    const formatter = new DurationFormatter();

    // Node Values
    const memoryUsage = process.memoryUsage();
    const nodeVersion = process.version;

    // Uptime Values
    const nodeUptime = process.uptime();
    const clientUptime = this.context.client.uptime || 1;

    const statsEmbed = new EmbedBuilder()
      .setAuthor({
        name: `${this.context.client.user!.username} Stats`,
        iconURL: this.context.client.user!.displayAvatarURL(),
      })
      .setColor(0xffb6c1)
      .setDescription(
        [
          `**Uptime:**\n> Client: **${formatter.format(clientUptime)}**\n> Node Uptime: **${formatter.format(nodeUptime * 1000)}**`,
          `**Versions:**\n> discord.js: **${DJSVersion}**\n> node.js: **${nodeVersion}**`,
          `**Memory Usage:**\n> Heap Used: **${(memoryUsage.heapUsed / 1024 / 1024).toFixed(0)}mb**\n> RSS: **${(memoryUsage.rss / 1024 / 1024).toFixed(0)}mb**`,
        ].join("\n"),
      )
      .setTimestamp();
    return ctx.reply({ embeds: [statsEmbed] });
  };
}
