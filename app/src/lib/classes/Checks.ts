import { type GuildMember } from "discord.js";
import { type GuildConfigOptions } from "../utils/constants.js";

export default class Checks {
  public isStaff = (member: GuildMember, guildConfig: GuildConfigOptions) => {
    const roles = guildConfig.roles.staff;

    return member.roles.cache.hasAny(...roles.mod, ...roles.hmod, ...roles.admin, ...roles.owner);
  };

  public isHmod = (member: GuildMember, guildConfig: GuildConfigOptions) => {
    const roles = guildConfig.roles.staff;

    return member.roles.cache.hasAny(...roles.hmod, ...roles.admin, ...roles.owner);
  };

  public isAdmin = (member: GuildMember, guildConfig: GuildConfigOptions) => {
    const roles = guildConfig.roles.staff;

    return member.roles.cache.hasAny(...roles.admin, ...roles.owner);
  };

  public isManager = (member: GuildMember, guildConfig: GuildConfigOptions) => {
    const roles = guildConfig.roles.staff;

    return member.roles.cache.hasAny(...roles.owner);
  };
}
