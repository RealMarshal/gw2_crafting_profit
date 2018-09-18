const fs = require('fs')
const request = require('request')
const nightmare = require('./nightmare')
const utils = require('./utils')

var parsedItems = []

module.exports = items = {


	getItems(startPage, endPage) {
		const BASE_URL = 'https://api.gw2efficiency.com/items/crafting-profit?page_size=200&page='

	  console.log('Getting new items...')

	  //Need to be rewrited using promises or recursion
		for (let page = startPage; page < endPage; page++) {
			request(BASE_URL + page, (err, res, body) => {
       if (err) {
        console.error(err)
      } else {
        fs.createWriteStream(`items/items${page}.json`).write(JSON.stringify(JSON.parse(body).results), 'utf-8')
        if ((page + 1) === endPage) {
          console.log('Completed')
        }
      }
     })
		}
	},


  parseItems(callback, startPage, endPage, path) {

    console.log('Parsing items...')

    parsePage(startPage)

    function parsePage(page) {
      console.log(`Parsing page ${page}`)

      fs.readFile(`${path}${page}.json`, 'utf-8', (err, data) => {
        if (err) {
          console.error(err)
        } else {
          try {
            parsedItems[page] = JSON.parse(data)
            page++
            if (page < endPage) { 
              parsePage(page)
            } else {
              callback()
            }
          } catch(err) {
            console.error(err.stack)
          }
        }
      })
    }
  },


  getSoldBought(startPage, endPage) {

    this.parseItems(function() {
      parseGW2BLTC(startPage, endPage)
    }, startPage, endPage, 'items/items')

    function parseGW2BLTC(startPage, endPage) {
      const BASE_URL = 'https://www.gw2bltc.com/en/item/'
      const DELAY = 500
      var modifiedItemsStream = fs.createWriteStream(`modified_items/modified_items${startPage}.json`)

      modifiedItemsStream.write('[')
      nightmare.init()

      console.log('\nParsing URL:')

      getInfo(startPage, 0)

      function getInfo(page, index) {
        if (index < parsedItems[page].length) {
          let item = parsedItems[page][index]
          let id = item.id
          let name = utils.parseName(item.name)

          let finalUrl = BASE_URL + id + '-' + name

          console.log(finalUrl)

          nightmare.parseURL(function parse() {
            let sold = document.querySelectorAll('.t-price tr')[6].getElementsByTagName('td')[1].innerHTML.split('<')[0]
            let bought = document.querySelectorAll('.t-price tr')[8].getElementsByTagName('td')[1].innerHTML.split('<')[0]
            return {sold: sold, bought: bought}
          }, function done(result) {
            item.sold = result.sold
            item.bought = result.bought

            modifiedItemsStream.write(JSON.stringify(item), 'utf-8')
            if ((index + 1) !== parsedItems[page].length) {
              modifiedItemsStream.write(',', 'utf-8')
            }

            getInfo(page, index+1)
          }, finalUrl, DELAY)

        } else {
          modifiedItemsStream.write(']')
          page++

          if (page < endPage) {
            console.log(`Starting page ${page}...`)
            modifiedItemsStream = fs.createWriteStream(`modified_items/modified_items${page}.json`)
            getInfo(page, 0)
          } else {
            console.log('Completed')
            nightmare.end()
          }
        }
      }
    }
  },


  getProfitTP(startPage, endPage) {

    this.parseItems(function() {
      updateItems(startPage, endPage)
    }, startPage, endPage, 'modified_items/modified_items')

    function updateItems(startPage, endPage) {
      const BASE_URL = 'https://api.gw2efficiency.com/items/crafting-profit?page_size=200&page='

      console.log('Updating items...')

      getInfo(startPage)

      function getInfo(page) {
        if (page < endPage) {
          console.log(`Updating page ${page}`)
          request(BASE_URL + page, (err, res, body) => { 
            if (err) {
              console.error(err)
            } else {
              let newItems = JSON.parse(body).results

              parsedItems[page].forEach(function(item, index, array) {
                item.craftingProfit = newItems[index].craftingProfit
                item.buy = newItems[index].buy
                item.sell = newItems[index].sell

                item.sbpr = (item.sold * 3 + item.bought * 0.5) * Math.sqrt(item.craftingProfit * 2) / 10000

                if ((index + 1) === array.length) {
                  fs.createWriteStream(`modified_items/modified_items${page}.json`).write(JSON.stringify(array), 'utf-8')
                  page++
                  getInfo(page)
                }
              })
            }
          })
        } else {
          console.log('Completed')
        }
      }      
    }
  },

  updateSortedData(startPage, endPage) {

    console.log('Updating sorted lists...')

    this.parseItems(function() {
      getSortedData()
    }, startPage, endPage, 'modified_items/modified_items')

    function getSortedData() {
      var mergedItems = []

      parsedItems.forEach(function(page) {
        page.forEach(function(item) {
          mergedItems.push(item)
        })
      })

      var sortedByProfit = [...mergedItems].sort(function(a, b) {
        return utils.compare(a, b, 'craftingProfit')
      })

      var sortedBySold = [...mergedItems].sort(function(a, b) {
        return utils.compare(a, b, 'sold')
      })
      var sortedByBought = [...mergedItems].sort(function(a, b) {
        return utils.compare(a, b, 'bought')
      })
      var sortedBySBPR = [...mergedItems].sort(function(a, b) {
        return utils.compare(a, b, 'sbpr')
      })

      fs.createWriteStream(`sorted_data/sorted_by_profit.json`).write(JSON.stringify(sortedByProfit), 'utf-8')
      fs.createWriteStream(`sorted_data/sorted_by_sold.json`).write(JSON.stringify(sortedBySold), 'utf-8')
      fs.createWriteStream(`sorted_data/sorted_by_bought.json`).write(JSON.stringify(sortedByBought), 'utf-8')
      fs.createWriteStream(`sorted_data/sorted_by_sbpr.json`).write(JSON.stringify(sortedBySBPR), 'utf-8')

      console.log('Completed')
    }
  },

  getSortedData(callback) {
    var args = ['sorted_by_profit', 'sorted_by_sold', 'sorted_by_bought', 'sorted_by_sbpr']
    var sortedData = {}
    var doneThreads = 0

    args.forEach(function(arg, index, array) {
      fs.readFile(`sorted_data/${arg}.json`, 'utf-8', (err, data) => {
        if (err) {
          console.error(err)
        } else {
          let key = arg.split('_').map(function(word, ind) {
            if (ind === 0) {
              return word
            }
            return word.charAt(0).toUpperCase() + word.slice(1)
          }).join('')
          sortedData[key] = JSON.parse(data)
          doneThreads++
          if (doneThreads === array.length) {
            callback(sortedData)                         
          }
        }
      })
    })
  }
}