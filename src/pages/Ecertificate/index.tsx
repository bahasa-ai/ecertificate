import { UploadOutlined } from '@ant-design/icons'
import { Document, Image as ImagePDF, Page, PDFViewer, StyleSheet, Text, View } from '@react-pdf/renderer'
import { Button, Col, Form, Input, Row, Upload } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React, { useState } from 'react'
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
  const [dimension, setDimenstion] = useState<[number, number]>()
  const [form] = useForm()

  const onFinish = async () => {

  }

  const onFile = (file: any) => {
    setFile(file)
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        setDimenstion([img.width, img.height])
        setImg(reader.result as string)
        setTemplate('aoisnais')
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
          <Text>Gilang</Text>
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
            </Col>
          </Row>
        </Form>
      </div>
    </>}
  </>
}

export default Ecertificate