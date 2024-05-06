import { Command, type CommandContext } from "../../lib/structures/Command.js";
import type Args from "../../lib/structures/Args.js";
import type Context from "../../lib/structures/Context.js";
import { GenericFailure } from "../../lib/utils/errors.js";

export default abstract class UnblacklistCommand extends Command {
  public constructor(context: CommandContext) {
    super(context, {
      name: "Unblacklist",
      permissions: {
        admin: true,
      },
      description: "Unblacklist a user from commands.",
    });
  }

  public override run = async (ctx: Context, args: Args) => {
    const user = await args.returnMemberFromIndex(0).catch(() => null);
    if (!user) return ctx.reply("That is not a user.");

    const reason = await args.getRest(2).catch(() => "No reason provided.");

    const isBlacklisted = await this.context.client.db.blacklists.findFirst({
      where: {
        guildId: ctx.guild!.id,
        userId: user.id,
      },
    });
    if (!isBlacklisted) throw new GenericFailure("This user is not blacklisted from the specified system.");

    await this.context.client.db.blacklists.delete({
      where: {
        guildId: ctx.guild!.id,
        userId: user.id,
      },
    });
    return ctx.message.channel.send(`${user} \`(${user.id})\` has been **unblacklisted** for \`${reason}\`.`);
  };
}
