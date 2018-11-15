const fs = require('fs')
const chalk = require('chalk')
const express = require('express')
const fetch = require('node-fetch')
const path = require('path')
const cors = require('cors')
const bauth = require('express-basic-auth')
const validator = require('validator')
const { of, throwError, bindNodeCallback } = require('rxjs')
const { map, mergeMap } = require('rxjs/operators')

let config = require('./config.json')

const authorizer = (username, password) => (
  (!config.username && !config.password) ||
  (username === config.username && password === config.password)
)

const app = express()
const api = express()

app.use(cors())
app.use(express.json())
app.use(bauth({ authorizer }))

api.post('/configure', function (req, res) {
  const file = `${__dirname}/config.json`
  const body = req.body.config || {}
  const payload = {
    db: body.db,
    blackhole: body.blackhole,
    xznabs: Array.isArray(body.xznabs) ? body.xznabs : [],
    filter: (body.filter || '').toString(),
    sort: ['seeders', 'peers', 'size'].includes(body.sort) ? body.sort : 'seeders',
    descending: !!body.descending,
    auth: {
      username: (body.auth.username || '').toString(),
      password: (body.auth.password || '').toString()
    }
  }

  of(null).pipe(
    mergeMap(() => validator.isURL(payload.db, { require_tld: false, require_protocol: true }) ? of(file) : throwError(`Error: database should be an URL (like http://localhost:5984)`)),
    mergeMap(() => bindNodeCallback(fs.access)(payload.blackhole, fs.constants.W_OK)),
    mergeMap(err => err ? throwError(err) : of(file)),
    mergeMap(() => bindNodeCallback(fs.access)(file, fs.constants.W_OK)),
    mergeMap(err => err ? throwError(err) : of(file)),
    mergeMap(() => bindNodeCallback(fs.writeFile)(file, JSON.stringify(payload, null, 2))),
    mergeMap(err => err ? throwError(err) : of(file)),
  ).subscribe(
    () => {
      console.log(`${chalk.bgGreen(chalk.black(' CONFIGURED '))} ${chalk.green(file)}`)
      config = payload
      res.status(200).send({ file })
    },
    (reason) => {
      console.log(`${chalk.bgRed(chalk.black(' FAILURE '))} ${chalk.red(reason)}`)
      console.log(chalk.gray(JSON.stringify(payload, null, 2)))
      res.status(520).send({ file, reason: reason.toString(), })
    },
  )
})

api.post('/grab', function (req, res) {
  const release = req.body.release || {}

  of(null).pipe(
    mergeMap(() => of(config.blackhole).pipe(
      mergeMap(blackhole => bindNodeCallback(fs.access)(blackhole, fs.constants.W_OK).pipe(
        map(err => !err),
        mergeMap(exist => exist ? of(null) : bindNodeCallback(fs.mkdir)(blackhole, { recursive: true })),
        mergeMap(err => err ? throwError(err) : of(null)),
      )),
    )),
    mergeMap(() => of(release.link).pipe(
      mergeMap(link => fetch(link)),
      mergeMap(res => res.buffer()),
      mergeMap(buffer => bindNodeCallback(fs.writeFile)(`${config.blackhole}/${release.meta.generated}.torrent`, buffer).pipe(
        mergeMap(err => err ? throwError(err) : of(`${config.blackhole}/${release.meta.generated}.torrent`)),
      )),
    ))
  ).subscribe(
    (filename) => {
      console.log(`${chalk.bgGreen(chalk.black(' GRABBED '))} ${chalk.green(release.title)}`)
      console.log(chalk.gray(filename))
      res.status(200).send({ release, filename })
    },
    (reason) => {
      console.log(`${chalk.bgRed(chalk.black(' FAILURE '))} ${chalk.red(release.title)} ${chalk.red(reason)}`)
      console.log(chalk.gray(JSON.stringify(release, null, 2)))
      res.status(520).send({ release, reason: reason.toString(), })
    },
  )
})

app.use('/api', api)

if (app.get('env') === 'production') {
  app.use(express.static('./dist'))

  app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, './dist', 'index.html'))
  })

  app.get('*.js', function (req, res, next) {
    req.url = req.url + '.gz'
    res.set('Content-Encoding', 'gzip')
    res.set('Content-Type', 'text/javascript')
    next()
  })
}

app.listen(process.env.PORT || (app.get('env') === 'production' ? 8080 : 7000))
