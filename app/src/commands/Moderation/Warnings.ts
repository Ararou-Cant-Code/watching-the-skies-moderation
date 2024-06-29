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
  detailedDescription: {
    usage: "[user (Defaults to message.author)]",
  },
  description: "Get all warnings on a user.",
})
export default class WarningsCommand extends Command {
  public override run = async (ctx: Context, args: Args) => {
    const infractionFields: EmbedField[] = [];

    let member = await args.returnUserFromIndex(0).catch(() => null);

    let page = await args.getNumberRest(member ? 1 : 0).catch(() => null);
    if (!page) page = 0;
    else page = page - 1;

    if (!member) member = await ctx.author.fetch();
    if (!this.checks.isStaff(ctx.member, guildConfigs.get(ctx.guild!.id)!)) member = await ctx.author.fetch();

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
      if (!this.checks.isStaff(ctx.member!, guildConfigs.get(ctx.guild!.id)!) && infraction.type === "Note") continue;

      infractionFields.push({
        name: `${infraction.type} #${infraction.id}`,
        value: `> ${this.checks.isStaff(ctx.member!, guildConfigs.get(ctx.guild!.id)!) ? `\`${(await this.context.client.users.fetch(infraction.moderatorId)).username}\`: ` : ""}**${infraction.reason}**\nThis infraction was issued on ${time(infraction.issuedAt, "F")}${infraction.expiresAt ? " and expires " + time(infraction.expiresAt, "R") + " on " + time(infraction.expiresAt, "R") + ". " : "."}`,
        inline: false,
      });
    }

    const pages = setPages(infractionFields);

    const embed = pages[page]
      .setAuthor({
        name: `${member.username} (${member.id})`,
        iconURL: member.displayAvatarURL(),
      })
      .setColor(0xffb6c1)
      .setTitle(
        `Found ${infractions.length} infraction${infractions.length === 1 ? "" : "s"} issued to ${member.username}.`,
      )
      .setFooter({ text: `Page ${page + 1} of ${pages.length}` });
    return ctx.reply({ embeds: [embed] });
  };
}
