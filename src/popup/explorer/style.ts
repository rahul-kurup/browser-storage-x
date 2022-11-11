import styled from '@emotion/styled';
import TreeView from 'lib-components/tree-view';

export const Decoded = styled.small`
  text-decoration: underline;
  cursor: pointer;
`;

export const SourceContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 100px;
  gap: 5px;
`;

export const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const DataType = styled.span`
  font-size: 0.8rem;
`;

export const Actions = styled.span`
  display: none;
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  gap: 5px;
`;

export const NodeKey = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
`;

export const NodeValue = styled.small`
  display: inline-block;
  font-size: 0.8rem;
  font-weight: bold;
  color: #777;
`;

export const NodeItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 100%;
  margin: 2px;

  &:hover > .actions {
    display: flex;
  }
`;

export const Placeholder = styled.div`
  display: flex;
  min-height: 200px;
  height: 100%;
  width: 100%;
  place-content: center;
  place-items: center;
`;

export const StyledTreeView = styled(TreeView)`
  white-space: nowrap;
  overflow-x: hidden;
  overflow-y: auto;
  max-height: 400px;
`;

export default styled.form`
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 10px;
  width: 100%;
  min-height: 280px;
`;
