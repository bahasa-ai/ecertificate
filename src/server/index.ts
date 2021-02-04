require('dotenv').config()

import bodyParser from 'body-parser'
import express, { static as serveStatic } from 'express'
import multer from 'multer'
import path from 'path'
import { Email } from './service/Email'

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/ping', (_, res) => res.send({ pong: true }))


const upload = multer({ storage: multer.memoryStorage() })
app.post('/api/send', upload.single('file'), async (req, res) => {
  const { to, subject, content, ...rest } = req.body
  let { params } = rest
  if (typeof params === 'string') {
    params = JSON.parse(params)
  }
  try {
    await Email.build().sendEmail(to, subject, content, req.file ? {
      filename: req.file.originalname,
      content: req.file.buffer
    } : null, params)
  } catch (error) {
    return res.status(500).send({
      success: false,
      error: error.toString(),
      payload: req.body
    })
  }
  return res.send({ success: true })
})

app.use(serveStatic(path.join(__dirname, '..', 'build')))
app.use((_, res) => res.sendFile(path.join(__dirname, '..', 'build', 'index.html')))

app.listen('6996', () => console.log('running at :6996...'))

Email.build({
  host: process.env.EMAIL_SMTP_HOST,
  port: Number(process.env.EMAIL_SMTP_PORT),
  from: process.env.EMAIL_FROM,
  secure: true,
  auth: {
    user: process.env.EMAIL_SMTP_USER,
    pass: process.env.EMAIL_SMTP_PASS
  }
})