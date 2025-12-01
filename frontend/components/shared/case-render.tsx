import React, { ReactNode } from "react";

interface CaseProps {
  show?: boolean;
  children: ReactNode;
}

const CaseRender = ({ show = false, children }: CaseProps) => {
  return show ? <>{children}</> : null;
};

export { CaseRender };
