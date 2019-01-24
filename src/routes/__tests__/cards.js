const request = require('supertest')
import { boot } from '../../server'

describe('cards', () => {

  jest.setTimeout(10000)
  let app
  beforeAll(async () => {
    app = await boot()
  })

  it('should return card with given multiverseid', () => {
    return request(app)
      .get('/v1/cards?mid=414308')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        expect(response.body.length).toEqual(1)
        expect(response.body[0].name).toEqual('Courageous Outrider')
      })
  })

  it('should return related cards when searching with multiverseid', () => {
    return request(app)
      .get('/v1/cards?mid=439323')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        expect(response.body.length).toEqual(3)
        expect(response.body[0].name).toEqual('Gisela, the Broken Blade')
        expect(response.body[1].name).toEqual('Brisela, Voice of Nightmares')
        expect(response.body[2].name).toEqual('Bruna, the Fading Light')
      })
  })

  it('should be able to search cards by block code', () => {
    return request(app)
      .get('/v1/cards?b=emn')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        expect(response.body.length).toEqual(223)
      })
  })

  it('should work with block code and card name', () => {
    return request(app)
      .get('/v1/cards?b=dom&c=serra angev&fuzzy=true')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        expect(response.body.length).toEqual(1)
        expect(response.body[0].name).toEqual('Serra Angel')
      })
  })

  it('should return all released version from card', () => {
    return request(app)
      .get('/v1/cards?c=emrakul, the aeons torn')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        expect(response.body.length).toEqual(4)
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
