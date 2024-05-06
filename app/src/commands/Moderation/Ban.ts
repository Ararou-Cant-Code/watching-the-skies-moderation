import { Command, type CommandContext } from "../../lib/structures/Command.js";
import type Args from "../../lib/structures/Args.js";
import type Context from "../../lib/structures/Context.js";
import { BanInfraction } from "../../lib/infractions/Ban.js";

export default abstract class BanCommand extends Command {
  public constructor(context: CommandContext) {
    super(context, {
      name: "Ban",
      aliases: ["b", "out", "getout", "gt", "gtfo"],
      permissions: {
        staff: true,
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
