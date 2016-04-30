import React from 'react';

export const Pattern = (props) => {

  const { name, size } = props;
  const x = size / 4;

  return (
    <pattern id={name} width={size} height={size} patternUnits="userSpaceOnUse">
      <line x1={0*x} y1={1*x} x2={1*x} y2={0*x} stroke="black" strokeWidth={x/2} strokeLinecap="square"/>
      <line x1={0*x} y1={3*x} x2={3*x} y2={0*x} stroke="black" strokeWidth={x/2} strokeLinecap="square"/>
      <line x1={1*x} y1={4*x} x2={4*x} y2={1*x} stroke="black" strokeWidth={x/2} strokeLinecap="square"/>
      <line x1={3*x} y1={4*x} x2={4*x} y2={3*x} stroke="black" strokeWidth={x/2} strokeLinecap="square"/>
    </pattern>
  );
};
