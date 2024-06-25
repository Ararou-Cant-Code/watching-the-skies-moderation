import { Command } from "../../lib/structures/Command.js";
import type Args from "../../lib/structures/Args.js";
import type Context from "../../lib/structures/Context.js";
import { UnmuteInfraction } from "../../lib/infractions/Unmute.js";
import { ApplyCommandOptions } from "../../lib/utils/functions.js";

@ApplyCommandOptions<Command.Options>({
  name: "Unmute",
  aliases: ["um", "unm"],
  permissions: {
    staff: true,
  },
  detailedDescription: {
    usage: "<member> <reason>"
  },
  description: "Unmutes someone for a provided reason and duration.",
})
export default class UnmuteCommand extends Command {
  public override run = async (ctx: Context, args: Args) => {
    const member = await args.returnMemberFromIndex(0).catch(() => null);
    if (!member) return ctx.reply("That is not a member.");

    let reason = await args.getRest(1).catch(() => null);
    if (!reason) reason = "No reason provided.";

    return new UnmuteInfraction(
      {
        memberId: member.id,
        guildId: ctx.message.guild!.id,
        moderatorId: ctx.author.id,
        reason,
      },
      this.context.client,
    ).issue(ctx.message);
  };
}
