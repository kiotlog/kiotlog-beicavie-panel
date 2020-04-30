export interface BeicavieOptions {
  title: string;
  api: string;
  device: string;
  mode: number;
}

export const defaults: BeicavieOptions = {
  title: 'Dettagli Bilancia',
  api: 'http://localhost:8888',
  device: '',
  mode: 0,
};
