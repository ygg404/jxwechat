                var utils = require('../../../utils/util.js');
                var httpRequest = require('../../../utils/httpRequest.js');
                var app = getApp();
                Page({

                  /**
                   * 页面的初始数据
                   */
                  data: {
                    ptworkSelected:false,
                    ptwork:{},
                    p_no:'',
                    projectInfo:'',//项目信息
                    workTypeList:[],  //工作类型列表
                    outPutGroupList:[],   //产值组列表 

                    groupradio: 0, //被选中单选按钮 groupId的值

                    totalOutput: 0,  //总产值
                    cutOffTime:'',   //结算时间
                    multiIndex: [0, 0],  //年月选择
                    multiArray: [],
                  },

                  /**
                   * 生命周期函数--监听页面加载
                   */
                  onLoad: function (options) {
                    this.setData({
                      p_no : options.p_no
                    });
                    this.initMonthDatePicker();
                    //获得结算时间
                    this.getCutoffTime(options).then(success => {
                      //组项目成本列表信息
                    this.getOutPutGroupList(options).then(success => {
                      //项目基本信息
                      this.getProjectinfo(options).then(success => {
                        //数据处理
                        this.outPutGroupDataInit();
                        //项目结算数据处理
                        this.gettotalOutput();
                      })
                    })  
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
                 * 初始化年月控件
                 */
                  initMonthDatePicker: function () {
                    let yearArr = [];
                    let monthArr = [];
                    for (let year = 2000; year < 2100; year++)yearArr.push(year);
                    for (let month = 1; month <= 12; month++) {
                      let mstr = ''
                      if (month < 10) {
                        mstr = '0' + month.toString();
                      } else {
                        mstr = month.toString();
                      }
                      monthArr.push(mstr);
                    }
                    let multiArr = [];
                    multiArr.push(yearArr);
                    multiArr.push(monthArr);
                    this.setData({
                      multiArray: multiArr
                    });
                  },
                  /**
                   * 查看项目基本信息
                   */
                  viewPtWorkEvent:function(e){
                    let selected = this.data.ptworkSelected;
                    this.setData({
                      ptworkSelected: !selected
                    })
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
                        resolve(e)
                      })
                    })
                  },
                  /**
                * 获取结算时间
                */
                  getCutoffTime: function (e) {
                    var that = this;
                    return new Promise((resolve, reject) => {
                      httpRequest.requestUrl({
                        url: "project/quality/getInfo",
                        params: { projectNo: this.data.p_no},
                        method: "get"
                      }).then(data => {
                          let cuttime = new Date(data.checkQuality.cutOffTime) ;
                          let cutyear = cuttime.getFullYear();
                          let cutmonth = cuttime.getMonth();
                          that.setData({
                            multiIndex: [cutyear - 2000, cutmonth ],
                          })
                        resolve(e)
                      })
                    })
                  },
                
                // 获取工作组的产值核算
                  getOutPutGroupList: function (e) {
                    var that = this;
                    return new Promise((resolve, reject) => {
                      httpRequest.requestUrl({
                        url: "project/checkoutput/getOutPutGroup/" + this.data.p_no,
                        method: "get"
                      }).then(data => {
                        this.setData({
                          outPutGroupList: data.list
                        })
                        let grouplist = this.data.outPutGroupList;
                        for (let group of grouplist) {
                          if (group.checked != false) {
                            //设置供用户点选的选项框的值
                            this.setData({
                              //设置供用户点选的选项框的值 默认最后一组
                              workTypeList: group.checkOutputVoList,
                              //复选按钮默认选中最后一个
                              groupradio:group.groupId
                            })
                          }
                        } 
                        resolve(e)
                      })
                    })
                  },
                  outPutGroupDataInit:function(){
                    var temp = this.data.outPutGroupList;      
                    for (let item of temp) {
                      if (item.checked == true) {
                        for (let itemcopvl of item.checkOutputVoList) {
                          if (itemcopvl.projectRatio == null) {
                            itemcopvl.projectRatio = 1;
                          }
                          if (itemcopvl.workLoad == null) {
                            itemcopvl.workLoad = 0;
                          }
                          itemcopvl.typeOutput = 0
                          itemcopvl.typeOutput = parseFloat((itemcopvl.projectRatio * itemcopvl.unitOutput * itemcopvl.workLoad).toFixed(2))
                        }
                      }
                    }
                    this.setData({
                      outPutGroupList: temp
                    })
                  },
                  /**
                   * 工作组改变
                   */
                  workGroupChangeEvent:function(e){
                  this.setData({
                    groupradio: e.detail.value
                  })
                  for(let item of this.data.outPutGroupList){
                    if(item.groupId == this.data.groupradio){
                      this.setData({
                        workTypeList:item.checkOutputVoList
                      })
                      break;
                    }
                  }
                  },
                  /**
                   *工作类型点击   
                  */
                  workCheckEvent :function(e){
                    console.log(e.detail.value);
                    let change = this.data.outPutGroupList;
                    for (let group of change){
                      if (this.data.groupradio == group.groupId){
                      if(group.checked != false){
                      for (let outPutWrap of group.checkOutputVoList){  
                        if (outPutWrap.projectRatio == null) {
                          outPutWrap.projectRatio = 1;
                        }
                        if (outPutWrap.workLoad == null) {
                          ioutPutWrap.workLoad = 0;
                        } 
                        outPutWrap.groupId = group.groupId;
                          if (e.detail.value.indexOf(outPutWrap.typeId.toString())>=0 ){
                          outPutWrap.checked = true;    
                        }else{
                          outPutWrap.checked = false;
                        }
                      }
                    }
                      }
                    }
                    this.setData({
                      outPutGroupList: change
                    })

                  },

  //难度
                  projectRatioEvent:function(e){
                    let groupId = e.currentTarget.id.split('_')[0];
                    let typeId = e.currentTarget.id.split('_')[1];
                    let oPGList = this.data.outPutGroupList;
                    let allput = 0; //总产值
                    for (let group of oPGList) {
                      if (group.groupId == groupId) {
                        if (group.checkOutputVoList != null){
            for (let outPutWrap of group.checkOutputVoList) {
                          if (outPutWrap.typeId == typeId) {
                            if (e.detail.value == "") {
                              outPutWrap.projectRatio = null;
                              outPutWrap.typeOutput = 0;
                            } else {
                              outPutWrap.projectRatio = e.detail.value;
                              allput = outPutWrap.workLoad * Number(outPutWrap.projectRatio) * outPutWrap.unitOutput;
                              outPutWrap.typeOutput = allput;
                            }
                          }
                        
                        }
                        }
                      } 
                    }
                    this.setData({
                      outPutGroupList: oPGList
                    })
                    this.gettotalOutput()
                  },
  //工作量
                  workLoadEvent:function(e){
                    let groupId = e.currentTarget.id.split('_')[0];
                    let typeId = e.currentTarget.id.split('_')[1];
                    let oPGList = this.data.outPutGroupList;
                    let allput = 0; //总产值
                    for (let group of oPGList) {
                      if (group.groupId == groupId) {
                        if (group.checkOutputVoList != null) {
                          for (let outPutWrap of group.checkOutputVoList) {
                            if (outPutWrap.typeId == typeId) {
                              if (e.detail.value == "") {
                                outPutWrap.workLoad = null;
                                outPutWrap.typeOutput = 0;
                              } else {
                                outPutWrap.workLoad = e.detail.value;
                                allput = Number(outPutWrap.workLoad) * outPutWrap.projectRatio * outPutWrap.unitOutput;
                                outPutWrap.typeOutput = allput;
                              }
                            }

                          }
                        }
                      }
                    }
                    this.setData({
                      outPutGroupList: oPGList
                    })
                    this.gettotalOutput()
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
                   * 保存
                   */
                  saveEvent:function(e){
                    let that = this;
                    let ptwork = this.data.ptwork;
                    let outPutWrap = [];
                    for (let group of ptwork.groupList){
                      let putWrap = {
                        groupId: group.id,
                        projectOutPut: group.allPutNum
                      }
                      outPutWrap.push(putWrap);
                    }
                    wx.request({
                      url: app.globalData.WebUrl + "project/output/" ,
                      method: 'Post',
                      data:{
                        groupList: ptwork.groupList,
                        outPutWrap: outPutWrap,
                        projectNo:that.data.p_no
                      },
                      header: {
                        'Authorization': "Bearer " + app.globalData.SignToken
                      },
                      success: function (res) {
                        that.postCutoffTimeToAPI();
                        if (res.statusCode == 200) {
                          utils.TipModel('提示', res.data.message);
                        }
                      }
                    });
                  },
                  /**
                   *  提交审定 
                   */
                  postEvent:function(e){

                  // 提交结算时间
                    this.postCutoffTimeToAPI(e).then(success => {
                      // 保存产值核算
                      this.postOutputToApi(e).then(success=>{
                        wx.navigateBack({
                          delta: 1
                        })
                      })
                    })
                  },

                  /**
                   * 提交结算时间 
                   */
                  postCutoffTimeToAPI(e){
                    var that = this;
                    return new Promise((resolve, reject) => {
                      httpRequest.requestUrl({
                        url: "project/quality/save",
                        params: {
                          projectNo: this.data.p_no,
                          cutOffTime: that.data.multiArray[0][that.data.multiIndex[0]] + '-' + that.data.multiArray[1][that.data.multiIndex[1]] + "-01"
                          },
                        method: "post"
                      }).then(data => {  
                        resolve(e)
                      })
                    })
                  },

                // 保存产值核算
                  postOutputToApi:function(e){
                    var that = this;
                    return new Promise((resolve, reject) => {
                      httpRequest.requestUrl({
                        url: "project/checkoutput/save",
                        params: {
                          projectNo: this.data.p_no,
                          pgroupList: this.data.outPutGroupList,
                          projectActuallyOutput: this.data.totalOutPut
                        },
                        method: "post"
                      }).then(data => {
                        wx.showToast({
                          title: '成功',
                          icon: 'success',
                          duration: 2000
                        })
                        resolve(e)
                      })
                    })
                  },

                  /**
                   * 年月控件(结算时间))
                   */
                  cutDateChange: function (e) {
                    console.log(e.detail.value);
                    this.setData({
                      multiIndex: e.detail.value,
                    });
                  },
            
                

                //计算总产值
                  gettotalOutput:function(){
                    var temp = this.data.outPutGroupList
                    var totalOutput = 0;
                    for(let item of temp){
                      if (item.checked != false && item.checkOutputVoList != null){
                        var all = 0;
                        for (let itemcopvList of item.checkOutputVoList){
                          if(itemcopvList.checked != false){
                            all += itemcopvList.typeOutput;
                          }
                        }
                        item.projectActuallyOutput = all;
                        totalOutput += item.projectActuallyOutput
                      }
                    }
                    this.setData({
                      outPutGroupList: temp,
                      totalOutput: totalOutput
                    })
                  }

                })