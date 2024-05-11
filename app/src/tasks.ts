import { schedule } from "node-cron";
import { client } from "./index.js";

const removeWarns = async () => {
  const now = new Date();

  client.logger.debug("Checking for punishments...");

  const infractions = await client.db.infractions.findMany({
    where: {
      type: "Warn",
      expiresAt: {
        lt: now,
      },
    },
  });
  if (!infractions.length) return;

  for (const infraction of infractions) {
    await client.db.infractions
      .delete({
        where: infraction,
      })
      .then(() =>
        client.logger.debug(
          `Infraction ${infraction.type} in ${infraction.guildId} for ${infraction.memberId} has expired.`,
        ),
      );
  }
};

const updateMutes = async () => {
  const now = new Date();

  client.logger.debug("Checking for mutes.");

  const infractions = await client.db.infractions.findMany({
    where: {
      type: "Mute",
      expiresAt: {
        lt: now,
      },
    },
  });
  if (!infractions.length) return;

  for (const infraction of infractions) {
    await client.db.infractions
      .update({
        where: infraction,
        data: {
          expiresAt: null,
          invalid: true,
        },
      })
      .then(() =>
        client.logger.debug(
          `Infraction ${infraction.type} in ${infraction.guildId} for ${infraction.memberId} has been updated to be invalid.`,
        ),
      );
  }

  return client.logger.debug("Done checking for mutes.");
};

// Run every 1 minute.
schedule("* * * * *", async () => {
  await removeWarns();
  await updateMutes();
});
