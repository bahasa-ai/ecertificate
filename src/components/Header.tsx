import { GithubOutlined } from '@ant-design/icons'
import { Layout, Menu, Space, Typography } from 'antd'
import React from 'react'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'

const Header: React.FC = () => {
  const history = useHistory()

  const to = (path: string): void => {
    if (/^http/gi.test(path)) {
      window.location.href = path
    } else {
      history.push(path)
    }
  }

  return (
    <StyledHeader>
      <Space>
        <StyledTitle level={4} style={{ color: 'white', marginBottom: 0 }}>E-certificate</StyledTitle>
      </Space>
      <StyledMenu mode="horizontal" theme="dark" selectedKeys={history.location.pathname.includes('application') ? ['myapps'] : undefined} >
        <Menu.Item key="email" onClick={() => to('/email')}>Email Sender</Menu.Item>
        <Menu.Item key="ecert" onClick={() => to('/ecertificate')}>Certificate</Menu.Item>
        <Menu.Item key="github" onClick={() => to('https://github.com/bahasa-ai/ecertificate')}><GithubOutlined /> GitHub</Menu.Item>
      </StyledMenu>
    </StyledHeader>
  )
}

export default Header

const StyledMenu = styled(Menu)`
  float: right;
`

const StyledHeader = styled(Layout.Header)`
  text-align: left;
`

const StyledTitle = styled(Typography.Title)`
  color: #fff;
  margin-bottom: 0;
`
