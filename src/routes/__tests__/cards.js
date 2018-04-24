const request = require('supertest')
import { boot } from '../../server'

describe('cards', () => {

  let app
  beforeAll(async () => {
    app = await boot()
  })

  it('should return all released version from card', () => {
    return request(app)
      .get('/v1/cards?c=emrakul, the aeons torn')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        expect(response.body.length).toEqual(2)
        response.body.forEach(card => expect(card.name).toEqual('Emrakul, the Aeons Torn'))
      })
  })

  it('should return card with fuzzy search', () => {
    return request(app)
      .get('/v1/cards?c=emrakul promised need&fuzzy=true')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        expect(response.body.length).toEqual(1)
        expect(response.body[0].name).toEqual('Emrakul, the Promised End')
      })
  })
})
