import { Button, Modal } from '@mantine/core';
import { Cookie } from 'lib-models/browser';
import Browser from 'lib-utils/browser';
import { getAllItems, isCookieType } from 'lib-utils/storage';
import { useEffect, useState } from 'react';
import {
  convertCookieToTreeNode,
  convertStorageToTreeNode,
  convertTreeNodeToCookie,
  convertTreeNodeToStorage
} from './helper';
import { NodeKey, NodeValue, StyledTreeView } from './style';
import { SpecificProps } from './type';

export default function ShareSpecificModal({
  open,
  setOpen,
  onShare,
  shareState,
}: SpecificProps) {
  const [storageContent, setStorageContent] = useState([]);
  const [selected, setSelected] = useState([]);
  const { srcTab, srcStorage } = shareState;
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

  return (
    <>
      <Modal
        opened={open}
        onClose={() => setOpen(false)}
        title='Select items to share'
      >
        <StyledTreeView
          enableSelection
          items={storageContent}
          onChecked={setSelected}
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
          disabled={!selected.length}
          onClick={() => {
            if (isCookie) {
              onShare(convertTreeNodeToCookie(selected));
            } else {
              onShare(convertTreeNodeToStorage(selected));
            }
          }}
        >
          Share Selected
        </Button>
      </Modal>
    </>
  );
}
