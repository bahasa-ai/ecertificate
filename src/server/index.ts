require('dotenv').config()

import bodyParser from 'body-parser'
import express, { static as serveStatic } from 'express'
import path from 'path'
import { Email } from './service/Email'

const app = express()

app.use(bodyParser.json())

app.get('/ping', (_, res) => res.send({ pong: true }))

app.post('/api/send', async (req, res) => {
  const { to, subject, content, params } = req.body
  try {
    await Email.build().sendEmail(to, subject, content, params)
  } catch (error) {
    return res.status(500).send({
      ntap: false,
      error: error.toString(),
      payload: req.body
    })
  }
  return res.send({
    ntap: true
  })
})

app.use(serveStatic(path.join(__dirname, '..', 'build')))
app.use((_, res) => res.sendFile(path.join(__dirname, '..', 'build', 'index.html')))

app.listen('6996', () => console.log('running at :6996...'))

Email.build({
  host: process.env.EMAIL_SMTP_HOST,
  port: Number(process.env.EMAIL_SMTP_PORT),
  from: process.env.EMAIL_FROM || 'not-reply@dev.otorisasi.com',
  secure: true,
  auth: {
    user: process.env.EMAIL_SMTP_USER,
    pass: process.env.EMAIL_SMTP_PASS
  }
})