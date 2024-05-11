import { InfractionTypes, type Infractions } from "@prisma/client";
import { Duration } from "@sapphire/time-utilities";
import { Colors, EmbedBuilder, WebhookClient, time, type Message } from "discord.js";
import { type Client } from "../structures/Client.js";
import Checks from "./Checks.js";

export class BaseInfraction {
  public client: Client;
  public checks: Checks = new Checks();

  public type: InfractionTypes;
  public id: string;
  public reason: string;

  public guildId: string;
  public memberId: string;
  public moderatorId: string;

  public issuedAt: Date = new Date();
  public expiresAt: Date | null = null;
  public expiresAtString: string | null = null;

  public automod: boolean = false;
  public updated: boolean = false;

  public constructor(infraction: Infraction, client: Client) {
    this.client = client;

    this.type = infraction.type || InfractionTypes.Warn;
    this.id = infraction.id || "ID_NOT_FOUND";
    this.reason = infraction.reason;

    this.guildId = infraction.guildId;
    this.memberId = infraction.memberId;
    this.moderatorId = infraction.moderatorId;

    this.expiresAtString = infraction.expiresAtString || null;
    this.expiresAt = infraction.expiresAtString
      ? new Date(Date.now() + new Duration(infraction.expiresAtString).offset)
      : null;
  }

  public postInChannel = async (message: Message, infraction: Infractions) => {
    const user = await this.client.users.fetch(this.memberId);
    const formatter = await this.#format(infraction.type);

    const submitMessage = `${
      formatter.emojis! && formatter.emojis!.issued !== "" ? formatter.emojis!.issued + " " : ""
    }${this.#addCharcters(infraction).charAt(0).toUpperCase()}${this.#addCharcters(infraction)
      .slice(1)
      .toLowerCase()} ${user} \`(${user.id})\` for \`${this.reason}\` with infraction ID \`${infraction.id}\``;

    return message.channel.send({
      embeds: [
        {
          color: formatter.colour!,
          description: submitMessage,
        },
      ],
    });
  };

  public sendDm = async (message: Message, infraction: Infractions) => {
    const user = await this.client.users.fetch(this.memberId);

    const dmContent = `Hello **${user.username}**, you've been **${this.#addCharcters(infraction)}** ${
      infraction.type === InfractionTypes.Ban ? "from" : "in"
    } \`${message.guild!.name}\` for \`${this.reason}\`${
      this.expiresAt ? ` and it will expire ${time(this.expiresAt, "R")}` : ""
    }`;

    if (this.type !== "Unmute")
      return user
        .send({
          embeds: [
            {
              author: {
                name: this.client.user!.tag,
                icon_url: this.client.user!.displayAvatarURL(),
              },
              title: `Case #\`${infraction.id}\``,
              description: dmContent,
              fields: [
                {
                  name: "Is this punishment false?",
                  value: `> If you believe this punishment is false, you can contact a staff member and provide them with this ID: \`${infraction.id}\``,
                },
              ],
            },
          ],
        })
        .catch(() => null);
    else
      return user
        .send({
          embeds: [
            {
              author: {
                name: this.client.user!.tag,
                icon_url: this.client.user!.displayAvatarURL(),
              },
              title: `Case #\`${infraction.id}\``,
              description: dmContent,
            },
          ],
        })
        .catch(() => null);
  };

  public getModLog = async (message: Message, infraction: Infractions) => {
    const formatter = await this.#format(infraction.type);

    const user = await this.client.users.fetch(this.memberId);
    const moderator = await this.client.users.fetch(this.moderatorId);

    const logEmbed = new EmbedBuilder()
      .setColor(formatter.colour!)
      .setAuthor({
        name: message.guild!.name,
        iconURL: message.guild!.iconURL() || this.client.user!.displayAvatarURL(),
      })
      .setTitle(`${this.type} \`(Case #${infraction.id})\``)
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
          value: `> ${this.reason}`,
        },
        {
          name: "Issued On",
          value: `> ${time(this.issuedAt, "F")}`,
        },
      ]);

    if (this.expiresAt)
      logEmbed.addFields([
        {
          name: "Expires",
          value: `> ${time(this.expiresAt, "F")} (${time(this.expiresAt, "R")})`,
        },
      ]);

    return logEmbed;
  };

  public getWebhookClient = () => {
    const webhookClient = new WebhookClient({ url: process.env.MODERATION_LOG_WEBHOOK! });
    return webhookClient;
  };

  public saveToDatabase = () => {
    return this.client.db.infractions.create({
      data: {
        type: this.type,
        expiresAt: this.expiresAtString ? this.expiresAt : null,
        reason: this.reason,
        memberId: this.memberId,
        moderatorId: this.moderatorId,
        guildId: this.guildId,
      },
    });
  };

  #addCharcters = (infraction: Infractions) =>
    `${infraction.type.toLowerCase()}${
      infraction.type === InfractionTypes.Ban || infraction.type === InfractionTypes.Unban
        ? "ned"
        : infraction.type === InfractionTypes.Mute || infraction.type === InfractionTypes.Unmute
          ? "d"
          : "ed"
    }`;

  #format = async (type: InfractionTypes) => {
    let format: FormatterValue = {
      colour: null,
      emojis: null,
    };

    switch (type) {
      case "Warn":
        format = {
          colour: Colors.Yellow,
          emojis: {
            issued: ":warning:",
            dm: ":warning:",
          },
        };
        break;
      case "Mute":
        format = {
          colour: Colors.Yellow,
          emojis: {
            issued: ":no_entry_sign:",
            dm: ":no_entry_sign:",
          },
        };
        break;
      case "Ban":
        format = {
          colour: Colors.Red,
          emojis: {
            issued: ":no_entry_sign:",
            dm: ":no_entry_sign:",
          },
        };
        break;
      case "Unban":
        format = {
          colour: Colors.Green,
          emojis: {
            issued: ":white_check_mark:",
            dm: null,
          },
        };
        break;
      case "Unmute":
        format = {
          colour: Colors.Green,
          emojis: {
            issued: ":white_check_mark:",
            dm: null,
          },
        };
        break;
      default:
        format = { colour: Colors.DarkButNotBlack };
        break;
    }

    return { colour: format.colour, emojis: format.emojis };
  };
}

export interface Infraction {
  type?: InfractionTypes;
  id?: string;
  reason: string;

  guildId: string;
  memberId: string;
  moderatorId: string;

  issuedAt?: Date;
  expiresAtString?: string | null;

  updated?: boolean;
}

interface FormatterValue {
  colour: null | number;
  emojis?: null | {
    issued: string | null;
    dm: string | null;
  };
}
