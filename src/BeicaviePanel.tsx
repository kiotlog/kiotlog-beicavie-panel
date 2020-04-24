import React, { useEffect, useState } from 'react';
import { PanelProps } from '@grafana/data';
import { FormField, Button } from '@grafana/ui';
import { BeicavieOptions } from 'types';
import axios from 'axios';
import moment from 'moment';

interface Props extends PanelProps<BeicavieOptions> {}

interface Annotation {
  Id: string;
  Description: string;
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
  // const [ annotation, setAnnotation ] = useState<Annotation | null>(null);
  const [name, setName] = useState('');
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
        // setAnnotation(res.data.Annotations?.[0] || null);
        setName(res.data.Meta.Description);
        setHives(res.data.Annotations?.[0]?.Data?.Hives || 0);
        setDescription(res.data.Annotations?.[0]?.Description || '');
      })
      .catch(err => {
        console.error(err);
      });
  }, [deviceName]);

  const onNameChange = (event: any) => {
    setName(event.target.value);
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

    // if (annotation) {
    //   // create new annotation
    //   console.log('PUTTING Annotation', annotation);
    //   axios
    //     .put(
    //       `${api}/annotations/${annotation.Id}`,
    //       {
    //         Description: description,
    //         Data: {
    //           Hives: hives,
    //         },
    //       },
    //       {
    //         headers: {
    //           'Content-Type': 'application/json',
    //         },
    //       }
    //     )
    //     .then(res => {
    //       if (res.status >= 300) {
    //         console.error('Error:', res.data);
    //         return;
    //       }
    //       setEditing(false);
    //     })
    //     .catch(err => {
    //       console.log('Error: ', err);
    //     });
    // } else
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
                Description: name
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
      {device && !editing && (
        <>
          <div
            style={{
              textAlign: 'right',
            }}
          >
            <Button variant="link" onClick={() => setEditing(true)}>
              Modifica
            </Button>
          </div>
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
            {hives}
          </h3>
          <p style={{ textAlign: 'center', fontSize: (props?.height || 288) / 9 }}>{description}</p>
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
            <FormField label="Nome Bilancia" type="text" value={name} onChange={onNameChange} />
            <FormField label="Arnie" type="number" value={hives} onChange={onInput} />
            {/* <input type="number" name="hives" className="input-small gf-form-input width-10" value={hives} onChange={onInput} /> */}

            <FormField
              label="Note"
              inputEl={<textarea className="gf-form-input width-25" value={description} onChange={handleDescriptionChange} />}
              accept="number"
            />
            {/* <textarea className="gf-form-input" value={description} onChange={handleDescriptionChange} /> */}

            {/* <Date value={} /> */}
            <FormField label="Data" type="text" defaultValue={begin.format('YYYY-MM-DD HH:mm:ss')} onBlur={onBeginInput} />
          </div>

          <div
            style={{
              textAlign: 'right',
              padding: '10px',
            }}
          >
            <Button variant="transparent" onClick={() => setEditing(false)}>
              Annulla
            </Button>
            <Button onClick={saveAnnotation}>Salva</Button>
          </div>
        </>
      )}
    </div>
  );
}
