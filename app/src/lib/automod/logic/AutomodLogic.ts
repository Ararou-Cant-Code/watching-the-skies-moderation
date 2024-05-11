import { InfractionTypes } from "@prisma/client";
import type { Message } from "discord.js";
import { BanInfraction } from "../../infractions/Ban.js";
import type { Client } from "../../structures/Client.js";
import { WarnInfraction } from "../../infractions/Warn.js";

export class AutomodLogic {
  private static MAX_MUTES_UNTIL_BAN: number = 5;
  private static MAX_WARNS_UNTIL_MUTE: number = 3;
  private static MAX_WARNS_IN_5_MINUTES_UNTIL_MUTE: number = 2;

  public getLogic = async (message: Message) => {
    const infractions = await (message.client! as Client).db.infractions.findMany({
      where: {
        guildId: message.guild!.id,
        memberId: message.author.id,
        moderatorId: message.client.user!.id,
      },
    });

    // Get all the warns the member has issued on them.
    const warns = infractions.filter(
      (strike) => strike.type === InfractionTypes.Warn && strike.issuedAt.getDate() === new Date(Date.now()).getDate(),
    ).length;

    // Get all the mutes issued on the member.
    const mutes = infractions.filter((strike) => strike.type === InfractionTypes.Mute).length;

    // Filter infractions to see if a member was warned in the past 5 minutes.
    const warnedInPastFiveMins = infractions.filter(
      (strike) => strike.type === InfractionTypes.Warn && strike.issuedAt >= new Date(Date.now() - 5 * 60 * 1000),
    ).length;

    if (mutes >= AutomodLogic.MAX_MUTES_UNTIL_BAN) return AutomodLogic.Types.BAN;

    if (
      warnedInPastFiveMins === AutomodLogic.MAX_WARNS_IN_5_MINUTES_UNTIL_MUTE &&
      mutes < AutomodLogic.MAX_MUTES_UNTIL_BAN
    )
      return AutomodLogic.Types.SPECIAL_MUTE;

    if (warns >= AutomodLogic.MAX_WARNS_UNTIL_MUTE && mutes < AutomodLogic.MAX_MUTES_UNTIL_BAN)
      return AutomodLogic.Types.STANRDARD_MUTE;

    if (warns < 3) return AutomodLogic.Types.WARN;
  };

  public handleInfraction = async (message: Message, reason: string) => {
    const logic = await this.getLogic(message);

    switch (logic) {
      case "BAN": {
        const infraction = new BanInfraction(
          {
            guildId: message.guild!.id,
            memberId: message.author.id,
            moderatorId: message.client.user!.id,
            reason: "`Automod`: Reaching the maxinum amount of mutes required for a ban.",
          },
          message.client! as Client,
        );
        const issued = await infraction.saveToDatabase();

        await infraction.sendDm(message, issued);
        await message.guild!.members.ban(message.author.id, { reason: issued.reason });

        return "DONE";
      }
      case "WARN": {
        const infraction = new WarnInfraction(
          {
            guildId: message.guild!.id,
            memberId: message.author.id,
            moderatorId: message.client.user!.id,
            reason: "`Automod`: " + reason,
            expiresAtString: "1d",
          },
          message.client! as Client,
        );
        const issued = await infraction.saveToDatabase();

        await infraction.sendDm(message, issued);
        await infraction.postInChannel(message, issued);

        return "DONE";
      }
    }
  };
}

export namespace AutomodLogic {
  export enum Types {
    BAN = "BAN",
    STANRDARD_MUTE = "STANDARD_MUTE",
    SPECIAL_MUTE = "SPECIAL_MUTE",
    WARN = "WARN",
  }
}
