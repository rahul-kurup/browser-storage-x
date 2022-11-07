import { Button, ButtonProps, Loader } from '@mantine/core';
import Select, { ChangeHandlerArgs } from 'lib-components/select';
import { TreeViewProps } from 'lib-components/tree-view';
import { Tab } from 'lib-models/browser';
import { StorageType } from 'lib-models/storage';
import Browser from 'lib-utils/browser';
import { withImg } from 'lib-utils/common';
import {
  getAllItems,
  isCookieType,
  setAllItems,
  StorageTypeList
} from 'lib-utils/storage';
import { useBrowserTabs } from 'lib/context/browser-tab';
import { set, startCase, unset } from 'lodash';
import { filterFn } from 'popup/share/helper';
import { SourceContainer } from 'popup/share/style';
import { memo, useEffect, useState } from 'react';
import { CustomSelectOption } from '../share/components';
import {
  basicDt,
  containerDt,
  convertContentToCookie,
  convertContentToStorage,
  convertCookieToTreeNode,
  convertStorageToTreeNode,
  stopActionDefEvent
} from './helper';
import DeleteModal from './modal-delete';
import UpsertModal from './modal-upsert';
import Form, {
  ActionButton,
  Actions,
  DataType,
  ImgIcon,
  NodeItemContainer,
  NodeKey,
  NodeValue,
  Placeholder,
  StyledTreeView
} from './style';
import { CommonModalArgs, UpsertModalProps } from './type';

const actionProps: ButtonProps = {
  radius: 'xl',
  size: 'xs',
  compact: true,
  variant: 'light',
};

function ExplorerUI() {
  const { tabs, replaced } = useBrowserTabs();
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState(
    {} as {
      isSaving?: boolean;
      tab: Tab;
      storage: StorageType;
      original: any;
      content: any;
      isChanged?: boolean;
      treeContent: TreeViewProps['items'];
    }
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

      (isCookie
        ? Browser.cookies.getAll(tab).then(convertCookieToTreeNode)
        : Browser.script
            .execute(tab, getAllItems, [storage])
            .then(convertStorageToTreeNode)
      )
        .then(({ converted, parsed, originalData }) =>
          setState(s => ({
            ...s,
            content: parsed,
            original: originalData,
            treeContent: converted,
          }))
        )
        .finally(() => setLoading(false));
    }
  }, [tab, storage]);

  const isSrcSelected = Boolean(tab && storage);

  function handleContentChange(args: CommonModalArgs) {
    setModal(s => ({ ...s, node: undefined, open: false }));
    if (!args.close) {
      setState(prev => {
        const newState = { ...prev };
        const changedContent = { ...newState.content };
        if (args.newPath) {
          set(changedContent, args.newPath, args.newPathValue);
        }
        if (args.prevPath?.length) {
          unset(changedContent, args.prevPath);
        }
        const { converted, parsed } = isCookie
          ? convertCookieToTreeNode(changedContent)
          : convertStorageToTreeNode(changedContent);
        return {
          ...newState,
          isChanged: true,
          content: parsed,
          treeContent: converted,
        };
      });
    }
  }

  async function onSubmit(e) {
    stopActionDefEvent(e);
    setState(s => ({ ...s, isSaving: true }));
    if (isCookie) {
      const cookies = convertContentToCookie(state.content, state.original);
      for (let i = 0; i < cookies.length; i++) {
        try {
          const cookie = cookies[i];
          await Browser.cookies.set({
            ...cookie,
            url: state.tab.url,
          });
        } catch (error) {
          console.error(error);
        }
      }
    } else {
      const content = convertContentToStorage(state.content);
      try {
        await Browser.script.execute(state.tab, setAllItems, [
          state.storage,
          content,
        ]);
      } catch (error) {
        console.error(error);
      }
    }
    setState(s => ({ ...s, isSaving: false, isChanged: false }));
  }

  return (
    <>
      <Form onSubmit={onSubmit}>
        <SourceContainer sourceSelected>
          <Select
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
            searchable
            filter={filterFn}
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
                items={state.treeContent || []}
                nodeRenderer={node => {
                  const { name, value } = node.data || {};

                  const showModify =
                    node.dataSubType === 'index'
                      ? basicDt.includes(node.dataType)
                      : true;

                  const capDataType = startCase(node.dataType) || '';

                  const Empty = containerDt.includes(node.dataType) &&
                    !node.items?.length && <i>{'<empty>'}</i>;

                  return (
                    <NodeItemContainer>
                      <Actions className='actions'>
                        {containerDt.includes(node.dataType) && (
                          <ActionButton
                            {...actionProps}
                            color='green'
                            title='Add'
                            onClick={e => {
                              stopActionDefEvent(e);
                              setModal({
                                open: true,
                                action: 'add',
                                node,
                              });
                            }}
                          >
                            <ImgIcon src={withImg('plus.png')} alt='' />
                          </ActionButton>
                        )}

                        {showModify && (
                          <ActionButton
                            {...actionProps}
                            title='Modify'
                            onClick={e => {
                              stopActionDefEvent(e);
                              setModal({
                                open: true,
                                node,
                                action: 'update',
                              });
                            }}
                          >
                            <ImgIcon src={withImg('pen.png')} alt='' />
                          </ActionButton>
                        )}

                        <ActionButton
                          {...actionProps}
                          color='red'
                          title='Remove'
                          onClick={e => {
                            stopActionDefEvent(e);
                            setModal({
                              open: true,
                              node,
                              action: 'delete',
                            });
                          }}
                        >
                          <ImgIcon src={withImg('trash.png')} alt='' />
                        </ActionButton>
                      </Actions>

                      <NodeKey title={String(name)}>
                        {node.dataSubType === 'index' ? (
                          <>
                            <DataType title={`index ${name}`}>
                              [{name}] ({capDataType}) {Empty}
                            </DataType>
                          </>
                        ) : (
                          <>
                            {String(name)}{' '}
                            <DataType>
                              ({capDataType}) {Empty}
                            </DataType>
                          </>
                        )}
                      </NodeKey>

                      {basicDt.includes(node.dataType) &&
                        !Boolean(node.items?.length) && (
                          <NodeValue title={String(value)}>
                            {String(value)}
                          </NodeValue>
                        )}
                    </NodeItemContainer>
                  );
                }}
              />

              <Button
                type='submit'
                loading={state.isSaving}
                disabled={!state.isChanged}
              >
                Update Storage
              </Button>
            </>
          )
        ) : (
          <Placeholder>
            Select a tab and storage to read/modify/delete items
          </Placeholder>
        )}
      </Form>

      {modal.open &&
        modal.node &&
        (modal.action === 'delete' ? (
          <DeleteModal {...modal} onDelete={handleContentChange} />
        ) : (
          <UpsertModal
            {...modal}
            isCookie={isCookie}
            onUpdate={handleContentChange}
          />
        ))}
    </>
  );
}

export default memo(ExplorerUI);
