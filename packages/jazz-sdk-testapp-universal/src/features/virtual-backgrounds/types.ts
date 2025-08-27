export type VirtualBackgroundImage = {
  imageId: string;
} & ({ type: 'url'; url: string } | { type: 'blob'; blob: Blob; url: string });

export type VirtualBackgroundMode = 'disabled' | 'blur' | 'image';

export type VirtualBackgroundSetting = {
  background:
    | { mode: Exclude<VirtualBackgroundMode, 'image'> }
    | { mode: 'image'; imageId: string };
  autoWhiteBalance: boolean;
  autoGammaCorrection: boolean;
  autoColorCorrection: boolean;
  faceBeautification: boolean;
  smartFocus: boolean;
};
