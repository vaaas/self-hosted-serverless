import FMW from 'find-my-way'
import { IncomingMessage, Server, ServerResponse } from 'http';

export type ResponseCode =
	200
	| 400
	| 401
	| 404

export type Response<C extends ResponseCode, B extends string | Buffer> = {
	code: C;
	body: B;
}

export type Callback<P extends Record<string, string>, R extends Response<any, any>> = (req: IncomingMessage, params: P) => R | Promise<R>

export function serve<R extends Response<any, any>>(res: ServerResponse, response: R): void {
	res.writeHead(response.code).end(response.body)
}

const route_callback = <C extends Callback<any, any>>(f: C) => (req: IncomingMessage, res: ServerResponse, params: Record<string, string>) => {
	const response = f(req, params)
	if (response instanceof Promise)
		response.then(x => serve(res, x))
	else
		serve(res, response)
}

export default class Router {
	router: ReturnType<typeof FMW>

	constructor() {
		this.router = FMW()
	}

	get<C extends Callback<any, any>>(url: string, f: C): Router {
		// @ts-ignore
		this.router.on('GET', url, route_callback(f))
		return this
	}

	put<C extends Callback<any, any>>(url: string, f: C) {
		// @ts-ignore
		this.router.on('GET', url, route_callback(f))
		return this
	}

	delete<C extends Callback<any, any>>(url: string, f: C) {
		// @ts-ignore
		this.router.on('GET', url, route_callback(f))
		return this
	}

	lookup(req: IncomingMessage, res: ServerResponse){
		this.router.lookup(req, res)
	}
}
