const axios = require('axios')
const {assert} = require('chai')
const spec = require('../src/spec.json')


// Tests

describe('spec', () => {

  it('should be up-to-date', async () => {
    const res = await axios.get('https://raw.githubusercontent.com/Jailbreak-Paris/data-quality-spec/french/spec-fr_FR.json')
    assert.deepEqual(spec, res.data)
  })

})
