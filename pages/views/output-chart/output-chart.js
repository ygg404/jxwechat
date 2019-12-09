// pages/views/output-chart/output-chart.js
var utils = require('../../../utils/util.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    urlId: 'output-chart',
    multiIndexStart: [0, 0],  //年月选择
    multiIndexEnd: [0, 0],
    multiArray: [],
    workGroupList:[],
    groupNameList:[],
    groupIndex:0,
    tableList:[],
    totalOutPut: 0,//项目合计数
    totalProjectSum: 0,//产值总数 
    outPutTitle:'',  //产值标题
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    let curdate = new Date();
    let predate = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
    let endDate = utils.formatDate(curdate);
    let startDate = utils.formatDate(predate);

    this.setData({
      startDate: startDate,
      endDate: endDate
    });

    this.initMonthDatePicker();
    this.getWorkGroupList();
    this.getOutputchartsFromApi();
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
   * 初始化年月控件
   */
  initMonthDatePicker: function () {
    let yearArr = [];
    let monthArr = [];
    for(let year=2000; year<2100;year++)yearArr.push(year);
    for(let month=1 ; month<=12; month++){
      let mstr = ''
      if(month<10){
        mstr = '0' + month.toString();
      }else{
        mstr = month.toString();
      }
      monthArr.push(mstr);
    }
    let multiArr = [];
    multiArr.push(yearArr);
    multiArr.push(monthArr);
    this.setData({
      multiArray:multiArr
    });

    var curdate = new Date();
    let curyear = curdate.getFullYear();
    let curmonth = curdate.getMonth();
    this.setData({
      multiIndexStart: [curyear-2000, curmonth-1],
      multiIndexEnd: [curyear - 2000, curmonth-1]
    })
  },

  /**
   * 起始年月控件
   */
  startMultiPickerChange: function (e) {
    console.log(e.detail.value);
    this.setData({
      multiIndexStart : e.detail.value,
      multiIndexEnd : e.detail.value
    });
    this.getOutputchartsFromApi();
  },

  /**
   * 结束年月控件
   */
  endMultiPickerChange: function (e) {
    let multiIndexStart = this.data.multiIndexStart;
    if (e.detail.value[0] < multiIndexStart[0] || 
      (e.detail.value[0] == multiIndexStart[0] && e.detail.value[1] < multiIndexStart[1])){
      multiIndexStart = e.detail.value; 
    }
    this.setData({
      multiIndexStart: multiIndexStart,
      multiIndexEnd: e.detail.value
    });
    this.getOutputchartsFromApi();
  },

  /**
  * 获取工作组类型信息
  */
  getWorkGroupList: function () {
    let that = this;
    wx.request({
      url: app.globalData.WebUrl + "/set/workgroup/selectworkgroup",
      method: 'GET',
      header: {
        'token': app.globalData.token
      },
      success: function (res) {
        if (res.statusCode == 200) {
          let groupNameList = ['全部'];
          for(let group of res.data.list){
            groupNameList.push(group.name);
          } 
          that.setData({
            workGroupList: res.data.list,
            groupNameList: groupNameList,
            groupIndex: 0
          });
        }
      }
    });
    
  },
  /**
   * 作业组选择
   */
  workGroupChangeEvent:function(e){
    this.setData({
      groupIndex : e.detail.value
    });
    this.getOutputchartsFromApi();
  },
  /**
   * 获取产值统计表
   */
  getOutputchartsFromApi:function(){
    let workId = 0;
    if(this.data.groupIndex > 0){
      for (let workgroup of this.data.workGroupList){
        if(workgroup.name == this.data.groupNameList[this.data.groupIndex])
          workId = workgroup.id;
      }
    }
    if(workId == 0)workId=''
    //开始日期
    let startDate = this.data.multiArray[0][this.data.multiIndexStart[0]] + '-' 
                    + this.data.multiArray[1][this.data.multiIndexStart[1]] + '-01'
    //结束日期
    let date = new Date(this.data.multiArray[0][this.data.multiIndexEnd[0]] + '-'
                    + this.data.multiArray[1][this.data.multiIndexEnd[1]] + '-01');
    //let endDate = date.setMonth(date.getMonth() + 1);
    let endDate = utils.formatDate(new Date(date.getFullYear() , date.getMonth()+1 , 0));  

    if (this.data.multiIndexStart[0] == this.data.multiIndexEnd[0] &&
         this.data.multiIndexStart[1] == this.data.multiIndexEnd[1]){
        this.setData({
          outPutTitle: this.data.multiArray[0][this.data.multiIndexStart[0]] + '年' + this.data.multiArray[1][this.data.multiIndexStart[1]] + '月'
        })
    }else{
      this.setData({
        outPutTitle: this.data.multiArray[0][this.data.multiIndexStart[0]] + '年' 
                    + this.data.multiArray[1][this.data.multiIndexStart[1]] + '月至' 
                    + this.data.multiArray[0][this.data.multiIndexEnd[0]] + '年'
                    + this.data.multiArray[1][this.data.multiIndexEnd[1]] + '月'
      })
    }
    var that = this;
    wx.request({
      url: app.globalData.WebUrl + "/project/chartoutput/list?startDate=" + startDate + "&endDate=" + endDate + "&groupId=" + workId,
      method: 'GET',
      // 设置请求的 header  
      header: {
        'token':  app.globalData.token
      },
      success: function (res) {
        if (res.statusCode == 200) {
          that.tableDataInit(res.data.list)
        }

      },
      fail: function (res) {

      }
    })
  },
  // 表格初始化
  tableDataInit: function(datalist) {
    let totalOutPut = 0
    let totalProjectSum = 0
    let groupName = null
    datalist.forEach((item, index) => {
      item.groupShow = false
      item.footerShow = false
      totalProjectSum += 1
      let outputtemp = parseFloat((item.projectActuallyOutput == null ? 0 : item.projectActuallyOutput).toFixed(2))
      totalOutPut = parseFloat((totalOutPut + outputtemp).toFixed(2))
    })

    datalist.forEach((item, index) => {
      if (groupName !== item.groupName) {
        item.groupShow = true
        groupName = item.groupName
        let projectSum = 0
        let outputSum = 0
        for (let i = index; i < datalist.length; i++) {
          if (datalist[i].groupName === groupName) {
            projectSum += 1
            outputSum += datalist[i].projectActuallyOutput
            datalist[i].projectSum = projectSum
            datalist[i].outputSum = parseFloat(outputSum.toFixed(2))
            if (i >= datalist.length - 1) datalist[i].footerShow = true
          } else {
            datalist[i - 1].footerShow = true
            break
          }
        }
        // this.dataList.push(groupdat)
      }
    })
    this.setData({
      tableList : datalist,
      totalOutPut: totalOutPut,
      totalProjectSum: totalProjectSum
    }) 
    console.log(this.data.tableList)
  },
})