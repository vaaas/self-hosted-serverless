import { resolvePtr } from 'dns';
import { IncomingMessage, ServerResponse } from 'http';
import type DB from './db';
import { Response } from './router';

function urlMatch(url: string) {
	const m = url.match(new RegExp('^/([a-z]+)/(0-9a-f+)$'));
	if (!m) return null
	else return { table: m[1], key: m[2] }
}

function read_body(req: IncomingMessage): Promise<Buffer|Error> {
	return new Promise((yes) => {
		const bufs: Array<Buffer> = []
		req.on('data', chunk => bufs.push(chunk))
		req.on('end', () => yes(Buffer.concat(bufs)))
		req.on('error', (err) => yes(err))
	})
}

export default (db: DB) => ({
	getItem(req: IncomingMessage, params: {
		table: string,
		key: string,
	}): Response<400, ''> | Response<404, ''> | Response<200, Buffer> {
		const result = db.get(params.table, params.key)
		if (result === null)
			return { code: 404, body: '' }
		else
			return { code: 200, body: result }
	},

	async writeItem(req: IncomingMessage, params: {
		table: string,
		key: string,
	}): Promise<
		Response<400, ''> | Response<400, string> | Response<200, ''>
	> {
		const data = await read_body(req)
		if (data instanceof Error)
			return { code: 400, body: data.message }
		else {
			db.set(params.table, params.key, data)
			return { code: 200, body: '' }
		}
	},

	deleteItem(req: IncomingMessage, params: {
		table: string,
		key: string,
	}): Response<400, ''> | Response<200, ''> {
		db.delete(params.table, params.key)
		return { code: 200, body: '' }
	},
})
