import { type APIEmbedField, EmbedBuilder, Collection } from "discord.js";
import { Command } from "../../lib/structures/Command.js";
import type Args from "../../lib/structures/Args.js";
import type Context from "../../lib/structures/Context.js";
import { ApplyCommandOptions } from "../../lib/utils/functions.js";

@ApplyCommandOptions<Command.Options>({
  name: "Help",
  permissions: {
    commands_channel: true,
  },
  description: "View commands on the bot.",
  detailedDescription: {
    usage: "(Views all commands) | <commandName: string> (Views information on a command)",
  },
})
export default class HelpCommand extends Command {
  public override run = async (ctx: Context, args: Args) => {
    const cmdDetails = new EmbedBuilder();
    const embedFields: APIEmbedField[] = [];
    const categories: string[] = [];
    const commands = (this.context.client.stores.get("commands")! as Collection<string, Command>).map((c) => c);

    for (var c = 0; c < commands.length; c++) {
      if (categories.includes(commands[c].context.directory!)) continue;

      categories.push(commands[c].context.directory!);
    }

    categories.map((category) =>
      embedFields.push({
        name: category,
        value: commands
          .filter((cmd) => cmd.context.directory === category)
          .map((cmd) => `\`${cmd.name}\``)
          .join(", "),
        inline: false,
      }),
    );

    const rawCommandArg = await args.getIndex(0).catch(() => null);
    if (!rawCommandArg)
      return ctx.reply({
        embeds: [
          {
            color: 0xffb6c1,
            fields: embedFields,
          },
        ],
      });

    const command =
      (this.context.client.stores.get("commands")!.get(rawCommandArg) as Command) ||
      this.context.client.stores
        .get("commands")!
        .get(this.context.client.stores.get("aliases")!.get(rawCommandArg)! as string);
    if (!command)
      return ctx.reply({
        embeds: [
          {
            color: 0xffb6c1,
            fields: embedFields,
          },
        ],
      });

    cmdDetails.setColor(0xffb6c1).setAuthor({
      name: this.context.client.user!.username,
      iconURL: this.context.client.user!.displayAvatarURL(),
    });
    cmdDetails.setTitle(
      `${this.context.client.defaultPrefix}${command.name}${
        command.options.detailedDescription?.usage ? ` ${command.options.detailedDescription.usage}` : ""
      }`,
    );

    if (command.options.description) cmdDetails.setDescription(command.options.description);

    if (command.options.aliases)
      cmdDetails.addFields([
        {
          name: "Aliases",
          value: `> ${command.options.aliases.map((alias) => `\`${alias}\``).join(", ")}`,
        },
      ]);

    if (command.options.flags)
      cmdDetails.addFields([
        {
          name: "Flags",
          value: `> ${command.options.flags.map((flag) => `\`${flag}\``).join(", ")}`,
        },
      ]);

    return ctx.reply({ embeds: [cmdDetails] });
  };
}
