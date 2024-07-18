import { Command } from "../../lib/structures/Command.js";
import type Context from "../../lib/structures/Context.js";
import { ApplyCommandOptions } from "../../lib/utils/functions.js";
import type Args from "../../lib/structures/Args.js";
import { EmbedBuilder, time } from "discord.js";

@ApplyCommandOptions<Command.Options>({
  name: "Whois",
  aliases: ["who", "whoyou", "userinfo", "ui"],
  permissions: {
    staff: true,
  },
  description: "Get available information on a user.",
  detailedDescription: {
    usage: "[user: User]",
  },
})
export default class WhoisCommand extends Command {
  public override run = async (ctx: Context, args: Args) => {
    let user = await args.returnUserFromIndex(0).catch(() => null);
    if (!user) user = await ctx.author.fetch();

    const guildMember = await ctx.guild.members.fetch(user).catch(() => null);
    const banned = await ctx.guild.bans.fetch({ user }).catch(() => null);

    const userinfoEmbed = new EmbedBuilder()
      .setColor(0xffb6c1)
      .setAuthor({
        name: `Whois: ${user.tag} (${user.id})`,
        iconURL: user.displayAvatarURL(),
      })
      .setTitle(`Viewing information on ${user.tag} \`(${user.id})\`.`)
      .setDescription(
        `**Created:** ${time(user.createdAt, "F")} (${time(user.createdAt, "R")})${guildMember ? `\n**Joined Server:** ${time(guildMember.joinedAt!, "F")} (${time(guildMember.joinedAt!, "R")})` : ""}`,
      )
      .addFields([
        {
          name: "Avatar Links",
          value: `[User Avatar](${user.displayAvatarURL({
            size: 1024,
          })})${
            guildMember
              ? guildMember.avatarURL()
                ? `\n> [Server Avatar](${guildMember.avatarURL({
                    size: 1024,
                  })})`
                : ""
              : ""
          }`,
        },
      ]);

    if (banned)
      userinfoEmbed.addFields([
        {
          name: "Banned?",
          value: `Yes\n> **Reason:** \`${banned.reason || "no reason specified."}\``,
        },
      ]);

    if (guildMember)
      userinfoEmbed.addFields([
        {
          name: "Roles",
          value: `> ${
            [...guildMember.roles.cache.sort((a, b) => b.position - a.position).values()].slice(0, -1).join(", ") ||
            "None"
          }`,
          inline: false,
        },
      ]);

    return ctx.message.channel.send({ embeds: [userinfoEmbed] });
  };
}
