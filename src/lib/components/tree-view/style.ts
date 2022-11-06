import styled from '@emotion/styled';
import { ExternalProps } from './type';

export const ImgIcon = styled.img`
  height: 10px;
  width: 10px;
`;

export const LabelCheckBox = styled.label`
  display: flex;
  gap: 5px;
  cursor: pointer;
`;

export const NodeText = styled.div<{ expanded: boolean; hasItems: boolean }>`
  display: flex;
  gap: 5px;
  width: 100%;
  position: relative;
  align-items: center;
  cursor: ${p =>
    p.hasItems ? (p.expanded ? 'n-resize' : 's-resize') : 'default'};
`;

export const TextContainer = styled.div`
  display: flex;
  gap: 5px;
  border: 1px dashed transparent;
  &:hover {
    background: whitesmoke;
    border: 1px dashed #d1d1d1;
  }
`;

export const LiNode = styled.li<ExternalProps>`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-left: 12px;
  margin-left: ${p => (p.enableSelection ? '6px' : '1px')};
  border-left-width: 1px;
  border-left-style: dashed;
  border-left-color: ${p => (p.showGuidelines ? '#d1d1d1' : 'transparent')};
`;

export const View = styled.ul`
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  padding: 0;
`;

export default View;
