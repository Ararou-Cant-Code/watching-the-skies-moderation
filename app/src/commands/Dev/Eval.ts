import { codeBlock } from "discord.js";
import { Command } from "../../lib/structures/Command.js";
import type Args from "../../lib/structures/Args.js";
import type Context from "../../lib/structures/Context.js";
import { inspect } from "node:util";
import { ApplyCommandOptions } from "../../lib/utils/functions.js";

const allowedUsers = ["840213882147831879", "671873798211108876"];

@ApplyCommandOptions<Command.Options>({
  name: "Eval",
  flags: ["silent", "s"],
  permissions: { dev: true },
  description: "Eval a line of code.",
  detailedDescription: {
    usage: "<code: String>",
  },
})
export default class EvalCommand extends Command {
  public override run = async (ctx: Context, args: Args) => {
    if (!allowedUsers.includes(ctx.author.id)) throw "you shall not pass (we're back in 2016 again)";

    const code = await args.getAll().catch(() => null);
    if (!code) return ctx.reply("How am I supposed to evaluate that?");

    const silentFlag = args.getFlags("silent", "s");

    try {
      const evaluated = await eval(code);
      const result = inspect(evaluated);

      if (result.length >= 2000)
        return !silentFlag
          ? ctx.message.channel.send({
              content: "Whoops! Evaluated result is too long for discord...",
              files: [{ name: "result.js", attachment: Buffer.from(result) }],
            })
          : null;

      return !silentFlag
        ? ctx.message.channel.send(codeBlock("js", typeof evaluated !== "string" ? result : evaluated))
        : null;
    } catch (error: any) {
      return !silentFlag ? ctx.message.channel.send(codeBlock("js", error)) : null;
    }
  };
}
