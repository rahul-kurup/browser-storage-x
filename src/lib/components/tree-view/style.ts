import styled from '@emotion/styled';
import { ExternalProps } from './type';

export const LabelCheckBox = styled.label`
  display: flex;
  gap: 5px;
  cursor: pointer;
`;

export const NodeText = styled.span<{ expanded: boolean; hasItems: boolean }>`
  cursor: ${p =>
    p.hasItems ? (p.expanded ? 'n-resize' : 's-resize') : 'default'};
`;

export const TextContainer = styled.div`
  display: flex;
  gap: 5px;
`;

export const LiNode = styled.li<ExternalProps>`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-left: 12px;
  margin-left: ${p => p.enableSelection ? '6px' : '1px'};
  border-left-width: 1px;
  border-left-style: dashed;
  border-left-color: ${p => p.showGuidelines ? '#d1d1d1' : 'transparent'};
`;

export const View = styled.ul`
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  padding: 0;
`;

export default View;
