import { Button, Group, Modal } from '@mantine/core';
import { CommonModalArgs, UpsertModalProps } from './type';

export default function DeleteModal(
  props: UpsertModalProps & {
    onDelete: (args: CommonModalArgs) => void;
  }
) {
  return (
    <>
      <Modal
        title={<b>Delete</b>}
        opened={props.open}
        onClose={() => props.onDelete({ close: true } as any)}
      >
        Delete this item <b>{props.node.uniqName}</b>?
        <br />
        <Group>
          <Button
            color='red'
            onClick={() => {
              props.onDelete({
                close: false,
                prevPath: props.node.data.path,
              } as CommonModalArgs);
            }}
          >
            Yes, delete
          </Button>
          <Button
            onClick={() => props.onDelete({ close: true } as CommonModalArgs)}
          >
            No
          </Button>
        </Group>
      </Modal>
    </>
  );
}
