import { ActionConfigForm } from './ActionConfigForm';

export function SlackConfigFields({ fields, values, onChange }) {
  return <ActionConfigForm fields={fields} values={values} onChange={onChange} />;
}
