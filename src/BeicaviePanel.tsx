import React, { useEffect, useState } from 'react';
import { PanelProps } from '@grafana/data';
import { FormField, Button } from '@grafana/ui';
import { BeicavieOptions } from 'types';
import axios, { AxiosError } from 'axios';
import moment from 'moment-timezone';

interface Props extends PanelProps<BeicavieOptions> {}

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
  Meta: { UserDescription: string };
}

interface Error {
  status?: number;
  statusText?: string;
  message: string;
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
  const [error, setError] = useState<Error | null>(null);

  const api = props.replaceVariables(options.api?.replace(/\/*$/, ''));
  const axiosConfig = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${options.apiKey}`,
    },
  };

  useEffect(() => {
    setDeviceName(props.replaceVariables(options.device));
  });

  const handleAxiosError = (error: AxiosError<any> | Error) => {
    const err = error as any;
    if (err.isAxiosError && err.response) {
      const { status, statusText } = err.response;
      const message = err.response.data;
      console.error('AxiosError getting device info', err.response);
      setError({ status, statusText, message });
    } else {
      const error = err as Error;
      const { message } = error;
      console.error('Error getting device info', err);
      setError({ message });
    }
  };

  const updateDevice = (device: Device) => {
    setDevice(device);
    setUserDesc(device.Meta.UserDescription);
    setHives(device.Annotations?.[0]?.Data?.Hives || 0);
    setDescription(device.Annotations?.[0]?.Description || '');
  };

  const fetchDevice = async (deviceName: string) => {
    // console.log(`API is ${api}`);
    // console.log('THE DEVICE:', deviceName);

    try {
      const res = await axios.get(`${api}/devices/${deviceName}`, axiosConfig);

      // if (res.status !== 200) {
      //   console.error('error getting device info');
      //   return null;
      // }
      updateDevice(res.data);
    } catch (err) {
      handleAxiosError(err);
    }

    return device;
  };

  const saveDevice = async () => {
    if (!device) {
      console.error('Could not save device... I have no device');
      return;
    }

    const res = await axios.put(
      `${api}/devices/${device.Id}`,
      {
        Meta: {
          UserDescription: userdesc,
        },
      },
      axiosConfig
    );
    updateDevice(res.data);
  };

  const createAnnotation = async () => {
    if (!device) {
      console.error('Could not create annotation... I have no device');
      return;
    }

    const res = await axios.post(
      `${api}/devices/${device.Id}/annotations`,
      {
        Description: description,
        Data: {
          Hives: hives,
        },
        Begin: begin.toDate(),
      },
      axiosConfig
    );

    setHives(res.data.Data?.Hives || 0);
    setDescription(res.data.Description || '');
  };

  useEffect(() => {
    setError(null);
    if (deviceName) {
      fetchDevice(deviceName);
    }
  }, [deviceName]);

  const onEditButton = () => {
    setBegin(moment());
    setEditing(true);
  }

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
    const newDate = moment.tz(event.target.value, 'DD-MM-YYYY HH:mm:ss', 'Europe/Rome');

    if (newDate.isValid()) {
      setBegin(newDate);
    }
  };

  const saveAnnotation = async (event: any) => {
    setError(null);
    try {
      await createAnnotation();
      await saveDevice();
      setEditing(false);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const errorJsx = error && (
    <div
      style={{
        textAlign: 'center',
        color: 'red',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'center',
      }}
    >
      <h3>Error {error.status}</h3>
      <p>{error.message || error.statusText}</p>
    </div>
  );

  const handleImage404Error = (e: { target: any; }) => {
    // public/img/plugins/arnia.svg
    // public/plugins/kiotlog-hives-panel/img/arnia.svg
    // public/img/critical.svg

    const img = e.target;

    switch (img.dataset.imgIdx) {
      case '1':
        img.src = 'public/plugins/kiotlog-hives-panel/img/arnia.svg';
        break;
      default:
        img.src = 'public/img/critical.svg';
        img.alt = '404';
        break;
    }

    img.dataset.imgIdx++;
  }

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

      {device && !editing && options.mode == 0 && <h4 style={{ textAlign: 'center', fontSize: 14 }}>{userdesc}</h4>}

      {device && !editing && options.mode == 1 && <h4 style={{ textAlign: 'center', fontSize: 24 }}>{userdesc}</h4>}

      {errorJsx}
      {device && !editing && (
        <>
          <div
            style={{
              textAlign: 'center',
            }}
          >
            <Button onClick={onEditButton}>modifica i dati della bilancia</Button>
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

              <img src={'public/img/plugins/arnia.svg'} data-img-idx={1} style={{width: 120, height: 120}} onError={handleImage404Error} />

              {hives}
            </h3>
          )}

          {options.mode == 0 && (
            <p
              style={{
                textAlign: 'center',
                fontSize: (props?.height || 248) / 18,
              }}
            >
              {description}
            </p>
          )}

          {options.mode == 3 && (
            <p
              style={{
                textAlign: 'center',
                fontSize: 24,
              }}
            >
              {description}
            </p>
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
                inputEl={<textarea className="gf-form-input width-auto" value={userdesc} onChange={onUserDescChange} />}
                accept="number"
              />
            )}
            {(options.mode == 0 || options.mode == 2) && <FormField label="Arnie" inputWidth={5} type="number" value={hives} onChange={onInput} />}
            {(options.mode == 0 || options.mode == 3) && (
              <FormField
                label="Note"
                inputEl={<textarea className="gf-form-input width-auto" value={description} onChange={handleDescriptionChange} />}
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
