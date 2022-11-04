import { Modal, NumberInput, Radio, TextInput } from '@mantine/core';
import { NodeWithIdProps } from 'lib-components/tree-view';
import { useCallback, useMemo, useState } from 'react';
import { isValueType } from './helper';
import { UpsertModalProps } from './type';

export default function Upsert(
  props: UpsertModalProps & {
    onChange: (arg: NodeWithIdProps) => void;
  }
) {
  const isPropNodeValueType = isValueType(props.node);

  const isUpdateAction = props.action === 'update';

  const prepareNode = useCallback(() => {
    return {
      ...props.node,
      dataType: isUpdateAction
        ? props.node.dataType
        : isPropNodeValueType
        ? 'string'
        : 'object',
    } as NodeWithIdProps;
  }, [props.node]);

  const [state, setState] = useState(prepareNode());

  const [kv, setKv] = useState((state.data || []) as [string, any]);

  // useEffect(() => {
  //   setState(prepareNode());
  // }, [prepareNode]);

  // useEffect(() => {
  //   setKv(state.data || []);
  // }, [state]);

  const isStateNodeValueType = isValueType(state);

  const [kvName, kvValue] = kv;

  const valueProps = useMemo(
    () => ({
      label: 'Value',
      placeholder: 'value',
      value: kvValue,
      onChange: (e: any) =>
        setKv(s => [s[0], typeof e === 'object' && e ? e.target.value : e]),
    }),
    [kvValue]
  );

  return (
    <>
      <Modal
        title={props.title}
        opened={props.open}
        onClose={() => props.onChange(state)}
      >
        <TextInput
          label='Key'
          placeholder='Key'
          value={kvName}
          onChange={e => {
            setKv(s => [e.target.value, s[1]]);
          }}
        />

        {isUpdateAction ? (
          <></>
        ) : (
          <>
            <Radio.Group
              label='Value Type'
              name='dataType'
              value={state.dataType}
              onChange={(dataType: NodeWithIdProps['dataType']) =>
                setState(s => ({ ...s, dataType }))
              }
            >
              {isPropNodeValueType ? (
                <>
                  <Radio value='string' label='String' />
                  <Radio value='number' label='Number' />
                  <Radio value='boolean' label='Boolean' />
                </>
              ) : (
                <>
                  <Radio value='object' label='Object' />
                  <Radio value='array' label='Array' />
                </>
              )}
            </Radio.Group>
          </>
        )}

        {isStateNodeValueType &&
          (state.dataType === 'boolean' ? (
            <Radio.Group {...valueProps}>
              <Radio value='true' label='true' />
              <Radio value='false' label='false' />
            </Radio.Group>
          ) : state.dataType === 'number' ? (
            <NumberInput {...valueProps} />
          ) : (
            <TextInput {...valueProps} />
          ))}
      </Modal>
    </>
  );
}
