import { Command } from "../../lib/structures/Command.js";
import type Args from "../../lib/structures/Args.js";
import type Context from "../../lib/structures/Context.js";
import { GenericFailure } from "../../lib/utils/errors.js";
import { ApplyCommandOptions } from "../../lib/utils/functions.js";

@ApplyCommandOptions<Command.Options>({
  name: "Unblacklist",
  permissions: {
    admin: true,
  },
  description: "Unblacklist a user from commands.",
})
export default class UnblacklistCommand extends Command {
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
