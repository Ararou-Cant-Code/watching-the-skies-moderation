import { Command } from "../../lib/structures/Command.js";
import { ApplyCommandOptions } from "../../lib/utils/functions.js";

@ApplyCommandOptions<Command.Options>({
  name: "Tester",
  description: "funny testing stuff",
})
export default class TesterCommand extends Command {
  public override run = async () => {
    throw new Error("You thought.");
  };
}
