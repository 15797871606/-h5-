class Data {
  constructor (data = {}) {
    this.app = data.app || ''
    this.work = data.work || ''
		this.ip = data.ip || ''
		this.city = data.city || ''
  }

}

export default Data