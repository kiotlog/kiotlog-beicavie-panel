import React, { useEffect, useState } from 'react';
import { PanelProps } from '@grafana/data';
import { FormField, Button } from '@grafana/ui';
import { BeicavieOptions } from 'types';
import axios from 'axios';

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
  const [ device, setDevice ] = useState<Device | null>(null);
  const [ annotation, setAnnotation ] = useState<Annotation | null>(null);
  const [ hives, setHives ] = useState(0);
  const [ description, setDescription ] = useState('');
  const [ editing, setEditing ] = useState(false);

  useEffect(() => {
    if (!options.device) { return; }
    const replacedDevice = props.replaceVariables(options.device);
    console.log('THE DEVICE:', replacedDevice);
    axios
      .get(`http://127.0.0.1:8888/devices/${replacedDevice}`, {
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
        setAnnotation(res.data.Annotations?.[0] || null);
        setHives(res.data.Annotations?.[0]?.Data?.Hives || 0);
        setDescription(res.data.Annotations?.[0]?.Description || '');
      })
      .catch(err => {
        console.error(err);
      });
  }, [options.device]);

  const handleDescriptionChange = (event: any) => {
    setDescription(event.target.value);
  };

  const onInput = (event: any) => {
    setHives(event.target.value);
  };

  const saveAnnotation = (event: any) => {
    if (annotation) {
      // create new annotation
      console.log('PUTTING Annotation', annotation);
      axios
        .put(
          `http://127.0.0.1:8888/annotations/${annotation.Id}`,
          {
            Description: description,
            Data: {
              Hives: hives,
            },
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
          setEditing(false);
        })
        .catch(err => {
          console.log('Error: ', err);
        });
    } else if (device) {
      // modify annotation
      axios
        .post(
          `http://127.0.0.1:8888/devices/${device.Id}/annotations`,
          {
            Description: description,
            Data: {
              Hives: hives,
            },
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
          setEditing(false);
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
            <Button variant="transparent" onClick={() => setEditing(true)}>
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
            <FormField label="Arnie" type="number" value={hives} onChange={onInput} />
            {/* <input type="number" name="hives" className="input-small gf-form-input width-10" value={hives} onChange={onInput} /> */}

            <FormField
              label="Note"
              inputEl={<textarea className="gf-form-input width-25" value={description} onChange={handleDescriptionChange} />}
              accept="number"
            />
            {/* <textarea className="gf-form-input" value={description} onChange={handleDescriptionChange} /> */}
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
