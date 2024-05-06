import { Command, type CommandContext } from "../../lib/structures/Command.js";
import type Args from "../../lib/structures/Args.js";
import type Context from "../../lib/structures/Context.js";
import { EmbedBuilder, Colors, time } from "discord.js";

export default abstract class CaseCommand extends Command {
  public constructor(context: CommandContext) {
    super(context, {
      name: "Case",
      permissions: {
        staff: true,
      },
      description: "Views a punishment.",
    });
  }

  public override run = async (ctx: Context, args: Args) => {
    const id = await args.getNumberIndex(0).catch(() => null);
    if (!id) return ctx.reply("That is not an ID.");

    const infraction = await this.context.client.db.infractions.findFirst({
      where: {
        guildId: ctx.message.guild!.id,
        id,
      },
    });
    if (!infraction) return ctx.reply("That is not a valid infraction.");

    const user = await this.context.client.users.fetch(infraction.memberId);
    const moderator = await this.context.client.users.fetch(infraction.moderatorId);

    const caseEmbed = new EmbedBuilder()
      .setColor(
        infraction.type === "Unmute" || infraction.type === "Unban"
          ? Colors.Green
          : infraction.type === "Warn" || infraction.type === "Mute"
            ? Colors.Yellow
            : infraction.type === "Ban"
              ? Colors.Red
              : Colors.DarkButNotBlack,
      )
      .setAuthor({
        name: ctx.message.guild!.name,
        iconURL: ctx.message.guild!.iconURL() || this.context.client.user!.displayAvatarURL(),
      })
      .setTitle(`${infraction.invalid ? "🔴 [INVALID] " : ""}${infraction.type} \`(Case #${infraction.id})\``)
      .setDescription("Case Details")
      .addFields([
        {
          name: "Target",
          value: `> ${user} \`(${user.username} - ${user.id})\``,
        },
        {
          name: "Moderator",
          value: `> ${moderator} \`(${moderator.username} - ${moderator.id})\``,
        },
        {
          name: "Issued For",
          value: `> ${infraction.reason}`,
        },
        {
          name: "Issued On",
          value: `> ${time(infraction.issuedAt, "F")}`,
        },
      ]);

    if (infraction.expiresAt)
      caseEmbed.addFields([
        {
          name: "Expires",
          value: `> ${time(infraction.expiresAt, "F")} (${time(infraction.expiresAt, "R")})`,
        },
      ]);

    return ctx.message.channel.send({ embeds: [caseEmbed] });
  };
}
