import { Button, Group, Modal } from '@mantine/core';
import { ModalForm } from './style';
import { CommonModalArgs, UpsertModalProps } from './type';

export default function DeleteModal(
  props: UpsertModalProps & {
    onDelete: (args: CommonModalArgs) => void;
  }
) {
  function handleDelete() {
    props.onDelete({
      close: false,
      prevPath: props.node.data.path,
    } as CommonModalArgs);
  }

  function handleClose() {
    props.onDelete({ close: true } as CommonModalArgs);
  }

  return (
    <>
      <Modal
        centered
        trapFocus
        title={<b>Remove</b>}
        opened={props.open}
        onClose={handleClose}
      >
        <ModalForm onSubmit={handleDelete}>
          <>
            <div>
              Delete this item <b>{props.node.nodeName}</b> ?
            </div>

            <Group>
              <Button type='submit' color='red'>
                Yes, delete
              </Button>

              <Button type='button' onClick={handleClose}>
                No
              </Button>
            </Group>
          </>
        </ModalForm>
      </Modal>
    </>
  );
}
