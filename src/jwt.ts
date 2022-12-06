import * as jwt from 'jsonwebtoken';
import { config } from './config';

export const sign = (payload: any, options?: jwt.SignOptions): string => {
  return jwt.sign(payload, config.SECRET, options);
};

export const verify = <T = jwt.JwtPayload>(
  token: string,
  options?: jwt.VerifyOptions,
): T => {
  return <T>jwt.verify(token, config.SECRET, options);
};
