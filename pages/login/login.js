var app = getApp();
var utils = require('../../utils/util.js');
var first = require('../../utils/index.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userAccount:'',  //用户
    password:'',      //密码
    loadingShow:false, //是否显示
    loadtxt:'登录中'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取存放在本地的用户密码
    this.setData({
      userAccount: wx.getStorageSync('userAccount'),
      password: wx.getStorageSync('password')
    });

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  /**
   * 登录事件
   */
  loginTap: function () {
    let that = this
    this.setData({
      loadingShow: true
    })
    this.loginFun().then(success => {
      app.globalData.token = success.token
      that.getNavFun().then( success => {
        app.globalData.permissions = success.permissions
        console.log(app.globalData.permissions)

        that.getUserInfoFun().then(success => {
          app.globalData.userInfo = success.user
          console.log(app.globalData.userInfo)
        })

        //要跳转的首页
        let index = first.firstLoad()
        wx.navigateTo({
          url: '../views/' + index + '/' + index
        });
      })
    })
    
  },
  /**
   * 登录
   */
  loginFun: function() {
    var that = this;
    return new Promise((resolve, reject) => {
      wx.request({
        url: app.globalData.WebUrl + '/sys/login', //接口地址 
        method: 'post',
        data: {
          useraccount: that.data.userAccount,
          password: that.data.password,
          uuid: '',
          captcha: ''
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          if (res.data.code == 0){
            //登录成功保存用户密码
            wx.setStorageSync("userAccount", that.data.userAccount);
            wx.setStorageSync("password", that.data.password);
            console.log(res.data);
            resolve(res.data);
          }else{
            utils.TipModel('错误', res.data.msg, 0);
          }
        },
        fail: function () {
          utils.TipModel('错误', '网络异常', 0);
        },
        complete: function () {
          that.setData({
            loadingShow: false
          })
        }
      })
    })
  },
  /**
 * 获取用户信息
 */
  getUserInfoFun: function () {
    let that = this;
    return new Promise((resolve, reject) => {
      wx.request({
        url: app.globalData.WebUrl + '/sys/user/info', //接口地址 
        method: 'get',
        header: {
          'token': app.globalData.token // 默认值
        },
        success: function (res) {
          if (res.data.code == 0) {
            console.log(res.data);
            resolve(res.data);
          } else {
            utils.TipModel('错误', res.data.msg, 0);
          }
        },
        complete: function () {
          that.setData({
            loadingShow: false
          })
        }
      })
    })
  },
  /**
   *获取导航菜单 
   */
  getNavFun: function(){
    var that = this;
    return new Promise((resolve, reject) => {
      wx.request({
        url: app.globalData.WebUrl + '/sys/menu/nav', //接口地址 
        method: 'get',
        header: {
          'token': app.globalData.token // 默认值
        },
        success: function (res) {
          if (res.data.code == 0) {
            console.log(res.data);
            resolve(res.data);
          } else {
            utils.TipModel('错误', res.data.msg, 0);
          }
        },
        complete: function () {
          that.setData({
            loadingShow: false
          })
        }
      })
    })
  },
  /*
  *获取用户名
  */
  userAccountInput: function (e) {

    this.setData({
      userAccount: e.detail.value
    });

  },
  /*
  *获取密码
  */
  passwordInput: function (e) {
    this.setData({
      password: e.detail.value
    });

  }
})