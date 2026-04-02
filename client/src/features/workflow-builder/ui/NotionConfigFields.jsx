import { ActionConfigForm } from './ActionConfigForm';

export function NotionConfigFields({ fields, values, onChange }) {
  return <ActionConfigForm fields={fields} values={values} onChange={onChange} />;
}
