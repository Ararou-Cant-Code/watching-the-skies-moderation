import { Command } from "../../lib/structures/Command.js";
import type Args from "../../lib/structures/Args.js";
import type Context from "../../lib/structures/Context.js";
import { ApplyCommandOptions } from "../../lib/utils/functions.js";
import { WebhookClient } from "discord.js";

@ApplyCommandOptions<Command.Options>({
  name: "Rmpunish",
  permissions: {
    hmod: true,
  },
  detailedDescription: {
    usage: "<infractionId>"
  },
  description: "Removes a punishment.",
})
export default class RmpunishCommand extends Command {
  public override run = async (ctx: Context, args: Args) => {
    const id = await args.getNumberIndex(0).catch(() => null);
    if (!id) return ctx.reply("That is not an ID.");

    const infraction = await this.context.client.db.infractions.findFirst({
      where: {
        guildId: ctx.message.guild!.id,
        id,
      },
    });
    if (!infraction) return ctx.reply("That is not a valid infraction.");

    const webhookClient = new WebhookClient({ url: process.env.MODERATION_LOG_WEBHOOK! });

    await this.context.client.db.infractions.delete({
      where: {
        guildId: ctx.message.guild!.id,
        id,
      },
    });
    return ctx.message.channel
      .send(
        `**${infraction.type}** \`(#${infraction.id})\` issued to <@${infraction.memberId}> issued by <@${infraction.moderatorId}> has been removed.`,
      )
      .then(() =>
        webhookClient.send(
          `Punishment **${infraction.type}** \`(#${infraction.id})\` issued to <@${infraction.memberId}> has been removed by ${ctx.author}.`,
        ),
      );
  };
}
