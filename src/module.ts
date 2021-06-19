import { PanelPlugin } from '@grafana/data';
import { BeicavieOptions } from './types';
import { BeicaviePanel } from './BeicaviePanel';

export const plugin = new PanelPlugin<BeicavieOptions>(BeicaviePanel).setPanelOptions((builder) => {
  builder
    .addTextInput({
      name: 'Title',
      path: 'title',
      defaultValue: 'Dettagli Bilancia',
      description: 'boh',
    })
    .addTextInput({
      name: 'Api',
      path: 'api',
      defaultValue: 'http://localhost:8888',
      description: 'basePath della API Beicavie',
    })
    .addTextInput({
      name: 'Api Key',
      path: 'apiKey',
      defaultValue: '',
      description: 'Chiave per la API',
    })
    .addTextInput({
      name: 'Device',
      path: 'device',
      defaultValue: '',
      description: 'Dispositivo da gestire',
    })
    .addSelect({
      name: 'Mode',
      path: 'mode',
      defaultValue: 0,
      description: 'Modalità di modifica dei dati',
      settings: {
        options: [
          {
            value: 0,
            label: 'modifica tutto',
          },
          {
            value: 1,
            label: 'modifica solo descrizione bilancia',
          },
          {
            value: 2,
            label: 'modifica solo numero arnie',
          },
          {
            value: 3,
            label: 'modifica solo delle note',
          },
        ],
      },
    });
});
// .setDefaults(defaults).setEditor(BeicavieEditor);
