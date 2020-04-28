import React, { useEffect, useState } from 'react';
import { PanelProps } from '@grafana/data';
import { FormField, Button } from '@grafana/ui';
import { BeicavieOptions } from 'types';
import axios from 'axios';
import moment from 'moment';

interface Props extends PanelProps<BeicavieOptions> { }

interface Annotation {
  Id: string;
  Description: string;
  UserDescription: string;
  Data: {
    Hives: number;
  };
}
interface Device {
  Id: string;
  Device: string;
  Annotations: Annotation[];
}

export function BeicaviePanel(props: Props) {
  const { options, width, height } = props;
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [userdesc, setUserDesc] = useState('');
  const [hives, setHives] = useState(0);
  const [description, setDescription] = useState('');
  const [begin, setBegin] = useState(moment());
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setDeviceName(props.replaceVariables(options.device));
  });

  useEffect(() => {
    if (!deviceName) {
      return;
    }
    const api = props.replaceVariables(options.api?.replace(/\/*$/, ''));
    // console.log(`API is ${api}`);
    // console.log('THE DEVICE:', deviceName);
    axios
      .get(`${api}/devices/${deviceName}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(res => {
        if (res.status !== 200) {
          console.log('error getting device info');
          return;
        }
        setDevice(res.data);
        setUserDesc(res.data.Meta.UserDescription);
        setHives(res.data.Annotations?.[0]?.Data?.Hives || 0);
        setDescription(res.data.Annotations?.[0]?.Description || '');
      })
      .catch(err => {
        console.error(err);
      });
  }, [deviceName]);

  const onUserDescChange = (event: any) => {
    setUserDesc(event.target.value);
  };

  const handleDescriptionChange = (event: any) => {
    setDescription(event.target.value);
  };

  const onInput = (event: any) => {
    setHives(event.target.value);
  };

  const onBeginInput = (event: any) => {
    const newDate = moment(event.target.value);

    if (newDate.isValid()) { setBegin(newDate); }
  };

  const saveAnnotation = (event: any) => {
    const api = props.replaceVariables(options.api?.replace(/\/*$/, ''));

    if (device) {
      // modify annotation
      axios
        .post(
          `${api}/devices/${device.Id}/annotations`,
          {
            Description: description,
            Data: {
              Hives: hives,
            },
            Begin: begin.toDate(),
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
        .then(res => {
          if (res.status >= 300) {
            console.error('Error:', res.data);
            return;
          }
          axios
            .put(`${api}/devices/${device.Id}`,
              {
                Meta: {
                  UserDescription: userdesc
                }
              })
            .then(res => {
              if (res.status >= 300) {
                console.error('Error:', res.data);
                return;
              }
              setEditing(false);
            })
            .catch(err => {
              console.log('Error: ', err);
            });
        })
        .catch(err => {
          console.log('Error: ', err);
        });
    } else {
      console.error('Could not save annotation... I have no device');
    }
  };

  // console.log(props);

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h3 style={{ textAlign: 'center' }}>
        {options.title} {device?.Device}
      </h3>

      {device && !editing && options.mode == 0 && (
        <h4 style={{ textAlign: 'center', fontSize: 14 }}>
          {userdesc}
        </h4>
      )}

      {device && !editing && options.mode == 1 && (
        <h4 style={{ textAlign: 'center', fontSize: 24 }}>
          {userdesc}
        </h4>
      )}


      {device && !editing && (
        <>
          <div
            style={{
              textAlign: 'center',
            }}
          >
            <Button variant="link" onClick={() => setEditing(true)}>
              modifica i dati della bilancia
            </Button>
          </div>

          {(options.mode == 0 || options.mode == 2) && (
            <h3
              style={{
                textAlign: 'center',
                fontSize: (props?.height || 248) / 2 / 1.2,
                display: 'flex',
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img src="public/img/plugins/arnia.svg" alt="error" width="100" height="100" />
              {hives}
            </h3>
          )}

          {options.mode == 0 && (
            <p style={{
              textAlign: 'center',
              fontSize: (props?.height || 248) / 18,
            }}>{description}</p>
          )}

          {options.mode == 3 && (
            <p style={{
              textAlign: 'center',
              fontSize: 24,
            }}>{description}</p>
          )}

        </>
      )}
      {device && editing && (
        <>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              alignItems: 'left',
              justifyContent: 'center',
            }}
          >
            {(options.mode == 0 || options.mode == 1) && (
              <FormField
                label="Bilancia"
                inputEl={<textarea className="gf-form-input width-25" value={userdesc} onChange={onUserDescChange} />}
                accept="number"
              />
            )}
            {(options.mode == 0 || options.mode == 2) && (
              <FormField label="Arnie" inputWidth={5} type="number" value={hives} onChange={onInput} />
            )}
            {(options.mode == 0 || options.mode == 3) && (
              <FormField
                label="Note"
                inputEl={<textarea className="gf-form-input width-25" value={description} onChange={handleDescriptionChange} />}
                accept="number"
              />
            )}
            <FormField label="Data" inputWidth={15} type="text" defaultValue={begin.format('DD-MM-YYYY HH:mm:ss')} onBlur={onBeginInput} />
          </div>

          <div
            style={{
              textAlign: 'right',
              padding: '10px',
            }}
          >
            <Button variant="transparent" onClick={() => setEditing(false)}>
              esci senza salvare
            </Button>
            <Button onClick={saveAnnotation}>salva le modifiche</Button>
          </div>
        </>
      )}
    </div>
  );
}