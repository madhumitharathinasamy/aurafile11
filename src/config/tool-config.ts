import { siteConfig } from "./site";

export const imageTools = siteConfig.home.tools.image;
export const pdfTools = siteConfig.home.tools.pdf;
export const tools = [...imageTools, ...pdfTools];
