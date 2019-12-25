// pages/paging/addQualityScore/addQualityScore.js
var utils = require('../../../utils/util.js');
var httpRequest = require('../../../utils/httpRequest.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    check_type:'',//坐标系统、高程系统的正确性
    p_no:'',
    kjScore: 0 , //空间扣分
    cjScore: 0 ,   //采集扣分
    cgScore: 0,  //成果质量扣分
    allScore: 100, //总质量扣分
    scoreDetailList :[],  //评分列表
    checkcontent: ['坐标系统、高程系统的正确性',
                    '投影参数、转换参数的正确性',
                    '起算数据及选用的正确性、可靠性',
                    '控制测量成果',
                    '平面坐标精度',
                    '平面相对位置精度',
                    '高程精度',
                    '要素错误、缺漏情况',
                    '属性错误、缺漏情况',
                    '数据及结构的正确性',
                    '图面表达质量',
                    '表格表达质量',
                    '计算质量',
                    '技术文档表达质量',
                    '资料完整性、规范性'],  //检查内容
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      p_no : options.p_no
    })
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
    let that = this;
    this.initScoreTypeList();
    this.getQualityScoreList(this.data.p_no).then(scoreList => {
      let scoreDetailList = that.data.scoreDetailList
      for (let scoreItem of scoreList) {
        for (let detail of scoreDetailList) {
          if (detail.type_id === scoreItem.typeId) {
            detail.check_a = scoreItem.checkA
            detail.check_b = scoreItem.checkB
            detail.check_c = scoreItem.checkC
            detail.check_d = scoreItem.checkD
            detail.score = (scoreItem.checkA === '' ? 0 : scoreItem.checkA) * 42 
              + (scoreItem.checkB === '' ? 0 : scoreItem.checkB * 12)
              + (scoreItem.checkC === '' ? 0 : scoreItem.checkC * 4)
              + (scoreItem.checkD === '' ? 0 : scoreItem.checkD * 1)
            detail.check_result = scoreItem.checkResult
            detail.check_type = scoreItem.checkType
          }
        }
      }
      that.setData({
        scoreDetailList: scoreDetailList
      })
      that.deductScore()
    })
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
   * 初始化评分列表
   */
  initScoreTypeList: function () {
    let scoreDetailList = [];
    for(var i = 1 ; i < 16; i++){
      let scoreDetail = {
        checkcontent: this.data.checkcontent[i-1],
        check_a: "",
        check_b: "",
        check_c: "",
        check_d: "",
        check_result: "",
        check_type: "",
        project_no: this.data.p_no,
        score:0,   //扣除总分
        type_id: i
      };
      scoreDetailList.push(scoreDetail);
    }
    this.setData({
      scoreDetailList: scoreDetailList
    })
  },
  /**
   * 类别扣分
   */
  ascoreEvent:function(e){
    let scoreDetailList = this.data.scoreDetailList;
    for(let scoreDetail of scoreDetailList){
      if(e.currentTarget.id == scoreDetail.type_id){
        scoreDetail.check_a = e.detail.value;
        scoreDetail.score = scoreDetail.check_a * 42 + scoreDetail.check_b * 12 + scoreDetail.check_c * 4 + scoreDetail.check_d*1 ;
      }
    }
    this.setData({
      scoreDetailList: scoreDetailList
    });
    this.deductScore();
  },
  bscoreEvent: function (e) {
    let scoreDetailList = this.data.scoreDetailList;
    for (let scoreDetail of scoreDetailList) {
      if (e.currentTarget.id == scoreDetail.type_id) {
        scoreDetail.check_b = e.detail.value;
        scoreDetail.score = scoreDetail.check_a * 42 + scoreDetail.check_b * 12 + scoreDetail.check_c * 4 + scoreDetail.check_d*1;
      }
    }
    this.setData({
      scoreDetailList: scoreDetailList
    });
    this.deductScore();
  },
  cscoreEvent: function (e) {
    let scoreDetailList = this.data.scoreDetailList;
    for (let scoreDetail of scoreDetailList) {
      if (e.currentTarget.id == scoreDetail.type_id) {
        scoreDetail.check_c = e.detail.value;
        scoreDetail.score = scoreDetail.check_a * 42 + scoreDetail.check_b * 12 + scoreDetail.check_c * 4 + scoreDetail.check_d*1;
      }
    }
    this.setData({
      scoreDetailList: scoreDetailList
    });
    this.deductScore();
  },
  dscoreEvent: function (e) {
    let scoreDetailList = this.data.scoreDetailList;
    for (let scoreDetail of scoreDetailList) {
      if (e.currentTarget.id == scoreDetail.type_id) {
        scoreDetail.check_d = e.detail.value;
        scoreDetail.score = scoreDetail.check_a * 42 + scoreDetail.check_b * 12 + scoreDetail.check_c * 4 + scoreDetail.check_d*1;
      }
    }
    this.setData({
      scoreDetailList: scoreDetailList
    });
    this.deductScore();
  },
  /**
   * 检查类型
   */
  checkTypeEvent:function(e){
    let scoreDetailList = this.data.scoreDetailList;
    for (let scoreDetail of scoreDetailList) {
      if (e.currentTarget.id == scoreDetail.type_id) {
        scoreDetail.check_type = e.detail.value;
      }
    }
    this.setData({
      scoreDetailList: scoreDetailList
    });
  },
  /**检查结果 */
  checkResultEvent:function(e){
    let scoreDetailList = this.data.scoreDetailList;
    for (let scoreDetail of scoreDetailList) {
      if (e.currentTarget.id == scoreDetail.type_id) {
        scoreDetail.check_result = e.detail.value;
      }
    }
    this.setData({
      scoreDetailList: scoreDetailList
    });
  },
  // 根据项目编号获取质量评分列表
  getQualityScoreList(projectNo) {
    let that = this
    return new Promise((resolve, reject) => {
      httpRequest.requestUrl({
        url: "project/qualityscore/list/" ,
        method: "get",
        params:{ 'projectNo': projectNo }
      }).then(data => {
        resolve(data.list)
      })
    })
  },
  /**扣分统计 */
  deductScore:function(){
    let kjScore = 0; //空间扣分
    let cjScore = 0;   //采集扣分
    let cgScore = 0;  //成果质量扣分
    for(let scoreDetail of this.data.scoreDetailList){
      if(scoreDetail.type_id>0 && scoreDetail.type_id<5){
        kjScore += scoreDetail.score ;
      }
      if (scoreDetail.type_id >= 5 && scoreDetail.type_id < 11) {
        cjScore += scoreDetail.score;
      }
      if (scoreDetail.type_id >= 11 && scoreDetail.type_id < 16) {
        cgScore += scoreDetail.score ;
      }
    }
    console.log(cgScore)
    this.setData({
      kjScore: kjScore, //空间扣分
      cjScore: cjScore,   //采集扣分
      cgScore: cgScore, //成果质量扣分
      allScore: (100 - kjScore * 0.3 - cjScore * 0.4 - cgScore * 0.3).toFixed(2)
    })
  },
  /**
   * 返回
   */
  returnEvent:function(e){
    wx.navigateBack({
      detla:1
    })
  },
  /**
   * 提交
   */
  postEvent:function(e){
    var that = this;
    let scoreList = []
    for (let detail of this.data.scoreDetailList) {
      if (detail.check_a !== '' || detail.check_b !== '' || detail.check_c !== '' || detail.check_d !== '') {
        scoreList.push({
          'checkA': detail.check_a,
          'checkB': detail.check_b,
          'checkC': detail.check_c,
          'checkD': detail.check_d,
          'checkResult': detail.check_result,
          'checkType': detail.check_type,
          'projectNo': this.data.p_no,
          'typeId': detail.type_id
        })
      }
    }
    httpRequest.requestUrl({
      url: "/project/qualityscore/saveList",
      method: "post",
      params: {
        'scoreList': scoreList,
        'projectNo': that.data.p_no,
        'qualityScore': that.data.allScore
      }
    }).then(data => {
      utils.TipModel('提示', '提交质量评分完成');
      var pages = getCurrentPages();
      let prevPage = pages[pages.length - 2]; 
      //console.log(prevPage)
      prevPage.setData({
        qualityScore: that.data.allScore
      })
      wx.navigateBack({
        detla: 1
      })
    })
    
  }
})