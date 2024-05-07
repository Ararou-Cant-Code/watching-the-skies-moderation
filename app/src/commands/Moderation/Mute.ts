import { Command } from "../../lib/structures/Command.js";
import type Args from "../../lib/structures/Args.js";
import type Context from "../../lib/structures/Context.js";
import { Duration, Time } from "@sapphire/time-utilities";
import { MuteInfraction } from "../../lib/infractions/Mute.js";
import { ApplyCommandOptions } from "../../lib/utils/functions.js";

@ApplyCommandOptions<Command.Options>({
  name: "Mute",
  aliases: ["m", "shut"],
  permissions: {
    staff: true,
  },
  description: "Mutes someone for a provided reason and duration.",
})
export default class MuteCommand extends Command {
  public override run = async (ctx: Context, args: Args) => {
    const member = await args.returnMemberFromIndex(0).catch(() => null);
    if (!member) return ctx.reply("That is not a member.");

    const duration = await args.getIndex(1).catch(() => null);
    if (!duration || new Duration(duration).offset >= Time.Week * 2) return ctx.reply("That is not a valid duration");

    let reason = await args.getRest(2).catch(() => null);
    if (!reason) reason = "No reason provided.";

    return new MuteInfraction(
      {
        memberId: member.id,
        guildId: ctx.message.guild!.id,
        moderatorId: ctx.author.id,
        reason,
        expiresAtString: duration,
      },
      this.context.client,
    ).issue(ctx.message);
  };
}
