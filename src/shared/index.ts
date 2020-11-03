import { env } from '../config';

export const baseUrl: string = `${env.host}:${String(env.port)}/`;
export const staticUrl: string = baseUrl + 'uploads/';