declare module 'react-docgen' {
  type Handler = (doc: any, definition: any, parser: { parse: (s: string) => any }) => void;

  export function parse(
    file: string,
    resolver?: (ast: Record<any, any>) => any,
    handlers?: Handler[],
    options?: any
  ): void;
}
