import {
  type Guild,
  type Message,
  type PermissionsBitField,
  type User,
  type Channel,
  type ChatInputCommandInteraction,
  type SlashCommandBuilder,
} from "discord.js";
import { Client } from "./Client.js";
import { PrismaClient } from "@prisma/client";
import Args from "./Args.js";
import { Lexer } from "@sapphire/lexure";
import Context from "./Context.js";
import Checks from "../classes/Checks.js";
import { guildConfigs } from "./GuildConfigs.js";

export abstract class Command {
  public checks: Checks;
  public lexer: Lexer;
  public context: CommandContext = null!;

  public directory?: string;

  public options: CommandOptions = null!;

  public name: string = null!;
  public aliases?: string[];

  public constructor(context: CommandContext, options: CommandOptions) {
    this.name = options ? options.name : "";
    this.options = options;
    this.context = context;

    this.checks = new Checks();
    this.lexer = new Lexer({
      quotes: [
        ['"', '"'],
        ["“", "”"],
        ["「", "」"],
        ["«", "»"],
      ],
    });
  }

  public test = async (command: Command, context: CommandContext, ctx: Context, args?: Args) => {
    const guildConfig = guildConfigs.get(context.executed!.guild.id);

    if (
      command.options.permissions &&
      command.options.permissions.dev &&
      context.executed!.user.id !== context.client.developerId
    )
      return "FAILED";

    if (
      command.options.permissions &&
      command.options.permissions.staff &&
      !this.checks.isStaff(ctx.member!, guildConfigs.get(ctx.message.guild!.id)!)
    )
      return "FAILED";

    if (
      command.options.permissions &&
      command.options.permissions.hmod &&
      !this.checks.isStaff(ctx.member!, guildConfigs.get(ctx.message.guild!.id)!)
    )
      return "FAILED";

    if (
      command.options.permissions &&
      command.options.permissions.trusted_member &&
      !context.executed!.userRoles!.includes(guildConfig!.roles!.level_roles![20]) &&
      !this.checks.isStaff(ctx.member!, guildConfigs.get(ctx.message.guild!.id)!)
    )
      return "FAILED";

    if (
      command.options.permissions &&
      command.options.permissions.commands_channel &&
      context.executed!.channel.id !== guildConfig!.channels!.commands &&
      !this.checks.isStaff(ctx.member!, guildConfigs.get(ctx.message.guild!.id)!)
    )
      return ctx.reply("This command goes in a bot-commands channel, not here.");

    return this.run(ctx, args);
  };

  public abstract run: (...args: any[]) => unknown;

  public toJSON(): any {
    return {
      name: this.name,
      description: this.options.description,
      detailedDescription: this.options.detailedDescription,
      directory: this.context.directory,
    };
  }
}

export namespace Command {
  export type Context = CommandContext;
  export type Options = CommandOptions;
}

export interface CommandOptions {
  slashCapable?: boolean | false;
  data?: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  name: string;
  aliases?: string[];
  flags?: string[];
  description?: string;
  detailedDescription?: { usage?: string; examples?: string[] };
  permissions?: {
    commands_channel?: boolean;
    trusted_member?: boolean;
    staff?: boolean;
    hmod?: boolean;
    admin?: boolean;
    dev?: boolean;
    node?: string;
    user?: PermissionsBitField[];
    client?: PermissionsBitField[];
  };
}

export interface CommandContext {
  db: PrismaClient;
  client: Client;
  directory: string;

  executed?: {
    message: Message | ChatInputCommandInteraction;
    user: User;
    userRoles?: string[] | null;
    guild: Guild;
    channel: Channel;
  };
}
