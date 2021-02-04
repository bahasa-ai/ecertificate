import { Layout } from 'antd'
import 'antd/dist/antd.css'
import React from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import './App.css'
import Ecertificate from './pages/Ecertificate'
import EmailSender from './pages/EmailSender'

function App(): any {
  return (
    <Layout className="App">
      <Switch>
        <Route path="/email" exact component={EmailSender} />
        <Route path="/ecertificate" component={Ecertificate} />
        <Route path="/">
          <Redirect to="/email" />
        </Route>
      </Switch>
    </Layout>
  )
}

export default App