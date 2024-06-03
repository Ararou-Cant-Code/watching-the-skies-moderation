import { Command } from "../../lib/structures/Command.js";
import type Context from "../../lib/structures/Context.js";
import { ApplyCommandOptions, setPages } from "../../lib/utils/functions.js";
import type Args from "../../lib/structures/Args.js";
import { guildConfigs } from "../../lib/structures/GuildConfigs.js";
import { time, type EmbedField } from "discord.js";

@ApplyCommandOptions<Command.Options>({
  name: "Warnings",
  aliases: ["warns", "strikes", "infractions", "punishments", "cases"],
  permissions: {
    commands_channel: true,
  },
  description: "Get all warnings on a user.",
})
export default class WarningsCommand extends Command {
  public override run = async (ctx: Context, args: Args) => {
    const infractionFields: EmbedField[] = [];

    let member = await args.returnMemberFromIndex(0).catch(() => null);

    let page = await args.getNumberRest(member ? 1 : 0).catch(() => null);
    if (!page) page = 0;
    else page = page - 1;

    if (!member) member = await ctx.member.fetch();
    if (!this.checks.isStaff(ctx.member, guildConfigs.get(ctx.guild!.id)!)) member = await ctx.member.fetch();

    const infractions = await this.context.db.infractions.findMany({
      where: {
        guildId: ctx.guild.id,
        memberId: member.id,
      },
    });
    if (!infractions.length)
      return ctx.reply({
        content: `${ctx.user.id === member.id ? "You" : "They"} do not have any active punishments.`,
      });

    for (const infraction of infractions.sort((a, b) => a.id - b.id)) {
      infractionFields.push({
        name: `${infraction.type} #${infraction.id}${this.checks.isStaff(member!, guildConfigs.get(ctx.guild!.id)!) ? ` | Issued by: ${infraction.moderatorId}` : ""}`,
        value: [
          `> **Reason:** \`${infraction.reason}\``,
          `> **Issued On:** ${time(infraction.issuedAt, "F")}`,
          `> **Expires:** ${infraction.expiresAt ? time(infraction.expiresAt, "F") + " (" + time(infraction.expiresAt, "R") + ") " : "Never"}`,
        ].join("\n"),
        inline: false,
      });
    }

    const pages = setPages(infractionFields);

    const embed = pages[page]
      .setAuthor({
        name: `${member.user.username} (${member.id})`,
        iconURL: member.displayAvatarURL(),
      })
      .setTitle(
        `Found ${infractions.length} infraction${infractions.length === 1 ? "" : "s"} issued to ${member.user.username}.`,
      )
      .setFooter({ text: `Page ${page + 1} of ${pages.length}` });
    return ctx.reply({ embeds: [embed] });
  };
}
