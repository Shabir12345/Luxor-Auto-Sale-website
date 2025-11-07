declare module 'heic-convert' {
  type Options = { buffer: Buffer; format: 'JPEG' | 'PNG'; quality?: number };
  function heicConvert(options: Options): Promise<Buffer | ArrayBuffer>;
  export = heicConvert;
}


