import type { Message } from "discord.js";
import { AutomodLogic } from "../logic/AutomodLogic.js";

export default class TestAutomodModule {
  public logic: AutomodLogic;

  public constructor() {
    this.logic = new AutomodLogic();
  }

  public run = async (message: Message) => {
    if (message.guild!.id !== "1235442068189347840") return false;

    if (message.content.includes("test")) {
      return this.logic.handleInfraction(message, "Sending test.");
    }
  };
}
