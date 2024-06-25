import { Command } from "../../lib/structures/Command.js";
import type Context from "../../lib/structures/Context.js";
import { ApplyCommandOptions } from "../../lib/utils/functions.js";
import type Args from "../../lib/structures/Args.js";

@ApplyCommandOptions<Command.Options>({
  name: "Nickname",
  aliases: ["nick", "setnickname", "setnick"],
  permissions: {
    staff: true,
  },
  detailedDescription: {
    usage: "<member> [nickname]"
  },
  description: "Set a members nickname.",
})
export default class NicknameCommand extends Command {
  public override run = async (ctx: Context, args: Args) => {
    const member = await args.returnMemberFromIndex(0).catch(() => null);
    if (!member)
      return ctx.reply(
        "That is not a valid member. The member provided needs to be type of GuildMember, not User or null.",
      );

    if (member.user.bot) return ctx.reply("You cannot set that members username.");

    const newNickname = await args.getRest(1).catch(() => null);
    return member
      .setNickname(newNickname)
      .then(() => ctx.reply(newNickname ? `Set their nickname to \`${newNickname}\`.` : "Reset their nickname."));
  };
}
