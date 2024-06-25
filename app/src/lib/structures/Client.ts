import { Collection, Client as DiscordClient, type ClientOptions as DiscordClientOptions } from "discord.js";
import { ClientOptions, type ClientStoresTypes } from "../utils/constants.js";
import { readdirSync } from "node:fs";
import Logger from "@ptkdev/logger";
import Listener from "./Listener.js";
import { type Command } from "./Command.js";
import Sentry from "@sentry/node";
import { PrismaClient } from "@prisma/client";
import SentryHandler from "../classes/SentryHandler.js";

const listenersCollection: Collection<string, Listener> = new Collection();

const commandsCollection: Collection<string, Command> = new Collection();
const aliasesCollection: Collection<string, string> = new Collection();

export class Client extends DiscordClient {
  public sentryHandler = new SentryHandler({ client: this }, { sendEmbed: true, sendLogToConsole: true });
  public logger = new Logger();
  public db = new PrismaClient();

  public developerId?: string = "840213882147831879";
  public defaultPrefix?: string = "wts!";

  public stores: Collection<string, ClientStoresTypes> = new Collection();

  public constructor(options: DiscordClientOptions & ClientOptions) {
    super(options);
  }

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

        commandsCollection.set(command.name.toLowerCase(), command);
        this.stores.set("commands", commandsCollection);

        if (command.aliases)
          command.aliases.forEach((alias) => aliasesCollection.set(alias.toLowerCase(), command.name.toLowerCase()));

        this.stores.set("aliases", aliasesCollection);
      }
    }
  };

  private handleCoreListeners = async () => {
    const files = readdirSync("dist/core-listeners").filter((f) => f.endsWith(".js"));

    for (const file of files) {
      const importedListener = (await import(`../../core-listeners/${file}`)).default;

      const listener: Listener = new importedListener(this);

      listenersCollection.set(listener.name, listener);
      this.stores.set("listeners", listenersCollection);

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

      listenersCollection.set(listener.name, listener);
      this.stores.set("listeners", listenersCollection);

      listener.once
        ? this.once(listener.options.event, (...args) => void listener.run!(...args))
        : this.on(listener.options.event, (...args) => void listener.run!(...args));
    }
  };
}
