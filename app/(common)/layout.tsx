import { ReactNode } from 'react';

const CommonLayout = ({ children }: { children: ReactNode }) => {
  return <div className="p-8">{children}</div>;
};

export default CommonLayout;
