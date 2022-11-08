import styled from '@emotion/styled';
import TreeView from 'lib-components/tree-view';

export const SourceContainer = styled.div<{ sourceSelected: boolean }>`
  display: grid;
  grid-template-columns: 1fr ${p => (p.sourceSelected ? 'auto' : '')};
  gap: 5px;
`;

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
