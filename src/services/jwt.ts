import { JwtPayload, sign, verify, SignOptions, VerifyOptions } from 'jsonwebtoken';
import { Config } from '../config';

export class JwtService {
  private config: Config;

  constructor({ config }) {
    this.config = config;
  }

  sign(payload: any, options?: SignOptions): string {
    return sign(payload, this.config.SECRET, options);
  }

  verify<T = JwtPayload>(token: string, options?: VerifyOptions): T {
    return <T>verify(token, this.config.SECRET, options);
  }

  dispose(): void {}
}
