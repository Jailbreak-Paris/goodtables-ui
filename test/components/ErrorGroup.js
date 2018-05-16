import React from 'react'
import {assert} from 'chai'
import {shallow, render} from 'enzyme'
import {ErrorGroup} from '../../src/components/ErrorGroup'
import {getTableErrorGroups} from '../../src/helpers'
const report = require('../../data/report.json')


// Tests

describe('ErrorGroup', () => {
  it('should render', () => {
    const table = report.tables[0]
    const errorGroups = getTableErrorGroups(table)
    const result = shallow(<ErrorGroup errorGroups={errorGroups} headers={table.headers} />)
    assert(result.contains('Blank Header'))
  })

  it('works without headers', () => {
    const table = report.tables[0]
    const errorGroups = getTableErrorGroups(table)
    const result = render(<ErrorGroup errorGroups={errorGroups} headers={table.headers} />)
    assert.include(result.text(), 'Blank Header')
  })
})
