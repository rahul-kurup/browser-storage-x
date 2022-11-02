import { Button, Modal, Radio } from '@mantine/core';
import { Cookie } from 'lib-models/browser';
import Browser from 'lib-utils/browser';
import { getAllItems, isCookieType } from 'lib-utils/storage';
import { useEffect, useState } from 'react';
import {
  convertCookieToTreeNode,
  convertStorageToTreeNode,
  ShareMode
} from './helper';
import { NodeKey, NodeValue, StyledTreeView } from './style';
import { SpecificProps } from './type';

export default function ShareSpecific({
  onSelection,
  srcStorage,
  srcTab,
  disabled,
  ...props
}: SpecificProps) {
  const [open, setOpen] = useState(false);
  const [storageContent, setStorageContent] = useState([]);
  const isCookie = isCookieType(srcStorage);

  useEffect(() => {
    if (open && srcTab && srcStorage) {
      if (isCookie) {
        Browser.cookies
          .getAll(srcTab)
          .then(output => setStorageContent(convertCookieToTreeNode(output)));
      } else {
        Browser.script
          .execute(srcTab, getAllItems, [srcStorage])
          .then(output =>
            setStorageContent(convertStorageToTreeNode(output.result))
          );
      }
    }
  }, [open, srcTab, srcStorage]);

  const selCount = props.selectedItems.filter(f => f !== 'root').length;

  return (
    <>
      <Radio.Group
        name='shareMode'
        label='Share...'
        value={props.mode}
        onChange={mode => onSelection({ mode })}
      >
        <Radio
          size='xs'
          disabled={disabled}
          value={ShareMode.everything}
          label='All items'
        />
        <Radio
          size='sm'
          disabled={disabled}
          value={ShareMode.specific}
          onClick={() => setOpen(true)}
          label={
            props.mode === ShareMode.specific && selCount
              ? `${selCount} item(s) selected`
              : 'Specific items'
          }
        />
      </Radio.Group>

      <Modal
        opened={open}
        onClose={() => setOpen(false)}
        title='Select items to share'
      >
        <StyledTreeView
          enableSelection
          items={storageContent}
          checkedItems={props.selectedItems}
          onChecked={itemValueMap => {
            const selectedItems = Object.keys(itemValueMap);
            const selectedValues = Object.values(itemValueMap);
            onSelection({ selectedItems, selectedValues });
          }}
          nodeRenderer={node => {
            let name = '',
              value = '';
            if (isCookie) {
              const d = node.data as Cookie;
              name = d.name;
              value = d.value;
            } else {
              [name, value] = node.data;
            }
            return (
              <>
                <NodeKey title={`${name} ⇒ ${value}`}>{name}</NodeKey>
                <NodeValue title={value}>{value}</NodeValue>
              </>
            );
          }}
        />

        <br />

        <Button
          type='button'
          disabled={disabled || !selCount}
          onClick={() => setOpen(false)}
        >
          {selCount ? `Pick ${selCount} item(s)` : 'Pick'}
        </Button>
      </Modal>
    </>
  );
}
