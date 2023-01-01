import lmdb from 'node-lmdb'
import { Buffer } from 'node:buffer'

export default class DB {
	env: lmdb.Env
	dbs: Record<string, lmdb.Dbi>

	constructor(path: string) {
		this.env = new lmdb.Env()
		this.env.open({
			path: path,
			mapSize: 2**20,
			maxDbs: 1,
		})
		this.dbs = {};
	}

	dbi(name: string): lmdb.Dbi {
		if (name in this.dbs)
			return this.dbs[name]
		else {
			const dbi = this.env.openDbi({
				create: true,
				name: name,
			})
			this.dbs[name] = dbi
			return dbi
		}
	}

	set(db: string, key: string, value: Buffer): void {
		const txn = this.env.beginTxn()
		const dbi = this.dbi(db)
		txn.putBinary(dbi, Buffer.from(key), value)
		txn.commit()
	}

	get(db: string, key: string): Buffer | null {
		const txn = this.env.beginTxn()
		const dbi = this.dbi(db)
		const value = txn.getBinary(dbi, Buffer.from(key))
		txn.commit()
		return value
	}

	delete(db: string, key: string) {
		const txn = this.env.beginTxn()
		const dbi = this.dbi(db)
		txn.del(dbi, Buffer.from(key))
		txn.commit()
	}
}
