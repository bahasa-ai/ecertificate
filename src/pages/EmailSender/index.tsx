import { DeleteOutlined, PlusOutlined, UploadOutlined, CheckCircleOutlined, CloseCircleOutlined, SendOutlined } from '@ant-design/icons'
import { Button, Col, Divider, Form, Input, message, Popconfirm, Row, Space, Typography, Upload } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import axios from 'axios'
import csv from 'csvtojson'
import React, { useState } from 'react'
import Header from '../../components/Header'

const EmailSender: React.FC = () => {
  const [form] = useForm()
  const [file, setFile] = useState<any>()
  const [bulk, setBulk] = useState<any>()
  const [processing, setProcessing] = useState<boolean>(false)
  const [bulkResult, setBulkResult] = useState<any>()

  const onFinish = async () => {
    setProcessing(true)
    const { to, subject, content, params } = form.getFieldsValue()
    if (!subject || !content) {
      setProcessing(false)
      return message.error('Please fill the subject and content!')
    }
    if (bulk) {
      const result = []
      for (const recipient of bulk) {
        const { email, ...params } = recipient
        try {
          await axios.post('/api/send', {
            to: email, subject, content, params: params || {}
          })
          result.push({ success: true, email })
        } catch (error) {
          result.push({ success: false, email, error })
        }
      }
      setBulkResult(result)
      setProcessing(false)
    } else {
      try {
        await axios.post('/api/send', {
          to, subject, content, params: params?.reduce((res: any, p: { key: string, value: string }) => ({ ...res, [p.key]: p.value }), {}) || {}
        })
        setProcessing(false)
        return message.success('Sent!')
      } catch (error) {
        setProcessing(false)
        return message.error(error?.response.data?.error || `Failed to send to ${to}`)
      }
    }
  }

  const importCsv = (file: any) => {
    setFile(file)
    const reader = new FileReader()
    reader.onload = () => {
      csv({ noheader: false }).fromString(reader.result as string).then(result => {
        if (!result?.[0].email) {
          setFile(undefined)
          return message.error('CSV format not valid')
        }
        setBulk(result)
      })
    }
    reader.readAsText(file)
    return false
  }


  return (
    <>
      <Header />
      <div className="container">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row>
            <Col span={24}>
              <Form.Item>
                <Popconfirm title="Continue?" onConfirm={onFinish}>
                  <Button icon={<SendOutlined />} type="primary" style={{ float: 'right' }} disabled={processing}>{ processing ? 'On it...' : 'Send' }</Button>
                </Popconfirm>
              </Form.Item>
              <Form.Item name="to" label="To">
                <Input type="email" size="large" disabled={bulk} placeholder={bulk ? `will send to ${bulk[0].email} and ${bulk.length - 1} other recipient(s)` : ''} />
              </Form.Item>
              <Form.Item name="subject" label="Subject">
                <Input size="large" />
              </Form.Item>
              <Form.Item name="content" label="Content">
                <Input.TextArea rows={15} />
              </Form.Item>
              <Form.List name="params">
                {(fields, { add, remove }) =>
                  <>
                    {fields.map(field =>
                      <>
                        <Space>
                          <Form.Item {...field} name={[field.name, 'key']} fieldKey={[field.fieldKey, 'key']} label="Param Name">
                            <Input />
                          </Form.Item>
                          <Form.Item {...field} name={[field.name, 'value']} fieldKey={[field.fieldKey, 'value']} label="Param Value">
                            <Input />
                          </Form.Item>
                          <Typography.Text type="danger"><DeleteOutlined onClick={() => remove(field.name)} /></Typography.Text>
                        </Space>
                      </>)}
                    <Form.Item>
                      <Space>
                        <Button disabled={bulk} type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                          Add param
                        </Button>
                      </Space>
                    </Form.Item>
                  </>}
              </Form.List>
              <Divider>Bulk Action</Divider>
              <Form.Item>
                <Upload beforeUpload={file => importCsv(file)} showUploadList={false}>
                  <Button icon={<UploadOutlined />}> {file?.name || 'Import CSV' }</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>
        </Form>
        { bulkResult ?
          <>
            <Typography.Paragraph>
              {bulkResult.filter((r: any) => r.success).length}/{bulkResult.length} sent successfully!
            </Typography.Paragraph>
            { bulkResult.map((data: any) => <Typography.Paragraph>
              <Typography.Text type={data.success ? 'success' : 'danger'}>{data.success ? <CheckCircleOutlined /> : <CloseCircleOutlined />}</Typography.Text>
              <Typography.Text> {data.email}</Typography.Text>
            </Typography.Paragraph>) }
          </> : '' }
      </div>
    </>
  )
}

export default EmailSender