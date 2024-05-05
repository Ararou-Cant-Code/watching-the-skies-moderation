import Command, { CommandContext } from "../../lib/structures/Command.js";
import Args from "../../lib/structures/Args.js";
import Context from "../../lib/structures/Context.js";
import { WarnInfraction } from "../../lib/infractions/Warn.js";

export default abstract class WarnCommand extends Command {
  public constructor(context: CommandContext) {
    super(context, {
      name: "Warn",
      permissions: {
        dev: true,
      },
      description: "Warns someone for a provided reason.",
    });
  }

  public override run = async (ctx: Context, args: Args) => {
    const member = await args.returnMemberFromIndex(0).catch(() => null);
    if (!member) return ctx.reply("That is not a member.");

    let reason = await args.getRest(1).catch(() => null);
    if (!reason) reason = "No reason provided.";

    return new WarnInfraction(
      {
        memberId: member.id,
        guildId: ctx.message.guild!.id,
        moderatorId: ctx.author.id,
        reason,
        expiresAtString: "14d",
      },
      this.context.client,
    ).issue(ctx.message);
  };
}