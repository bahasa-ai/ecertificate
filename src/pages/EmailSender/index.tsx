import { CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, PlusOutlined, SendOutlined, UploadOutlined } from '@ant-design/icons'
import { Document, Image as ImagePDF, Page, pdf, StyleSheet, Text, View } from '@react-pdf/renderer'
import { Button, Col, Collapse, Form, Input, message, Popconfirm, Row, Select, Space, Typography, Upload } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import axios from 'axios'
import csv from 'csvtojson'
import React, { useEffect, useState } from 'react'
import Header from '../../components/Header'
import './index.css'


const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#E4E4E4'
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  },
  pageBackground: {
    position: 'absolute',
    minWidth: '100%',
    minHeight: '100%',
    height: '100%',
    width: '100%'
  }
})

const EmailSender: React.FC = () => {
  const [form] = useForm()
  const [fileCsv, setFileCsv] = useState<any>()
  const [attachment, setAttachment] = useState<any>()
  const [bulk, setBulk] = useState<any>()
  const [processing, setProcessing] = useState<boolean>(false)
  const [bulkResult, setBulkResult] = useState<any>()

  const [fileCertificate, setFileCertificate] = useState<any>()
  const [imgCertificate, setImgCertificate] = useState<string>()
  const [dimension, setDimenstion] = useState<[number, number]>()

  useEffect(() => {
    form.setFieldsValue({
      certPaddingLeft: 0,
      certPaddingTop: 800,
      certFontSize: 189,
      certAlign: 'center'
    })
  }, [])

  const buildPdf = async (textStyles: any, text: string) => {
    return await pdf(<Document>
      <Page size={{ width: dimension?.[0] as number, height: dimension?.[1] as number }} style={styles.page}>
        <ImagePDF src={imgCertificate} style={styles.pageBackground} />
        <View style={styles.section}>
          <Text style={textStyles}>{text}</Text>
        </View>
      </Page>
    </Document>).toBlob()
  }

  const buildData = async (to: string, subject: string, content: string, params?: any, certTextStyles?: any, nameInCertificate?: string) => {
    const data = new FormData()
    data.append('to', to)
    data.append('subject', subject)
    data.append('content', content)
    if (params) {
      data.append('params', JSON.stringify(params))
    }
    if (fileCertificate && nameInCertificate) {
      data.append('file', new File([await buildPdf(certTextStyles, nameInCertificate)], 'e-Certificate.pdf'))
    } else if (attachment) {
      data.append('file', attachment)
    }
    return data
  }

  const onFinish = async () => {
    setProcessing(true)
    const { to, subject, content, params, nameInCertificate, certPaddingLeft, certPaddingTop, certFontSize, certAlign } = form.getFieldsValue()
    if (!subject || !content) {
      setProcessing(false)
      return message.error('Please fill the subject and content!')
    }
    message.info('Sending... Please don\'t close your browser!')
    const certTextStyles = {
      fontSize: certFontSize,
      paddingTop: `${certPaddingTop}px`,
      paddingLeft: `${certPaddingLeft}px`,
      textAlign: certAlign,
    }
    if (bulk) {
      const result = []
      for (const recipient of bulk) {
        const { email, name_in_certificate: nameInCertificate, ...params } = recipient
        try {
          await axios.post('/api/send', await buildData(
            email, subject, content, params, certTextStyles, nameInCertificate), {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
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
        await axios.post('/api/send', await buildData(
          to, subject, content, params?.reduce((res: any, p: { key: string, value: string }) => ({ ...res, [p.key]: p.value }), {}), certTextStyles, nameInCertificate), {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        setProcessing(false)
        return message.success('Sent!')
      } catch (error) {
        console.error(error)
        setProcessing(false)
        return message.error(error?.response?.data?.error || `Failed to send to ${to}`)
      }
    }
  }

  const importCsv = (file: any) => {
    setFileCsv(file)
    const reader = new FileReader()
    reader.onload = () => {
      csv({ noheader: false }).fromString(reader.result as string).then(result => {
        if (!result?.[0].email) {
          setFileCsv(undefined)
          return message.error('CSV format not valid')
        }
        form.setFieldsValue({
          to: null,
          nameInCertificate: null
        })
        setBulk(result)
      })
    }
    reader.readAsText(file)
    return false
  }

  const onUploadCertificate = (file: any) => {
    setFileCertificate(file)
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        setDimenstion([img.width, img.height])
        setImgCertificate(reader.result as string)
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
    return false
  }

  const beforeSetAttachment = (file: any) => {
    setAttachment(file)
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
              <Space className="space" align="baseline">
                <Form.Item name="to" label="To">
                  <Input type="email" disabled={bulk} placeholder={bulk ? `will send to ${bulk[0].email} and ${bulk.length - 1} other recipient(s)` : ''} />
                </Form.Item>
                <Typography.Text>Or</Typography.Text>
                <Form.Item label="Import From CSV">
                  <Upload beforeUpload={file => importCsv(file)} showUploadList={false}>
                    <Button icon={<UploadOutlined />}> {fileCsv?.name || 'Upload CSV' }</Button>
                  </Upload>
                </Form.Item>
              </Space>
              <Form.Item name="subject" label="Subject">
                <Input size="large" />
              </Form.Item>
              <Form.Item name="content" label="Content">
                <Input.TextArea rows={15} />
              </Form.Item>
              <Form.List name="params">
                {(fields, { add, remove }) =>
                  <>
                    {fields.map((field, id) =>
                      <div key={id}>
                        <Space>
                          <Form.Item {...field} name={[field.name, 'key']} fieldKey={[field.fieldKey, 'key']} label="Param Name">
                            <Input />
                          </Form.Item>
                          <Form.Item {...field} name={[field.name, 'value']} fieldKey={[field.fieldKey, 'value']} label="Param Value">
                            <Input />
                          </Form.Item>
                          <Typography.Text type="danger"><DeleteOutlined onClick={() => remove(field.name)} /></Typography.Text>
                        </Space>
                      </div>)}
                    <Form.Item>
                      <Space>
                        <Button disabled={bulk} type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                          Add Params
                        </Button>
                      </Space>
                    </Form.Item>
                  </>}
              </Form.List>
              <Form.Item>
                <Space>
                  <Upload beforeUpload={file => beforeSetAttachment(file)} showUploadList={false}>
                    <Button disabled={fileCertificate} icon={<UploadOutlined />}> {attachment?.name || 'Select Attachment' }</Button>
                  </Upload>
                  <Typography.Text>Or</Typography.Text>
                </Space>
              </Form.Item>
              <Collapse>
                <Collapse.Panel key="certificate" header="Build Certificate">
                  <Form.Item label="Certificate File">
                    <Upload beforeUpload={file => onUploadCertificate(file)} showUploadList={false}>
                      <Button icon={<UploadOutlined />}> {fileCertificate?.name || 'Upload' }</Button>
                    </Upload>
                  </Form.Item>
                  <Form.Item name="nameInCertificate" label="Name in Certificate">
                    <Input disabled={bulk} size="large" placeholder={bulk ? 'use param name_in_certificate in csv file' : ''} />
                  </Form.Item>
                  <Space>
                    <Form.Item name="certFontSize" label="Font Size">
                      <Input type="number" />
                    </Form.Item>
                    <Form.Item name="certPaddingLeft" label="Left">
                      <Input type="number" />
                    </Form.Item>
                    <Form.Item name="certPaddingTop" label="Top">
                      <Input type="number" />
                    </Form.Item>
                    <Form.Item name="certAlign" label="Align">
                      <Select>
                        <Select.Option value="left">Left</Select.Option>
                        <Select.Option value="center">Center</Select.Option>
                        <Select.Option value="right">right</Select.Option>
                      </Select>
                    </Form.Item>
                  </Space>
                </Collapse.Panel>
              </Collapse>
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