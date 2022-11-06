import { Button, Modal, NumberInput, Radio, TextInput } from '@mantine/core';
import { NodeWithIdProps } from 'lib-components/tree-view';
import { useCallback, useMemo, useState } from 'react';
import { isValueType } from './helper';
import { ModalContainer } from './style';
import { UpsertModalProps } from './type';

export default function Upsert(
  props: UpsertModalProps & {
    onChange: (arg: NodeWithIdProps) => void;
  }
) {
  const isParentDataTypeArray = props.node?.data?.[2] === 'array';

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
      placeholder: 'Value',
      value: kvValue,
      onChange: (e: any) =>
        setKv(s => [s[0], typeof e === 'object' && e ? e.target.value : e]),
    }),
    [kvValue]
  );

  function onSubmit() {
    // const toSave = { ...state };
    // toSave.uniqName = kvName;
    // if (isStateNodeValueType) {
    //   toSave.data = [kvName, kvValue, toSave.data[2]];
    // } else {
    //   toSave.data = [toSave.data[0], { ...toSave.data[1], [kvName]: kvValue }, toSave.data[2]];
    // }
    // props.onChange(toSave);
  }

  return (
    <>
      <Modal
        title={props.title}
        opened={props.open}
        onClose={() => props.onChange(props.node)}
      >
        <ModalContainer>
          {isParentDataTypeArray ? (
            <></>
          ) : (
            <TextInput
              label='Key'
              placeholder='Key'
              value={kvName}
              onChange={e => {
                setKv(s => [e.target.value, s[1]]);
              }}
            />
          )}

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
              <Radio.Group
                {...valueProps}
                value={String(Boolean(valueProps.value))}
              >
                <Radio value='true' label='true' />
                <Radio value='false' label='false' />
              </Radio.Group>
            ) : state.dataType === 'number' ? (
              <NumberInput {...valueProps} />
            ) : (
              <TextInput {...valueProps} />
            ))}

          <Button type='button' onClick={onSubmit}>
            Save
          </Button>
        </ModalContainer>
      </Modal>
    </>
  );
}
