import { Button, Modal, Tooltip } from '@mantine/core';
import { Cookie } from 'lib-models/browser';
import Browser from 'lib-utils/browser';
import { isCookieType } from 'lib-utils/storage';
import { useEffect, useState } from 'react';
import { convertCookieToTreeNode, convertStorageToTreeNode } from './helper';
import { NodeLabel, NodeValue, StyledTreeView } from './style';
import { SpecificProps, TreeDataState } from './type';

export default function ShareSpecificModal({
  onSelection,
  srcStorage,
  srcTab,
  disabled,
  ...props
}: SpecificProps) {
  const [treeDataState, setTreeDataState] = useState<TreeDataState>('HIDDEN');
  const [storageContent, setStorageContent] = useState([]);
  const isCookie = isCookieType(srcStorage);

  const handleModalClose = async () => {
    setTreeDataState('HIDDEN');
    /**
     * So we discard the tab again as it was discarded earlier and don't want to consume user's memory
     * BUT BUT BUT due to discarding the tab, tab is replaced, and is not the same
     * so we use browser.tabs.onReplaced, search for onReplaced we add a listener there
     * the discard fn here also returns the new tab, but onReplace handles more cases like tab getting discarded automatically
     * so we use that
     */
    const tabWasDiscarded = Browser.tab.isDiscarded(srcTab);
    if (tabWasDiscarded) {
      await Browser.tab.discard(srcTab);
    }
  };

  useEffect(() => {
    if (treeDataState !== 'HIDDEN' && srcTab && srcStorage) {
      (isCookie
        ? Browser.cookie
            .getAll(srcTab)
            .then(output => setStorageContent(convertCookieToTreeNode(output)))
        : Browser.tab
            .storage(srcTab)
            .getAll(srcStorage)
            .then(output =>
              setStorageContent(convertStorageToTreeNode(output || {}))
            )
      ).finally(() => setTreeDataState('LOADED'));
    }
  }, [treeDataState, srcTab, srcStorage]);

  return (
    <>
      <Tooltip withArrow offset={2} label='Pick items'>
        <Button
          type='button'
          color='cyan'
          fullWidth={false}
          disabled={disabled}
          onClick={() => setTreeDataState('LOADING')}
          loading={treeDataState === 'LOADING'}
        >
          Items
        </Button>
      </Tooltip>

      <Modal
        centered
        trapFocus
        title='Select items to share'
        opened={treeDataState === 'LOADED'}
        onClose={handleModalClose}
      >
        <StyledTreeView
          enableSelection
          selectAllByDefault
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
                <NodeLabel title={`${name} ⇒ ${value}`}>{name}</NodeLabel>
                <NodeValue title={value}>{value}</NodeValue>
              </>
            );
          }}
        />
      </Modal>
    </>
  );
}
