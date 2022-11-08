import { Button, Modal, Radio, Textarea, TextInput } from '@mantine/core';
import { AcceptedDataType } from 'lib-components/tree-view';
import { has } from 'lodash';
import { FormEvent, useCallback, useMemo, useState } from 'react';
import {
  basicDt,
  emptyDt,
  getValueByType,
  isPrevNewPathSame,
  stopDefaultEvent,
} from './helper';
import { ModalForm } from './style';
import { CommonModalArgs, UpsertModalProps } from './type';

export default function UpsertModal({
  node,
  open,
  action,
  explorerState,
  onUpdate,
}: UpsertModalProps & {
  onUpdate: (args: CommonModalArgs) => void;
}) {
  const isActionAdd = action === 'add';
  const isActionUpdate = action === 'update';

  const checks = {
    isSelfArray: node.dataType === 'array',
    isSelfObject: node.dataType === 'object',
    isParentArray: node.data?.parentDataType === 'array',
    isParentObject: node.data?.parentDataType === 'object',
  };

  const prepareNode = useCallback(() => {
    const isUpdate = action === 'update';
    return {
      isChanged: false,
      name: isUpdate ? node.nodeName : '',
      value: isUpdate ? node.data?.value : '',
      valueType: isUpdate
        ? node.dataType
        : basicDt.includes(node.dataType)
        ? 'string'
        : 'object',
    };
  }, [node, action]);

  const [state, setState] = useState(prepareNode());

  const pushChange = useCallback(
    (args: Omit<CommonModalArgs, 'changes'>) => {
      if (args.newPath && node.nodeName !== state.name) {
        const exists = has(explorerState.content, args.newPath);
        if (exists) {
          return alert(
            `The key name '${state.name}' already exists in this level / path`
          );
        }
      }
      return onUpdate({
        ...args,
        // this is just to track name changes of root cookie.
        // TODO: find a better way instead of this BS
        changes: [state.name, node.nodeName],
      });
    },
    [state.name, node]
  );

  function onSubmit(e: FormEvent) {
    stopDefaultEvent(e);
    const { isParentArray, isParentObject, isSelfObject, isSelfArray } = checks;
    const toSave = { ...node };
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
      return pushChange({ close: false, newPath, newPathValue });
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
        return pushChange({
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
          return pushChange({ close: false, newPath, newPathValue });
        } else if (isParentObject) {
          // rename key and value if object
          newPaths.pop();
          newPaths.push(state.name);
          const newPath = newPaths;
          return pushChange({
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
          const value = e.target.value?.trim() || '';
          setState(s => ({ ...s, name: value, isChanged: true } as any));
        }}
      />
    );

    if (isActionAdd) {
      if (isSelfArray) {
        return null;
      }
      if (isSelfObject || isParentObject) {
        return KeyInput;
      }
    }

    if (isActionUpdate && isParentArray && basicDt.includes(state.valueType)) {
      return null;
    }

    return KeyInput;
  }, [state.name, node, isActionAdd, isActionUpdate, checks]);

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
    const showValue =
      basicDt.includes(state.valueType) || emptyDt.includes(state.valueType);

    const valueProps = {
      label: 'Value',
      placeholder: 'Value',
      value: state.value ?? '',
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
          <TextInput
            {...valueProps}
            pattern='^\d*\.?\d*$'
            title='Enter number only'
          />
        ) : state.valueType === 'string' || state.valueType === 'null' ? (
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
        opened={open}
        title={<b>{isActionAdd ? 'Add' : 'Modify'}</b>}
        onClose={() => pushChange({ close: true } as CommonModalArgs)}
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
