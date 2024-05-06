import {
  type ClientOptions as DiscordClientOptions,
  GatewayIntentBits,
  Partials,
  Collection,
  Guild,
  OAuth2Guild,
} from "discord.js";
import type { Command } from "../structures/Command.js";
import type Listener from "../structures/Listener.js";

export const ClientOptions: ClientOptions = {
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message],
  allowedMentions: {
    parse: [],
  },
  defaultPrefix: "wts!",
  developer: "840213882147831879",
};

export interface ClientOptions extends DiscordClientOptions {
  defaultPrefix?: string | null;
  developer?: string | string[] | null;
}

export interface GuildCooldowns {
  commands?: Set<string>;
  messages?: Set<string>;
  errorMessages?: Set<string>;
}

export interface RawGuildStore {
  guild: Guild | OAuth2Guild;
  config?: GuildConfigOptions;
  cooldowns?: {
    commands?: Set<string>;
    messages?: Set<string>;
    errorMessages?: Set<string>;
  };
}

export type ClientStoresTypes =
  | Collection<string, Command>
  | Collection<string, Listener>
  | Collection<string, string>
  | Collection<string, string[]>
  | Collection<string, RawGuildStore>;

export interface GuildConfigOptions {
  permissions?: {
    staff?: { roles: string[]; nodes: string[]; users?: string[] };
  };
  channels?: { commands: string; prohibited?: string[] };
  roles?: { level_roles?: LevelRoles; prohibited?: string[]; allStaff?: string; staff?: StaffRoles };
}

interface StaffRoles {
  tmod: string[];
  mod: string[];
  hmod: string[];
  admin: string[];
  owner: string[];
}

interface LevelRoles {
  [5]: string;
  [10]: string;
  [20]: string;
  [25]: string;
  [30]: string;
  [45]: string;
  [50]: string;
  [60]: string;
  [65]: string;
}
