export default (app, data) => {
  app.get('/v1/blocks', (req, res) => {
    res.json(data.blockData)
  })
}
