export class ArgumentFailed extends Error {
  public override name: string = "ArgumentFailed";
  public reason: string;
  public override message: string;

  public constructor(reason: string) {
    super(`A \`${reason}\` argument is required for this command.`);

    this.reason = reason;
    this.message = `A \`${reason}\` argument is required for this command.`;
  }
}

export class GenericFailure extends Error {
  public override name: string = "GenericFailure";
  public override message: string;

  public constructor(message: string) {
    super(message);

    this.message = message;
  }
}

export class PublicFailure extends Error {
  public override name: string = "PublicFailure";
  public override message: string;

  public constructor(message: string) {
    super(message);

    this.message = message;
  }
}

export class CommandRunFailure extends Error {
  public override name: string = "CommandRunFailure";
  public reason: string;
  public override message: string;

  public constructor(reason: string) {
    super(`Failed to run a command due to "${reason}"`);

    this.reason = reason;
    this.message = `Failed to run a command due to "${reason}"`;
  }
}
