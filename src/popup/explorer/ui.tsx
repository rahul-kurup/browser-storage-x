import { Alert, Button, ButtonProps, Loader } from '@mantine/core';
import ImgIcon from 'lib-components/img-icon';
import Select, {
  ChangeHandlerArgs,
  fnFilter,
  SelectOptionBrowserTab
} from 'lib-components/select';
import { Cookie, Tab } from 'lib-models/browser';
import { Progress } from 'lib-models/progress';
import Browser from 'lib-utils/browser';
import {
  getAllItems,
  isCookieType,
  setAllItems,
  StorageTypeList
} from 'lib-utils/storage';
import { useBrowserTabs } from 'lib/context/browser-tab';
import { set, startCase, unset } from 'lodash';
import { FormEvent, memo, useEffect, useState } from 'react';
import { isDevMode } from '../../manifest/base/helper';
import {
  basicDt,
  containerDt,
  convertContentToCookie,
  convertContentToStorage,
  convertCookieToTreeNode,
  convertStorageToTreeNode,
  stopDefaultEvent
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
  StyledTreeView
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

  const [modal, setModal] = useState(
    {} as Omit<UpsertModalProps, 'explorerState'>
  );

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

  const isStorageCookie = isCookieType(storage);

  useEffect(() => {
    if (tab && storage) {
      setLoading(true);

      (isStorageCookie
        ? Browser.cookie.getAll(tab).then(convertCookieToTreeNode)
        : Browser.script
            .execute(tab, getAllItems, [storage])
            .then(convertStorageToTreeNode)
      )
        .then(async ({ converted, parsed, originalData }) => {
          setState(s => ({
            ...s,
            content: parsed,
            original: originalData,
            treeContent: converted,
          }));
        })
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

        const prevLen = args.prevPath?.length;
        let changes = newState.changes || {};

        if (prevLen) {
          unset(changedContent, args.prevPath);

          // this condition solely exists to track root cookie name changes
          if (isStorageCookie && prevLen === 1 && args.changes) {
            const [newName, oldName] = args.changes;
            changes[newName] = oldName;
          }
        }

        const { converted, parsed } = isStorageCookie
          ? convertCookieToTreeNode(changedContent)
          : convertStorageToTreeNode(changedContent);
        return {
          ...newState,
          content: parsed,
          treeContent: converted,
          changes,
        };
      });
    }
  }

  async function modifyCookies(_cookies: Cookie[], op: 'set' | 'remove') {
    for (const cookie of _cookies) {
      try {
        const { url, domain } = Browser.cookie.genUrlInfoUsingTab(cookie, tab);
        await Browser.cookie[op]({
          ...cookie,
          url,
          domain: op === 'remove' ? cookie.domain : domain,
        });
      } catch (error) {
        console.error(error);
      }
    }
  }

  async function onSubmit(e: FormEvent) {
    stopDefaultEvent(e);
    setState(s => ({ ...s, progress: Progress.started }));
    const { tab, content, original, changes } = state;
    if (isStorageCookie) {
      const newCookies = convertContentToCookie(content, original, changes);
      await modifyCookies(original, 'remove');
      await modifyCookies(newCookies, 'set');
    } else {
      const newContent = convertContentToStorage(content);
      try {
        await Browser.script.execute(tab, setAllItems, [storage, newContent]);
      } catch (error) {
        console.error(error);
      }
    }
    setState(s => ({ ...s, progress: Progress.pass, changes: undefined }));
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
            searchable
            filter={fnFilter}
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

                  const showActions = isDevMode ? true : !isStorageCookie;

                  return (
                    <NodeItemContainer>
                      {showActions && (
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
                      )}

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
                  disabled={!state.changes || disabledField}
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
          <DeleteModal
            {...modal}
            explorerState={state}
            onDelete={handleContentChange}
          />
        ) : (
          <UpsertModal
            {...modal}
            explorerState={state}
            onUpdate={handleContentChange}
          />
        ))}
    </>
  );
}

export default memo(ExplorerUI);
