declare module "react-syntax-highlighter" {
  export * from "react-syntax-highlighter/dist/esm";
}

declare module "react-syntax-highlighter/dist/esm/languages/prism/sql" {
  const sql: any;
  export default sql;
}

declare module "react-syntax-highlighter/dist/esm/styles/prism" {
  export const materialDark: any;
}

declare module "prismjs" {
  export const highlight: any;
  export const languages: any;
}
