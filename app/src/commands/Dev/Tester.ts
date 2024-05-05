import Command, { CommandContext } from "../../lib/structures/Command.js";
import Args from "../../lib/structures/Args.js";
import Context from "../../lib/structures/Context.js";

export default abstract class TesterCommand extends Command {
  public constructor(context: CommandContext) {
    super(context, {
      name: "Tester",
      description: "funny testing stuff",
    });
  }

  public override run = async (ctx: Context, args: Args) => {
    throw new Error("You thought.");
  };
}
