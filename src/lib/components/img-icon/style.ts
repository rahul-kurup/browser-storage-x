import styled from '@emotion/styled';

export default styled.img<{ sizePx: number }>`
  height: ${p => p.sizePx}px;
  width: ${p => p.sizePx}px;
`;
