import {
  Button,
  Modal,
  NumberInput,
  Radio,
  Textarea,
  TextInput,
} from '@mantine/core';
import { AcceptedDataType, AllDataType } from 'lib-components/tree-view';
import { useCallback, useMemo, useState } from 'react';
import { getValueByType, stopActionDefEvent } from './helper';
import { ModalForm } from './style';
import { UpsertModalProps } from './type';

const basicDt: AllDataType[] = ['string', 'number', 'bigint', 'boolean'];
const containerDt: AllDataType[] = ['object', 'array'];

export default function Upsert(
  props: UpsertModalProps & {
    onUpdate: (args: {
      close: boolean;
      prevPath?: string[];
      newPath: string[];
      newPathValue: any;
    }) => void;
  }
) {
  const isActionAdd = props.action === 'add';
  const isActionUpdate = props.action === 'update';

  const checks = {
    isParentArray: props.node.data?.parentDataType === 'array',
    isParentObject: props.node.data?.parentDataType === 'object',
    isSelfObject: props.node.dataType === 'object',
    isSelfArray: props.node.dataType === 'array',
  };

  const prepareNode = useCallback(() => {
    const isUpdate = props.action === 'update';
    return {
      name: isUpdate ? props.node.uniqName : '',
      value: isUpdate ? props.node.data?.value : '',
      valueType: isUpdate
        ? props.node.dataType
        : basicDt.includes(props.node.dataType)
        ? 'string'
        : 'object',
    };
  }, [props]);

  const [state, setState] = useState(prepareNode());

  // useEffect(() => {
  //   setState(prepareNode());
  // }, [prepareNode]);

  // useEffect(() => {
  //   setKv(state.data || []);
  // }, [state]);

  function onSubmit(e) {
    stopActionDefEvent(e);
    const { isParentArray, isParentObject, isSelfObject, isSelfArray } = checks;
    const toSave = { ...props.node };
    const dataName = toSave.data.name;
    const dataPath = toSave.data.path;
    let dataValue = toSave.data.value;
    if (isActionAdd) {
      const stateValue = getValueByType[state.valueType](state.value);
      if (isSelfArray) {
        dataValue ??= [];
        dataValue.push(stateValue);
      }
      if (isSelfObject) {
        dataValue ??= {};
        dataValue[state.name] = stateValue;
      }
      const newPath = dataPath;
      const newPathValue = dataValue;
      return props.onUpdate({ close: false, newPath, newPathValue });
    }
    if (isActionUpdate) {
      if (isSelfArray || isSelfObject) {
        const newPaths = [...dataPath];
        newPaths.pop();
        newPaths.push(state.name);
        const prevPath = dataPath;
        const newPath = newPaths;
        const newPathValue = dataValue;
        props.onUpdate({ close: false, prevPath, newPath, newPathValue });
      } else {
        if (isParentArray) {
          debugger;
        } else if (isParentObject) {
          debugger;
        }
      }
    }
  }

  const CompKey = useMemo(() => {
    const { isParentArray, isParentObject, isSelfObject, isSelfArray } = checks;
    const KeyInput = (
      <Textarea
        label='Key'
        placeholder='New key name'
        value={state.name}
        autosize
        minRows={1}
        onChange={e => {
          setState(s => ({ ...s, name: e.target.value } as any));
        }}
      />
    );

    if (isActionAdd) {
      if (isSelfArray) {
        return <></>;
      }
      if (isSelfObject || isParentObject) {
        return KeyInput;
      }
    }

    if (isActionUpdate && isParentArray && basicDt.includes(state.valueType)) {
      return <></>;
    }

    return KeyInput;
  }, [state.name, props.node, isActionAdd, isActionUpdate, checks]);

  const CompValueType = useMemo(() => {
    return isActionAdd ? (
      <Radio.Group
        spacing='xs'
        name='dataType'
        label='Value Type'
        value={state.valueType}
        onChange={(valueType: AcceptedDataType) =>
          setState(s => ({ ...s, value: '', valueType } as any))
        }
      >
        <Radio value='string' label='String' />
        <Radio value='number' label='Number' />
        <Radio value='boolean' label='Boolean' />
        <Radio value='object' label='Object' />
        <Radio value='array' label='Array' />
      </Radio.Group>
    ) : (
      <></>
    );
  }, [state.valueType, isActionAdd]);

  const CompValue = useMemo(() => {
    const showValue = basicDt.includes(state.valueType);

    const valueProps = {
      label: 'Value',
      placeholder: 'Value',
      value: state.value,
      onChange: (e: any) =>
        setState(s => ({
          ...s,
          value: typeof e === 'object' && e ? e.target.value : e,
        })),
    };

    return showValue ? (
      <>
        {state.valueType === 'boolean' ? (
          <Radio.Group
            {...valueProps}
            value={String(Boolean(valueProps.value))}
          >
            <Radio value='true' label='true' />
            <Radio value='false' label='false' />
          </Radio.Group>
        ) : state.valueType === 'number' ? (
          <NumberInput {...valueProps} />
        ) : state.valueType === 'string' ? (
          <Textarea {...valueProps} autosize minRows={1} />
        ) : (
          <></>
        )}
      </>
    ) : isActionAdd ? (
      <TextInput
        {...valueProps}
        readOnly
        value={
          state.valueType === 'array'
            ? 'New empty array : []'
            : 'New empty object : {}'
        }
      />
    ) : undefined;
  }, [state.value, state.valueType]);

  return (
    <>
      <Modal
        title={<b>{isActionAdd ? 'Add' : 'Modify'}</b>}
        opened={props.open}
        onClose={() => props.onUpdate({ close: true } as any)}
      >
        <ModalForm onSubmit={onSubmit}>
          <>
            {CompKey}

            {CompValueType}

            {CompValue}

            <Button type='submit'>Save</Button>
          </>
        </ModalForm>
      </Modal>
    </>
  );
}
