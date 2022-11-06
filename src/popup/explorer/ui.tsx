import { Button, ButtonProps, Loader } from '@mantine/core';
import Select, { ChangeHandlerArgs } from 'lib-components/select';
import { TreeViewProps } from 'lib-components/tree-view';
import { Tab } from 'lib-models/browser';
import { StorageType } from 'lib-models/storage';
import Browser from 'lib-utils/browser';
import { noop, withImg } from 'lib-utils/common';
import { getAllItems, isCookieType, StorageTypeList } from 'lib-utils/storage';
import { useBrowserTabs } from 'lib/context/browser-tab';
import { SourceContainer } from 'popup/share/style';
import { memo, useEffect, useState } from 'react';
import { CustomSelectOption } from '../share/components';
import {
  convertCookieToTreeNode,
  convertStorageToTreeNode,
  isValueType,
  stopActionDefEvent,
} from './helper';
import Form, {
  ActionButton,
  Actions,
  DataType,
  ImgIcon,
  NodeItemContainer,
  NodeKey,
  NodeValue,
  Placeholder,
  StyledTreeView,
} from './style';
import { UpsertModalProps } from './type';
import Upsert from './upsert';

const actionProps: ButtonProps = {
  radius: 'xl',
  size: 'xs',
  compact: true,
  variant: 'light',
};

const enableUpsert = true;

function ExplorerUI() {
  const { tabs, replaced } = useBrowserTabs();
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState(
    {} as { tab: Tab; storage: StorageType; content: TreeViewProps['items'] }
  );

  const [modal, setModal] = useState({} as UpsertModalProps);

  function handleChange({ name, value }: ChangeHandlerArgs<Tab>) {
    setState(s => ({ ...s, [name]: value }));
  }

  useEffect(() => {
    setState(prev => {
      let { tab } = prev;
      const replacedTab = replaced[tab?.id || ''];
      if (replacedTab) {
        tab = replacedTab;
      }
      return {
        ...prev,
        tab,
      };
    });
  }, [replaced]);

  const { tab, storage } = state;

  const isCookie = isCookieType(storage);

  useEffect(() => {
    if (tab && storage) {
      setLoading(true);
      if (isCookie) {
        Browser.cookies
          .getAll(tab)
          .then(content => {
            setState(s => ({
              ...s,
              content: convertCookieToTreeNode(content),
            }));
          })
          .finally(() => setLoading(false));
      } else {
        Browser.script
          .execute(tab, getAllItems, [storage])
          .then(content => {
            setState(s => ({
              ...s,
              content: convertStorageToTreeNode(content),
            }));
          })
          .finally(() => setLoading(false));
      }
    }
  }, [tab, storage]);

  const isSrcSelected = Boolean(tab && storage);

  return (
    <>
      <Form onSubmit={noop}>
        <SourceContainer sourceSelected>
          <Select
            searchable
            label='Tab'
            name='tab'
            options={tabs}
            valueAsObject
            value={state.tab}
            onChange={handleChange}
            // disabled={disabledField}
            itemComponent={CustomSelectOption}
            fieldKey={{
              value: 'id',
              label: 'title',
            }}
          />

          <Select
            label='Storage'
            name='storage'
            options={StorageTypeList}
            value={state.storage}
            // disabled={disabledField}
            onChange={handleChange}
          />
        </SourceContainer>

        {isSrcSelected ? (
          loading ? (
            <Placeholder>
              <Loader color='dark' size='xl' variant='bars' />
            </Placeholder>
          ) : (
            <>
              <StyledTreeView
                items={state.content || []}
                nodeRenderer={node => {
                  const { name, value, parentDataType } = node.data || {};

                  return (
                    <NodeItemContainer>
                      {enableUpsert && (
                        <Actions className='actions'>
                          <>
                            {!isValueType(node) && (
                              <ActionButton
                                {...actionProps}
                                color='green'
                                title='Add'
                                onClick={e => {
                                  stopActionDefEvent(e);
                                  setModal({
                                    open: true,
                                    action: 'add',
                                    title: (
                                      <>
                                        Add to <b>{name}</b>
                                      </>
                                    ),
                                  });
                                }}
                              >
                                <ImgIcon src={withImg('plus.png')} alt='' />
                              </ActionButton>
                            )}

                            <ActionButton
                              {...actionProps}
                              title='Modify'
                              onClick={e => {
                                stopActionDefEvent(e);
                                setModal({
                                  open: true,
                                  node,
                                  action: 'update',
                                  title: (
                                    <>
                                      Modify: <b>{name}</b>
                                    </>
                                  ),
                                });
                              }}
                            >
                              <ImgIcon src={withImg('pen.png')} alt='' />
                            </ActionButton>

                            <ActionButton
                              {...actionProps}
                              color='red'
                              title='Remove'
                              onClick={e => {
                                stopActionDefEvent(e);
                              }}
                            >
                              <ImgIcon src={withImg('trash.png')} alt='' />
                            </ActionButton>
                          </>
                        </Actions>
                      )}

                      <NodeKey title={String(name)}>
                        {String(name)} <DataType>[{node.dataType}]</DataType>
                      </NodeKey>

                      {isValueType(node) &&
                        (parentDataType === 'array' ? (
                          <></>
                        ) : (
                          <NodeValue title={String(value)}>
                            {String(value)}
                          </NodeValue>
                        ))}
                    </NodeItemContainer>
                  );
                }}
              />

              {enableUpsert && <Button type='submit'>Update Storage</Button>}
            </>
          )
        ) : (
          <Placeholder>
            Select a tab and storage to read/modify/delete items
          </Placeholder>
        )}
      </Form>

      {modal.open && (
        <Upsert
          {...modal}
          onChange={node => setModal(s => ({ ...s, node, open: false }))}
        />
      )}
    </>
  );
}

export default memo(ExplorerUI);
