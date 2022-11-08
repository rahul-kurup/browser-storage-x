import { Alert, Button, ButtonProps, Loader } from '@mantine/core';
import ImgIcon from 'lib-components/img-icon';
import Select, {
  ChangeHandlerArgs,
  fnFilter,
  SelectOptionBrowserTab,
} from 'lib-components/select';
import { Tab } from 'lib-models/browser';
import { Progress } from 'lib-models/progress';
import Browser from 'lib-utils/browser';
import {
  getAllItems,
  isCookieType,
  setAllItems,
  StorageTypeList,
} from 'lib-utils/storage';
import { useBrowserTabs } from 'lib/context/browser-tab';
import { set, startCase, unset } from 'lodash';
import { memo, useEffect, useState } from 'react';
import {
  basicDt,
  containerDt,
  convertContentToCookie,
  convertContentToStorage,
  convertCookieToTreeNode,
  convertStorageToTreeNode,
  stopDefaultEvent,
} from './helper';
import DeleteModal from './modal-delete';
import UpsertModal from './modal-upsert';
import Form, {
  ActionButton,
  Actions,
  DataType,
  NodeItemContainer,
  NodeKey,
  NodeValue,
  Placeholder,
  SourceContainer,
  StyledTreeView,
} from './style';
import { CommonModalArgs, ExplorerState, UpsertModalProps } from './type';

const actionProps: ButtonProps = {
  radius: 'xl',
  size: 'xs',
  compact: true,
  variant: 'light',
};

function ExplorerUI() {
  const { tabs, replaced } = useBrowserTabs();
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState({
    progress: Progress.idle,
  } as ExplorerState);

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
    stopDefaultEvent(e);
    setState(s => ({ ...s, progress: Progress.started }));
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
    setState(s => ({ ...s, progress: Progress.pass, isChanged: false }));
    setTimeout(() => {
      setState(s => ({ ...s, progress: Progress.idle }));
    }, 1000);
  }

  const disabledField = state.progress === Progress.started;

  return (
    <>
      <Form onSubmit={onSubmit}>
        <SourceContainer>
          <Select
            label='Tab'
            name='tab'
            options={tabs}
            valueAsObject
            value={state.tab}
            onChange={handleChange}
            itemComponent={SelectOptionBrowserTab}
            disabled={disabledField}
            fieldKey={{
              value: 'id',
              label: 'title',
            }}
            searchable
            filter={fnFilter}
          />

          <Select
            label='Storage'
            name='storage'
            options={StorageTypeList}
            value={state.storage}
            disabled={disabledField}
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
                              stopDefaultEvent(e);
                              setModal({
                                open: true,
                                action: 'add',
                                node,
                              });
                            }}
                          >
                            <ImgIcon src='plus' />
                          </ActionButton>
                        )}

                        {showModify && (
                          <ActionButton
                            {...actionProps}
                            title='Modify'
                            onClick={e => {
                              stopDefaultEvent(e);
                              setModal({
                                open: true,
                                node,
                                action: 'update',
                              });
                            }}
                          >
                            <ImgIcon src='pen' />
                          </ActionButton>
                        )}

                        <ActionButton
                          {...actionProps}
                          color='red'
                          title='Remove'
                          onClick={e => {
                            stopDefaultEvent(e);
                            setModal({
                              open: true,
                              node,
                              action: 'delete',
                            });
                          }}
                        >
                          <ImgIcon src='trash' />
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

              {state.progress === Progress.pass ? (
                <Alert color='green' title='✅ Done'>
                  Storage content updated
                </Alert>
              ) : (
                <Button
                  type='submit'
                  loading={disabledField}
                  disabled={!state.isChanged || disabledField}
                >
                  Update Storage
                </Button>
              )}
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
          <UpsertModal {...modal} onUpdate={handleContentChange} />
        ))}
    </>
  );
}

export default memo(ExplorerUI);
