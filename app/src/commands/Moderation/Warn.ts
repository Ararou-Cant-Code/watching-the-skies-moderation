import { Command } from "../../lib/structures/Command.js";
import type Args from "../../lib/structures/Args.js";
import type Context from "../../lib/structures/Context.js";
import { WarnInfraction } from "../../lib/infractions/Warn.js";
import { ApplyCommandOptions } from "../../lib/utils/functions.js";

@ApplyCommandOptions<Command.Options>({
  name: "Warn",
  aliases: ["w"],
  flags: ["silent", "s", "permanent", "perm", "p"],
  permissions: {
    staff: true,
  },
  detailedDescription: {
    usage: "<member> <reason>",
  },
  description: "Warns someone for a provided reason.",
})
export default class WarnCommand extends Command {
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
        expiresAtString: args.getFlags("permanent", "perm", "p") ? null : "14d",
      },
      this.context.client,
    ).issue(ctx.message, args);
  };
}
