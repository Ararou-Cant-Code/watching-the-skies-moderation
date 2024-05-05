import Command, { CommandContext } from "../../lib/structures/Command.js";
import Args from "../../lib/structures/Args.js";
import Context from "../../lib/structures/Context.js";
import { UnbanInfraction } from "../../lib/infractions/Unban.js";

export default abstract class UnbanCommand extends Command {
  public constructor(context: CommandContext) {
    super(context, {
      name: "Unban",
      permissions: {
        dev: true,
      },
      description: "Unbans someone for a provided reason.",
    });
  }

  public override run = async (ctx: Context, args: Args) => {
    const user = await args.returnUserFromIndex(0).catch(() => null);
    if (!user) return ctx.reply("That is not a user.");

    let reason = await args.getRest(1).catch(() => null);
    if (!reason) reason = "No reason provided.";

    return new UnbanInfraction(
      {
        memberId: user.id,
        guildId: ctx.message.guild!.id,
        moderatorId: ctx.author.id,
        reason,
      },
      this.context.client,
    ).issue(ctx.message);
  };
}
