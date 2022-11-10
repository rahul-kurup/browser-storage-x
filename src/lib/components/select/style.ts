import styled from '@emotion/styled';
import { Avatar } from '@mantine/core';
import { IconSpy } from '@tabler/icons';

export const StyledAvatar = styled(Avatar)`
  border: 1px solid whitesmoke;
` as unknown as typeof Avatar;

export const SelectWrapper = styled.div`
  position: relative;
`;

export const SelectTextWrapper = styled.div`
  white-space: nowrap;
`;

export const StyledImgIcon = styled(IconSpy)`
  top: 1px;
  left: 1px;
  transform: rotate(-20deg);
  position: absolute;
  transform-origin: center;
` as unknown as typeof IconSpy;

export default styled.label`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;
