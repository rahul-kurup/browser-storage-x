import { Button, Modal, Radio, Textarea, TextInput } from '@mantine/core';
import { AcceptedDataType } from 'lib-components/tree-view';
import { FormEvent, useCallback, useMemo, useState } from 'react';
import {
  basicDt,
  getValueByType,
  isPrevNewPathSame,
  stopDefaultEvent,
} from './helper';
import { ModalForm } from './style';
import { CommonModalArgs, UpsertModalProps } from './type';

export default function UpsertModal(
  props: UpsertModalProps & {
    onUpdate: (args: CommonModalArgs) => void;
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
      isChanged: false,
      name: isUpdate ? props.node.nodeName : '',
      value: isUpdate ? props.node.data?.value : '',
      valueType: isUpdate
        ? props.node.dataType
        : basicDt.includes(props.node.dataType)
        ? 'string'
        : 'object',
    };
  }, [props.node, props.action]);

  const [state, setState] = useState(prepareNode());

  function onSubmit(e: FormEvent) {
    stopDefaultEvent(e);
    const { isParentArray, isParentObject, isSelfObject, isSelfArray } = checks;
    const toSave = { ...props.node };
    const dataPath = toSave.data.path;
    let dataValue = toSave.data.value;
    const stateValue = getValueByType[state.valueType](state.value);

    // ADD
    if (isActionAdd) {
      // add key with value if array
      if (isSelfArray) {
        dataValue ??= [];
        dataValue.push(stateValue);
      }
      // add key with value if object
      if (isSelfObject) {
        dataValue ??= {};
        dataValue[state.name] = stateValue;
      }
      const newPath = dataPath;
      const newPathValue = dataValue;
      return props.onUpdate({ close: false, newPath, newPathValue });
    }

    // UPDATE
    if (isActionUpdate) {
      const prevPath = dataPath;
      const newPaths = [...dataPath];
      // rename key
      if (isSelfArray || isSelfObject) {
        newPaths.pop();
        newPaths.push(state.name);
        const newPath = newPaths;
        const newPathValue = dataValue;
        return props.onUpdate({
          close: false,
          newPath,
          newPathValue,
          prevPath: isPrevNewPathSame(prevPath, newPath) ? undefined : prevPath,
        });
      } else {
        const newPathValue = stateValue;
        // rename value if array
        if (isParentArray) {
          const newPath = newPaths;
          return props.onUpdate({ close: false, newPath, newPathValue });
        } else if (isParentObject) {
          // rename key and value if object
          newPaths.pop();
          newPaths.push(state.name);
          const newPath = newPaths;
          return props.onUpdate({
            close: false,
            newPath,
            newPathValue,
            prevPath: isPrevNewPathSame(prevPath, newPath)
              ? undefined
              : prevPath,
          });
        }
      }
    }
  }

  const CompKey = useMemo(() => {
    const { isParentArray, isParentObject, isSelfObject, isSelfArray } = checks;
    const KeyInput = (
      <Textarea
        required
        autosize
        label='Key'
        minRows={1}
        value={state.name}
        placeholder='New key name'
        onChange={e => {
          let value = e.target.value;
          value = value.trim().length < 1 ? '' : value;
          setState(s => ({ ...s, name: value, isChanged: true } as any));
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
        required
        spacing='xs'
        name='dataType'
        label='Value Type'
        value={state.valueType}
        onChange={(valueType: AcceptedDataType) =>
          setState(
            s => ({ ...s, value: '', valueType, isChanged: true } as any)
          )
        }
      >
        <Radio value='object' label='Object' />
        <Radio value='array' label='Array' />
        <Radio value='string' label='String' />
        <Radio value='number' label='Number' />
        <Radio value='boolean' label='Boolean' />
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
      required: true,
      onChange: (e: any) => {
        const value =
          typeof e === 'object' && e
            ? e.target.value
            : state.valueType === 'boolean'
            ? e === 'true'
            : e;
        setState(s => ({
          ...s,
          isChanged: true,
          value:
            typeof value === 'string'
              ? value.trim().length < 1
                ? ''
                : value
              : value,
        }));
      },
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
          <TextInput {...valueProps} pattern='^\d*\.?\d*$' />
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
        centered
        trapFocus
        opened={props.open}
        title={<b>{isActionAdd ? 'Add' : 'Modify'}</b>}
        onClose={() => props.onUpdate({ close: true } as CommonModalArgs)}
      >
        <ModalForm onSubmit={onSubmit}>
          <>
            {CompKey}

            {CompValueType}

            {CompValue}

            <Button type='submit' disabled={!state.isChanged}>
              Save
            </Button>
          </>
        </ModalForm>
      </Modal>
    </>
  );
}
