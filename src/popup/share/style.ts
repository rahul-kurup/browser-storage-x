import styled from '@emotion/styled';
import { Avatar } from '@mantine/core';
import TreeView from 'lib-components/tree-view';

export const StyledAvatar = styled(Avatar)`
  border: 1px solid whitesmoke;
` as unknown as typeof Avatar;

export const SelectWrapper = styled.div`
  position: relative;
`;

export const SelectTextWrapper = styled.div`
  white-space: nowrap;
`;

export const ImgIcon = styled.img`
  height: 16px;
  width: 16px;
  top: 1px;
  left: 1px;
  transform: rotate(-15deg);
  position: absolute;
  transform-origin: center;
  background-color: white;
  border-radius: 10px;
  padding-top: 1px;
`;

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
