export const asset = (path: string): string => `/assets/${path}`;

export const flag = (code: string): string => asset(`flags/${code}.png`);