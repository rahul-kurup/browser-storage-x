import styled from '@emotion/styled';
import { Avatar } from '@mantine/core';
import ImgIcon from 'lib-components/img-icon';

export const StyledAvatar = styled(Avatar)`
  border: 1px solid whitesmoke;
` as unknown as typeof Avatar;

export const SelectWrapper = styled.div`
  position: relative;
`;

export const SelectTextWrapper = styled.div`
  white-space: nowrap;
`;

export const StyledImgIcon = styled(ImgIcon)`
  top: 1px;
  left: 1px;
  transform: rotate(-15deg);
  position: absolute;
  transform-origin: center;
  background-color: white;
  border-radius: 10px;
  padding-top: 1px;
`;

export default styled.label`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;
