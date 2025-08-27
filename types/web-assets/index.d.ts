/* eslint-disable import/no-default-export */

declare module '*.svg?react' {
  import { FunctionComponent, SVGProps, SVGSVGElement } from 'react';

  const ReactComponent: FunctionComponent<
    SVGProps<SVGSVGElement> & { title?: string }
  >;

  export default ReactComponent;
}

declare module '*.svg' {
  const path: string;
  export default path;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}
