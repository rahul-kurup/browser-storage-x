import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { ExternalProps } from './type';

export const LabelCheckBox = styled.label`
  display: flex;
  gap: 5px;
  cursor: pointer;
`;

type Expansion = { expanded: boolean; hasItems: boolean };

export const NodeWrapper = styled.div<Expansion>`
  display: grid;
  gap: 5px;
  width: 100%;
  position: relative;
  align-items: center;
  grid-template-columns: ${p => (p.hasItems ? 'auto 1fr' : '1fr')};
  cursor: ${p =>
    p.hasItems ? (p.expanded ? 'n-resize' : 's-resize') : 'default'};
`;

export const TextContainer = styled.div<{ isColorSchemeDark: boolean }>`
  display: flex;
  gap: 5px;
  border: 1px dashed transparent;
  &:hover {
    border: 1px dashed ${p => (p.isColorSchemeDark ? '#ddd' : '#444')};
  }
`;

export const LiNode = styled.li<ExternalProps & Expansion>`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-left: 12px;
  margin-left: ${p => (p.enableSelection ? '6px' : '1px')};
  border-left-width: 1px;
  border-left-style: dashed;
  border-left-color: ${p => (p.showGuidelines ? '#d1d1d1' : 'transparent')};
  ${p =>
    p.expanded &&
    css`
      & > ul {
        margin-left: 6px;
      }
    `}
`;

export const View = styled.ul`
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  padding: 0;
`;

export default View;
