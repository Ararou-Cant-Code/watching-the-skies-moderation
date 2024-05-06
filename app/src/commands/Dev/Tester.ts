import { Command, type CommandContext } from "../../lib/structures/Command.js";

export default abstract class TesterCommand extends Command {
  public constructor(context: CommandContext) {
    super(context, {
      name: "Tester",
      description: "funny testing stuff",
    });
  }

  public override run = async () => {
    throw new Error("You thought.");
  };
}
