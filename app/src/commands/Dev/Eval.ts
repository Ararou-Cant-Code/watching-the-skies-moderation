import { codeBlock } from "discord.js";
import { Command, type CommandContext } from "../../lib/structures/Command.js";
import type Args from "../../lib/structures/Args.js";
import type Context from "../../lib/structures/Context.js";
import { inspect } from "node:util";

export default abstract class EvalCommand extends Command {
  public constructor(context: CommandContext) {
    super(context, {
      name: "Eval",
      permissions: { dev: true },
      description: "Eval a line of code.",
      detailedDescription: {
        usage: "<code: String>",
      },
    });
  }

  public override run = async (ctx: Context, args: Args) => {
    if (ctx.author.id !== "840213882147831879") throw "Bad.";

    const code = await args.getAll().catch(() => null);
    if (!code) return ctx.reply("How am I supposed to evaluate that?");

    try {
      const evaluated = await eval(code);
      const result = inspect(evaluated);

      if (result.length >= 2000)
        return ctx.reply({
          content: "Whoops! Evaluated result is too long for discord...",
          files: [{ name: "result.js", attachment: Buffer.from(result) }],
        });

      return ctx.reply(codeBlock("js", typeof evaluated !== "string" ? result : evaluated));
    } catch (error: any) {
      return ctx.reply(codeBlock("js", error));
    }
  };
}
