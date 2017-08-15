const Nightmare = require('nightmare')

module.exports = {

  USER_AGENT: 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.85 Safari/537.36',

	init() {
		this.nightmare = Nightmare({ show: false })
	},

  end() {
    this.nightmare.end()
  },

  parseURL(parseCallback, finalCallback, url, delay) {
    var self = this

    this.nightmare
      .useragent(this.USER_AGENT)
      .goto(url)
      .wait(delay)
      .evaluate(parseCallback)
      .then(function (result) {
        finalCallback(result)
      })
      .catch(function (error) {
        console.error(error)
        console.log('Trying with increased delay...')
        self.nightmare.end(() => {
          self.nightmare = Nightmare({ show: false })
          self.parseURL(parseCallback, finalCallback, url, delay)
        })
      })
  }
}