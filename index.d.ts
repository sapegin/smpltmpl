declare module 'smpltmpl' {
	declare function templateFromFile(filename: string, context: object) : string;
	declare function template(template: string, context: object, filename?: string) : string;
}
