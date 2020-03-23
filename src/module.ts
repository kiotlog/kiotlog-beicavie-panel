import { PanelPlugin } from '@grafana/data';
import { BeicavieOptions, defaults } from './types';
import { BeicaviePanel } from './BeicaviePanel';
import { BeicavieEditor } from './BeicavieEditor';

export const plugin = new PanelPlugin<BeicavieOptions>(BeicaviePanel).setDefaults(defaults).setEditor(BeicavieEditor);
