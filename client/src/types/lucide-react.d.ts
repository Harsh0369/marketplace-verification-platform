declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
  }
  export type Icon = FC<IconProps>;

  export const ArrowRight: Icon;
  export const ShieldCheck: Icon;
  export const Zap: Icon;
  export const Image: Icon;
  export const Shield: Icon;
  export const ShieldAlert: Icon;
  export const Search: Icon;
  export const Filter: Icon;
  export const Loader2: Icon;
  export const ChevronDown: Icon;
  export const ChevronUp: Icon;
  export const AlertCircle: Icon;
  export const Mail: Icon;
  export const Lock: Icon;
  export const UploadCloud: Icon;
  export const CheckCircle: Icon;
  export const X: Icon;
}
