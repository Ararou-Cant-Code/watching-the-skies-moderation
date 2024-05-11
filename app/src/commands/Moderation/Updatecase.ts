import { Command } from "../../lib/structures/Command.js";
import type Args from "../../lib/structures/Args.js";
import type Context from "../../lib/structures/Context.js";
import { ApplyCommandOptions } from "../../lib/utils/functions.js";
import { guildConfigs } from "../../lib/structures/GuildConfigs.js";

@ApplyCommandOptions<Command.Options>({
  name: "Updatecase",
  permissions: {
    staff: true,
  },
  description: "Updates a punishment.",
})
export default class UpdatecaseCommand extends Command {
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

    if (!this.checks.isHmod(ctx.member!, guildConfigs.get(ctx.guild!.id)!) && infraction.moderatorId !== ctx.author.id)
      return ctx.reply("You cannot modify a punishment that was not issued by you.");

    const reason = await args.getRest(1).catch(() => null);
    if (!reason) return ctx.reply("You cannot update a punishment without a new reason.");

    await this.context.client.db.infractions.update({
      where: {
        guildId: ctx.message.guild!.id,
        id,
      },
      data: {
        reason,
      },
    });
    return ctx.message.channel.send(
      `**${infraction.type}** \`(#${infraction.id})\` issued to <@${infraction.memberId}> issued by <@${infraction.moderatorId}> has been updated.\n> **New Reason:** \`${reason}\``,
    );
  };
}
