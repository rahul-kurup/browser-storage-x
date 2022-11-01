import styled from '@emotion/styled';
import TreeView from 'lib-components/tree-view';

export const Fieldset = styled.fieldset`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

export const Legend = styled.legend`
  padding: 0 5px;
  font-weight: bold;
  font-size: 0.9rem;
`;

export const Actions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
`;

export const NodeKey = styled.b`
  display: inline-block;
`;

export const NodeValue = styled.i`
  display: inline-block;
  font-size: 0.8rem;
  margin-left: 5px;
`;

export const StyledTreeView = styled(TreeView)`
  white-space: nowrap;
  overflow: hidden;
`;

export default styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
