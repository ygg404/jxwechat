var utils = require('../../../utils/util.js');
var httpRequest = require('../../../utils/httpRequest.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    p_no:'',
    p_id:0,
    ptwork:{},
    ptworkSelected:false,
    examineNote: '' //审定意见
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      p_no: options.p_no,
      p_id:options.id
    });
    this.getProjectinfo(options);
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
     * 获取项目基本信息
     */
  getProjectinfo: function (e) {
    var that = this;
    return new Promise((resolve, reject) => {
      httpRequest.requestUrl({
        url: "project/projectInfo/info/" + this.data.p_no,
        params: {},
        method: "get"
      }).then(data => {
        that.setData({
          ptwork: data.projectInfo
        })
        that.setData({
        examineNote: this.data.ptwork.examineNote
        })
        resolve(e)
      })
    })
  },
  /**
   * 查看项目信息
   */
  viewPtWorkEvent:function(e){
    let selected = this.data.ptworkSelected;
    this.setData({
      ptworkSelected : !selected
    });
  },

  /**
   * 审定意见
   */
  examineNoteEvent:function(e){
    this.setData({
      examineNote : e.detail.value
    })
  },
  /**
   * 返回
   */
  returnEvnet: function(e){
    wx.navigateBack({
      detla:1
    })
  },

//提交
  postEvent:function(e){
    var that = this;
    return new Promise((resolve, reject) => {
      httpRequest.requestUrl({
        url: "project/project/authorize",
        params: {
          id: Number(this.data.p_id),
          projectNo: that.data.p_no,
          examineNote: that.data.examineNote
        },
        method: "post"
      }).then(data => {
        utils.TipModel('提交成功');
        wx.navigateBack({
          detla: 1
        })
        resolve(e)
      })
    })
  },

})