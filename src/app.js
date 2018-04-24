import { boot } from './server'

boot().then(app => {
  const port = process.env.PORT || 3131
  console.log(`Listening: http://localhost:${port}/v1/cards?c=serra%20nglle&fuzzy=true`)
  app.listen(port)
})
