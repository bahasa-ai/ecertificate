import { Layout } from 'antd'
import 'antd/dist/antd.css'
import React from 'react'
import { Route, Switch } from 'react-router-dom'
import './App.css'
import Ecertificate from './pages/Ecertificate'
import EmailSender from './pages/EmailSender'
import Home from './pages/Home'

function App(): any {
  return (
    <Layout className="App">
      <Switch>
        <Route path="/email" exact component={EmailSender} />
        <Route path="/ecertificate" component={Ecertificate} />
        <Route path="/" exact component={Home} />
      </Switch>
    </Layout>
  )
}

export default App