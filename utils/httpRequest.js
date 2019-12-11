var app = getApp();

const requestUrl = ({
  url,
  params,
  success,
  method = "get"
}) => {
  wx.showLoading({
    title: '加载中',
  });
  let server = app.globalData.WebUrl;//域名
  let sessionId = wx.getStorageSync("sid"),
    that = this;
  if (sessionId != "" && sessionId != null) {
    var header = { 'Cookie': 'sid=' + sessionId,'token': app.globalData.token }
  } else {
    var header = {  'token': app.globalData.token }
  }
  return new Promise(function (resolve, reject) {
    wx.request({
      url: server + url,
      method: method,
      data: params,
      header: header,
      success: (res) => {
        console.log(res.data)
        wx.hideLoading();
        if (res.statusCode == 200){
          if (res.data.code == 401){
            wx.navigateTo({
              url: '../../login/login'
            });
            wx.showToast({
              title: res.data.msg || '请求出错',
              icon: 'none',
              duration: 2000,
              mask: true
            })
            return;
          }
        }
        if (res.data.code !== 0 || res['statusCode'] !== 200) {
          wx.showToast({
            title: res.data.msg || '请求出错',
            icon: 'none',
            duration: 2000,
            mask: true
          })
        }
        resolve(res.data)
      },
      fail: function (res) {
        wx.hideLoading();
        wx.showToast({
          title: res.data.msg || '',
          icon: 'none',
          duration: 2000,
          mask: true
        })
        reject(res.data)
      },
      complete: function () {
        wx.hideLoading()
      }
    })
  })
    .catch((res) => { })
}
/* 公共showTotast  loading 方法 */
module.exports = {
  requestUrl: requestUrl
}
