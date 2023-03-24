import React, { FC, useEffect, useState } from 'react'
import { Layout, Card, Divider, Input, Table } from 'antd'
import { ColumnsType } from 'antd/es/table'
import './App.css'

interface ServerData {
  key: number
  name: string
  price: number
  created_at: number
  responsible: string
  status: string
  pipeline_id: number
  contacts: {
    name: string
    values: {
      phone: string
      email: string
    }
  }[]
}

const columns: ColumnsType<ServerData> = [
  {
    title: 'Название',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: 'Статус',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: 'Ответственный',
    dataIndex: 'responsible',
    key: 'responsible'
  },
  {
    title: 'Дата создания',
    dataIndex: 'created_at',
    key: 'created_at'
  },
  {
    title: 'Бюджет',
    dataIndex: 'price',
    key: 'price'
  }
]

const App: FC = () => {
  const [state, setState] = useState<ServerData[] | null>(null)
  const [inputValue, setInputValue] = useState<string>('')

  useEffect(() => {
    fetch('http://localhost:1475/api/leads', {
      method: 'GET'
    }).then((res) =>
      res.json().then((res) => {
        setState(res)
      })
    )
  }, [])

  useEffect(() => {
    if (inputValue.length > 2 || inputValue.length === 0) {
      fetch(
        `http://localhost:1475/api/leads${
          inputValue.length ? `?filter=${inputValue}` : ''
        }`,
        {
          method: 'GET'
        }
      )
        .then((res) => {
          if (res.status !== 204) return res.json()
          else return { message: 'no content' }
        })
        .then((res) => {
          if (res.message !== 'no content') setState(res)
        })
    }
  }, [inputValue])

  return (
    <Layout className='App'>
      <Card
        title={
          <Divider orientation='right'>
            <Input
              placeholder='Фильтрация'
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className='input'
            />
          </Divider>
        }
      >
        {state && (
          <Table
            pagination={false}
            columns={columns}
            expandable={{
              expandedRowRender: (record) => (
                <div>
                  {record.contacts.map((el) => (
                    <p className='contacts' key={el.name}>
                      {`${el.name} ${el.values.phone} ${el.values.email}`}
                    </p>
                  ))}
                </div>
              )
            }}
            dataSource={state}
          />
        )}
      </Card>
    </Layout>
  )
}

export default App
