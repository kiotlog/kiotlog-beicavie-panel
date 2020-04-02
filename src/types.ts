export interface BeicavieOptions {
  title: string;
  api: string;
  device: string;
}

export const defaults: BeicavieOptions = {
  title: 'Dettagli Bilancia',
  api: 'http://localhost:8888',
  device: '',
};
