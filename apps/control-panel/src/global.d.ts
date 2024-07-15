export {}

declare module '*.json5' {
  const value: object
  export default value
}

declare module "*.svg" {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}