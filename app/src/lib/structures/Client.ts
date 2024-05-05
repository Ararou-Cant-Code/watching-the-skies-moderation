import { Collection, Client as DiscordClient, ClientOptions as DiscordClientOptions, REST, Routes } from "discord.js";
import { ClientOptions, GuildConfigOptions } from "../utils/constants.js";
import { readdirSync } from "node:fs";
import Logger from "@ptkdev/logger";
import Listener from "./Listener.js";
import Command from "./Command.js";
import Sentry from "@sentry/node";
import { PrismaClient } from "@prisma/client";
import SentryHandler from "../classes/SentryHandler.js";

export class Client extends DiscordClient {
  public sentryHandler = new SentryHandler({ client: this }, { sendEmbed: true, sendLogToConsole: true });
  public logger = new Logger();
  public db = new PrismaClient();

  public developerId?: string = "840213882147831879";
  public defaultPrefix?: string = "wts!";

  public commandResponseCooldowns = new Set();
  public commandCooldowns = new Set();
  public levelCooldowns = new Set();

  public commands: Collection<String, Command> = new Collection();
  public aliases: Map<string, string> = new Map();

  public slashCommands: Collection<String, Command> = new Collection();

  public guildConfigs: Map<string, GuildConfigOptions> = new Map().set(
    "1235442068189347840", // WTS Moderation Testing
    {
      channels: {
        commands: "1235443728349663263",
      },
      roles: {
        allStaff: "1235443027850432572",
      },
      permissions: {
        staff: {
          roles: [""],
          nodes: ["ping.command"],
        },
      },
    },
  );

  public constructor(options: DiscordClientOptions & ClientOptions) {
    super(options);
  }

  private handleCommands = async () => {
    const cmdPath = readdirSync("dist/commands");

    for (const dir of cmdPath) {
      const files = readdirSync(`dist/commands/${dir}`).filter((f) => f.endsWith(".js"));
      for (const file of files) {
        const commandImported = (await import(`../../commands/${dir}/${file}`)).default;

        const command: Command = new commandImported(this);
        command.name = command.name.toLowerCase();

        command.context = {
          db: this.db,
          client: this,
          directory: dir,
        };

        this.commands.set(command.name.toLowerCase(), command);
        this.slashCommands.set(command.name.toLowerCase(), command);

        if (command.aliases)
          command.aliases.forEach((alias) => this.aliases.set(alias.toLowerCase(), command.name.toLowerCase()));
      }
    }
  };

  private handleCoreListeners = async () => {
    const files = readdirSync("dist/core-listeners").filter((f) => f.endsWith(".js"));

    for (const file of files) {
      const importedListener = (await import(`../../core-listeners/${file}`)).default;

      const listener: Listener = new importedListener(this);

      listener.once
        ? this.once(listener.options.event, (...args) => void listener.run!(...args))
        : this.on(listener.options.event, (...args) => void listener.run!(...args));
    }
  };

  private handleListeners = async () => {
    const files = readdirSync("dist/listeners").filter((f) => f.endsWith(".js"));

    for (const file of files) {
      const importedListener = (await import(`../../listeners/${file}`)).default;

      const listener: Listener = new importedListener(this);

      listener.once
        ? this.once(listener.options.event, (...args) => void listener.run!(...args))
        : this.on(listener.options.event, (...args) => void listener.run!(...args));
    }
  };

  public start = async (token: string) => {
    await this.handleCoreListeners();
    await this.handleListeners();
    await this.handleCommands();
    // await this.handleSlashCommands(token);

    Sentry.init({
      dsn: process.env.SENTRY_DSN!,
    });

    await this.login(token).catch((e) => {
      throw new Error("Failed to start client: " + e);
    });
  };
}
