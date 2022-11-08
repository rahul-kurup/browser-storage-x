import { withImg } from 'lib-utils/common';
import { ComponentProps } from 'react';
import Img from './style';

const imgSrcs = {
  anonymous: 'anony.png',
  arrowheadDown: 'arrowhead-down.png',
  arrowheadRight: 'arrowhead-right.png',
  logo: 'logo.png',
  plus: 'plus.png',
  trash: 'trash.png',
  pen: 'pen.png',
};

export default function ImgIcon({
  src,
  sizePx = 10,
  ...props
}: Omit<ComponentProps<'img'>, 'src'> & {
  src: keyof typeof imgSrcs;
  sizePx?: number;
}) {
  const imgSrc = imgSrcs[src];
  return <Img {...props} alt='' src={withImg(imgSrc)} sizePx={sizePx} />;
}
