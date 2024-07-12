import { Command } from "../../lib/structures/Command.js";
import type Args from "../../lib/structures/Args.js";
import type Context from "../../lib/structures/Context.js";
import { GenericFailure } from "../../lib/utils/errors.js";
import { ApplyCommandOptions } from "../../lib/utils/functions.js";

@ApplyCommandOptions<Command.Options>({
  name: "Blacklist",
  permissions: {
    admin: true,
  },
  description: "Blacklist a user from using commands.",
})
export default class BlacklistCommand extends Command {
  public override run = async (ctx: Context, args: Args) => {
    const user = await args.returnMemberFromIndex(0).catch(() => null);
    if (!user) return ctx.reply("That is not a user.");

    if (user.id === ctx.author.id) return ctx.reply("You cannot blacklist yourself.");

    const reason = await args.getRest(1).catch(() => "No reason provided.");

    const isBlacklisted = await this.context.client.db.blacklists.findFirst({
      where: {
        guildId: ctx.guild!.id,
        userId: user.id,
      },
    });
    if (isBlacklisted) throw new GenericFailure("This user is already blacklisted from the specified system.");

    await this.context.client.db.blacklists.create({
      data: {
        guildId: ctx.guild!.id,
        userId: user.id,

        reason,
      },
    });
    return ctx.message.channel.send(`${user} \`(${user.id})\` has been **blacklisted** for \`${reason}\`.`);
  };
}
