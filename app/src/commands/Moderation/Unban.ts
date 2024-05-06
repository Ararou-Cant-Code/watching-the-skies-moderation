import { Command, type CommandContext } from "../../lib/structures/Command.js";
import type Args from "../../lib/structures/Args.js";
import type Context from "../../lib/structures/Context.js";
import { UnbanInfraction } from "../../lib/infractions/Unban.js";

export default abstract class UnbanCommand extends Command {
  public constructor(context: CommandContext) {
    super(context, {
      name: "Unban",
      aliases: ["ub", "unb"],
      permissions: {
        staff: true,
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
