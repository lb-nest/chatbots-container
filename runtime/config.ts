export class ConfigByEnvironment {
  [key: string]: any;

  constructor() {
    Object.assign(this, Deno.env.toObject());
  }
}
