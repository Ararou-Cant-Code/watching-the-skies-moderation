import Command, { CommandContext } from "../../lib/structures/Command.js";
import Args from "../../lib/structures/Args.js";
import Context from "../../lib/structures/Context.js";

export default abstract class InvalidatecaseCommand extends Command {
  public constructor(context: CommandContext) {
    super(context, {
      name: "Invalidatecase",
      permissions: {
        staff: true,
      },
      description: "Invalidates a punishment.",
    });
  }

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

    if (
      !this.checks.isHmod(ctx.member!, this.context.client.guildConfigs.get(ctx.message.guild!.id)!) &&
      infraction.moderatorId !== ctx.author.id
    )
      return ctx.reply("You cannot modify a punishment that was not issued by you.");

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
    return ctx.message.channel.send(
      `**${infraction.type}** \`(#${infraction.id})\` issued to <@${infraction.memberId}> issued by <@${infraction.moderatorId}> has been invalidated.`
    );
  };
}
