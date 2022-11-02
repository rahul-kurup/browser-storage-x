import { Button, Modal } from '@mantine/core';
import { Cookie } from 'lib-models/browser';
import Browser from 'lib-utils/browser';
import { getAllItems, isCookieType } from 'lib-utils/storage';
import { useEffect, useState } from 'react';
import { convertCookieToTreeNode, convertStorageToTreeNode } from './helper';
import { NodeKey, NodeValue, StyledTreeView } from './style';
import { SpecificProps, TreeDataState } from './type';

export default function ShareSpecific({
  onSelection,
  srcStorage,
  srcTab,
  disabled,
  ...props
}: SpecificProps) {
  const [treeDataState, setTreeDataState] = useState<TreeDataState>('HIDDEN');
  const [storageContent, setStorageContent] = useState([]);
  const isCookie = isCookieType(srcStorage);

  useEffect(() => {
    if (treeDataState != 'HIDDEN' && srcTab && srcStorage) {
      if (isCookie) {
        Browser.cookies.getAll(srcTab).then(output => {
          setTreeDataState('LOADED');
          setStorageContent(convertCookieToTreeNode(output));
        });
      } else {
        Browser.script
          .execute(srcTab, getAllItems, [srcStorage])
          .then(output => {
            setTreeDataState('LOADED');
            setStorageContent(convertStorageToTreeNode(output.result));
          });
      }
    }
  }, [treeDataState, srcTab, srcStorage]);

  return (
    <>
      <Button
        type='button'
        color='cyan'
        fullWidth={false}
        disabled={disabled}
        onClick={() => setTreeDataState('LOADING')}
        loading={treeDataState === 'LOADING'}
      >
        Pick items
      </Button>

      <Modal
        opened={treeDataState == 'LOADED'}
        onClose={() => setTreeDataState('HIDDEN')}
        title='Select items to share'
      >
        <StyledTreeView
          enableSelection
          selecteAllByDefault
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
              name = `${d.name} (${d.domain})`;
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
      </Modal>
    </>
  );
}
