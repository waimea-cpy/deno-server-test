import { type Route, route } from "jsr:@std/http/unstable-route"
import { serveDir } from "jsr:@std/http/file-server"
import { DB } from "https://deno.land/x/sqlite@v3.9.1/mod.ts"
import { STATUS_CODE } from "jsr:@std/http/status"


// Open a database
const db = new DB('./db/test.db');

db.execute(`
    CREATE TABLE IF NOT EXISTS people (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT
    )
`);

// Run a simple query
// for (const name of ['Peter Parker', 'Clark Kent', 'Bruce Wayne']) {
//   db.query('INSERT INTO people (name) VALUES (?)', [name]);
// }



// Close connection
// db.close();

const notFound = () => new Response(
    'Not Found',
    { status: STATUS_CODE.NotFound }
)

const home: Route = {
    pattern: new URLPattern({ pathname: '/' }),
    handler: () => new Response('Hello, World!'),
}

const about: Route = {
    pattern: new URLPattern({ pathname: '/about' }),
    handler: () => new Response('About page')
}

const all: Route = {
    pattern: new URLPattern({ pathname: '/users' }),
    handler: () => {
        const records = db.query('SELECT id, name FROM people')
        console.log(records)

        let response = ''
        for (const [id, name] of records) {
            response += `User id ${id}: ${name}\n`
        }
        return new Response(response)
    }
}

const user: Route = {
    pattern: new URLPattern({ pathname: '/users/:id' }),
    handler: (_req, _info, params) => {
        const id = params?.pathname.groups.id

        const records = db.query('SELECT name FROM people WHERE id=?', [id])
        console.log(records)

        if (records.length > 0) {
            const [name] = records[0]
            return new Response(`Name: ${name}`)
        }
        else {
            return notFound()
        }
    }
}


const staticFiles: Route = {
    pattern: new URLPattern({ pathname: '/static/*' }),
    handler: (req: Request) => serveDir(req),
}


function defaultHandler(_req: Request) {
    return notFound()
}

// const routes: Route[] = [
//     home,
//     about,
//     all,
//     user,
//     staticFiles
// ]

const router = route(
    [
        home,
        about,
        all,
        user,
        staticFiles
    ],
    defaultHandler
)


// Deno.serve(route(routes, defaultHandler))
Deno.serve(router)
