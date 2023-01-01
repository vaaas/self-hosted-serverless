import { createServer, IncomingMessage, ServerResponse } from 'node:http'
import * as path from 'node:path'
import process from 'node:process'
import Controller from './controller'
import DB from './db'
import Router from './router'

const config = {
	port: 8000,
	host: 'localhost',
	auth: 'test123'
}

const isAuthorised = (req: IncomingMessage, token: string): boolean =>
	req.headers['authorization'] === `Authorization: Bearer ${token}`

const requestListener = (auth: string, router: Router) => (req: IncomingMessage, res: ServerResponse) => {
	if (!isAuthorised(req, auth))
		return res.writeHead(401).end()

	router.lookup(req, res)
}

function main() {
	const db = new DB(path.join(process.cwd(), 'database.lmdb'))

	const controller = Controller(db)

	const router = new Router()
		.get('/:db/:key', controller.getItem)
		.put('/:db/:key', controller.writeItem)
		.delete('/:db/:key', controller.deleteItem)

	const server = createServer(requestListener(config.auth, router))
	server.listen(config.port, config.host, () => console.log(`Server listening at ${config.host}:${config.port}`))
}

main()
