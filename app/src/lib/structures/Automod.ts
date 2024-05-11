import type { Awaitable, Message } from "discord.js";

export default class Automod {
  public run = async (message: Message, modules: AutomodModules) => {
    var i = modules.length;

    while (i--) if (await modules[i].run(message)) break;
  };
}

type AutomodModules = { run: (message: Message) => Awaitable<any> }[];
