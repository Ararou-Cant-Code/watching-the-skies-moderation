import { Command } from "../../lib/structures/Command.js";
import type Args from "../../lib/structures/Args.js";
import type Context from "../../lib/structures/Context.js";
import { ApplyCommandOptions } from "../../lib/utils/functions.js";
import { guildConfigs } from "../../lib/structures/GuildConfigs.js";
import { WebhookClient } from "discord.js";

@ApplyCommandOptions<Command.Options>({
  name: "Invalidatecase",
  permissions: {
    staff: true,
  },
  detailedDescription: {
    usage: "<infractionId>"
  },
  description: "Invalidates a punishment.",
})
export default class InvalidatecaseCommand extends Command {
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

    if (!this.checks.isHmod(ctx.member!, guildConfigs.get(ctx.guild.id)!) && infraction.moderatorId !== ctx.author.id)
      return ctx.reply("You cannot modify a punishment that was not issued by you.");

    const webhookClient = new WebhookClient({ url: process.env.MODERATION_LOG_WEBHOOK! });

    await this.context.client.db.infractions.update({
      where: {
        guildId: ctx.message.guild!.id,
        id,
      },
      data: {
        invalid: true,
        expiresAt: null,
      },
    });
    return ctx.message.channel
      .send(
        `**${infraction.type}** \`(#${infraction.id})\` issued to <@${infraction.memberId}> issued by <@${infraction.moderatorId}> has been invalidated.`,
      )
      .then(() =>
        webhookClient.send(
          `Punishment **${infraction.type}** \`(#${infraction.id})\` issued to <@${infraction.memberId}> has been invalidated by ${ctx.author}.`,
        ),
      );
  };
}
