import type Args from "../../lib/structures/Args.js";
import { Command } from "../../lib/structures/Command.js";
import type Context from "../../lib/structures/Context.js";
import { ApplyCommandOptions } from "../../lib/utils/functions.js";

@ApplyCommandOptions<Command.Options>({
  name: "Note",
  aliases: ["addnote", "an", "usernote", "un"],
  permissions: {
    commands_channel: true,
  },
  detailedDescription: {
    usage: "<user: User> <note: string>",
  },
  description: "Add a note to a user.",
})
export default class NoteCommand extends Command {
  public override run = async (ctx: Context, args: Args) => {
    const user = await args.returnUserFromIndex(0).catch(() => null);
    if (!user) return ctx.reply("That is not a valid user.");

    const reason = await args.getRest(1).catch(() => null);
    if (!reason) return ctx.reply("A note is required.");

    await this.context.db.infractions.create({
      data: {
        type: "Note",
        guildId: ctx.guild.id,
        moderatorId: ctx.author.id,
        memberId: user.id,
        reason,
      },
    });
    return ctx.reply(`Sucessfully added a note to the specified user (${user}).`);
  };
}
