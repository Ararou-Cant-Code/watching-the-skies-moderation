import Command, { CommandContext } from "../../lib/structures/Command.js";
import Args from "../../lib/structures/Args.js";
import Context from "../../lib/structures/Context.js";
import { BanInfraction } from "../../lib/infractions/Ban.js";

export default abstract class BanCommand extends Command {
  public constructor(context: CommandContext) {
    super(context, {
      name: "Ban",
      permissions: {
        dev: true,
      },
      description: "Bans someone for a provided reason.",
    });
  }

  public override run = async (ctx: Context, args: Args) => {
    const user = await args.returnUserFromIndex(0).catch(() => null);
    if (!user) return ctx.reply("That is not a user.");

    let reason = await args.getRest(1).catch(() => null);
    if (!reason) reason = "No reason provided.";

    return new BanInfraction(
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
