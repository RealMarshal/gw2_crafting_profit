const router = require('express').Router()
const jsonParser = require('body-parser').json()

const items = require('./items')


router.get('/', (req, res) => {
	res.sendFile('index.html')
})

router.post('/get_items', jsonParser, (req, res) => {
	items.getItems(req.body.startPage, req.body.endPage)
  res.sendStatus(200)
})

router.post('/update_sold_bought', jsonParser, (req, res) => {
	items.getSoldBought(req.body.startPage, req.body.endPage)
  res.sendStatus(200)
})

router.post('/update_profit_sbpr', jsonParser, (req, res) => {
  items.getProfitTP(req.body.startPage, req.body.endPage)
  res.sendStatus(200)
})

router.get('/update_sorted_data', (req, res) => {
  items.updateSortedData()
  res.sendStatus(200)
})

router.get('/get_sorted_data', (req, res) => {
  items.getSortedData(function(sortedData) {

  	res.json(sliceSortedData(sortedData))

  	function sliceSortedData(sortedData) {
  		var slicedSortedData = {}

  		for (let data in sortedData) {
  			slicedSortedData[data] = sortedData[data].slice(0, 100) 
  		}
  		return slicedSortedData
  	}

  })
})

module.exports = router