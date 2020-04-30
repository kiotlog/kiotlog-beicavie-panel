import React, { PureComponent } from 'react';
import { FormField } from '@grafana/ui';
import { PanelEditorProps } from '@grafana/data';

import { BeicavieOptions } from './types';

export class BeicavieEditor extends PureComponent<PanelEditorProps<BeicavieOptions>> {
  onTextChanged = ({ target }: any) => {
    this.props.onOptionsChange({ ...this.props.options, title: target.value });
  };

  onApiChanged = ({ target }: any) => {
    this.props.onOptionsChange({ ...this.props.options, api: target.value });
  };

  onDeviceChanged = ({ target }: any) => {
    this.props.onOptionsChange({ ...this.props.options, device: target.value });
  };

  onModeChanged = ({ target }: any) => {
    this.props.onOptionsChange({ ...this.props.options, mode: target.value });
  };

  render() {
    const { options } = this.props;

    return (
      <div className="section gf-form-group">
        <h5 className="section-heading">Display</h5>
        <FormField label="Title" labelWidth={5} inputWidth={20} type="text" onChange={this.onTextChanged} value={options.title || ''} />
        <hr />
        <FormField label="Api" labelWidth={5} inputWidth={20} type="url" onChange={this.onApiChanged} value={options.api || ''} />
        <hr />
        <FormField label="Device" labelWidth={5} inputWidth={20} type="text" onChange={this.onDeviceChanged} value={options.device || ''} />
        <hr />
        <p>0 - modifica tutto</p>
        <p>1 - modifica solo descrizione bilancia</p>
        <p>2 - modifica solo numero arnie</p>
        <p>3 - modifica solo delle note</p>
        <FormField label="Mode" labelWidth={5} inputWidth={5} type="number" onChange={this.onModeChanged} value={options.mode || ''} />
      </div>
    );
  }
}
