import { UploadOutlined } from '@ant-design/icons'
import { Document, Image as ImagePDF, Page, PDFViewer, StyleSheet, Text, View } from '@react-pdf/renderer'
import { Button, Col, Form, Input, Row, Select, Space, Upload } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React, { useEffect, useState } from 'react'
import Header from '../../components/Header'

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

// Create Document Component
const Ecertificate: React.FC = () => {
  const [template, setTemplate] = useState<any>()
  const [file, setFile] = useState<any>()
  const [img, setImg] = useState<string>()
  const [textStyle, setTextStyle] = useState<any>()
  const [dimension, setDimenstion] = useState<[number, number]>()
  const [form] = useForm()

  useEffect(() => {
    form.setFieldsValue({
      paddingLeft: 0,
      paddingTop: 800,
      fontSize: 189,
      align: 'center'
    })
  }, [])

  const onFinish = async () => {
    const { text, paddingLeft, paddingTop, fontSize, align } = form.getFieldsValue()
    setTextStyle({
      fontSize,
      paddingTop: `${paddingTop}px`,
      paddingLeft: `${paddingLeft}px`,
      textAlign: align,
    })
    setTemplate(text)
  }

  const onFile = (file: any) => {
    setFile(file)
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        setDimenstion([img.width, img.height])
        setImg(reader.result as string)
      }
      img.src = reader.result as string
      console.log(`url(${reader.result})`)
    }
    reader.readAsDataURL(file)
    return false
  }

  return <>
    {template ? <PDFViewer style={{ height: '100vh' }}>
      <Document>
        <Page size={{ width: dimension?.[0] as number, height: dimension?.[1] as number }} style={styles.page}>
          <ImagePDF src={img} style={styles.pageBackground} />
          <View style={styles.section}>
            <Text style={textStyle}>{template}</Text>
          </View>
        </Page>
      </Document>
    </PDFViewer> : <>
      <Header />
      <div className="container">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row>
            <Col span={24}>
              <Form.Item label="Certificate File">
                <Upload beforeUpload={file => onFile(file)} showUploadList={false}>
                  <Button icon={<UploadOutlined />}> {file?.name || 'Upload' }</Button>
                </Upload>
              </Form.Item>
              <Form.Item name="text" label="Text">
                <Input size="large" />
              </Form.Item>
              <Space>
                <Form.Item name="fontSize" label="Font Size">
                  <Input type="number" />
                </Form.Item>
                <Form.Item name="paddingLeft" label="Left">
                  <Input type="number" />
                </Form.Item>
                <Form.Item name="paddingTop" label="Top">
                  <Input type="number" />
                </Form.Item>
                <Form.Item name="align" label="Align">
                  <Select>
                    <Select.Option value="left">Left</Select.Option>
                    <Select.Option value="center">Center</Select.Option>
                    <Select.Option value="right">right</Select.Option>
                  </Select>
                </Form.Item>
              </Space>
              <Form.Item>
                <Button htmlType="submit" type="primary" style={{ float: 'right' }}>Generate</Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </>}
  </>
}

export default Ecertificate