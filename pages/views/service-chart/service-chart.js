// pages/views/service-chart/service-chart.js
var utils = require('../../../utils/util.js');
var httpRequest = require('../../../utils/httpRequest.js')
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    urlId: 'service-chart',
    calendarShow: false,    //日历显示
    dateInfo: '',
    startDate: '',
    endDate: '',
    tableList: '',
    projectNumAll:0,         //项目合计个数
    projectMoneyAll: 0,       //项目合计应收
    projectGetMoneyAll: 0,     //项目合计实收
    projectNotReceiptsAll: 0,  //项目合计未收
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
    this.getBusinessFromApi();
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
   * 日历事件
   */
  CalendarEvent: function (e) {
    console.log(e);
    //关闭日历控件
    if (e.type == 'showEvent') {
      this.setData({
        calendarShow: e.detail.showCalendar
      })
      return;
    }

    if (e.type == 'setEvent' && this.data.setStartflag) {
      var startDate = this.data.startDate;
      startDate = e.detail.dateInfo;
      this.setData({
        startDate: startDate,
        calendarShow: false
      })
    }

    if (e.type == 'setEvent' && !(this.data.setStartflag)) {
      var endDate = this.data.endDate;
      endDate = e.detail.dateInfo;
      this.setData({
        endDate: endDate,
        calendarShow: false
      })
    }

    this.getBusinessFromApi();
  },

  /**
 * 设置开始时间
 */
  setStartDateEvent: function () {
    var startDate = this.data.startDate;
    this.setData({
      calendarShow: true,
      setStartflag: true,
      dateInfo: startDate
    });

  },

  /**
   * 设置结束时间
   */
  setEndDateEvent: function () {
    var endDate = this.data.endDate;
    this.setData({
      calendarShow: true,
      setStartflag: false,
      dateInfo: endDate
    });

  },

  /**
 * 获取各业务员汇总统计表
 */
  getBusinessFromApi: function () {
    var that = this;
    httpRequest.requestUrl({
      url: "/finance/account/getFinanceList?order=asc&sidx=contract_business&startDate=" + that.data.startDate + "&endDate=" + that.data.endDate,
      data: {},
      method: "get"
    }).then(data => {
      that.tableDataInit(data.list)
    })
  },
  // 表格初始化
  tableDataInit(datalist) {
    let projectNumAll = 0;         //项目合计个数
    let projectMoneyAll = 0;       //项目合计应收
    let projectGetMoneyAll = 0;     //项目合计实收
    let projectNotReceiptsAll = 0;  //项目合计未收
    let contractBusiness = null
    datalist.forEach((item, index) => {
      //选择业务负责人的时候
      item.BusinessShow = false
      item.footerShow = false
      projectNumAll += 1
      projectMoneyAll += item.contractMoney
      projectGetMoneyAll += item.projectActuallyReceipts
      projectNotReceiptsAll += item.projectNotReceipts
    })
    //统计结算
    datalist.forEach((item, index) => {
      if (contractBusiness !== item.contractBusiness) {
        item.BusinessShow = true
        contractBusiness = item.contractBusiness
        let projectSum = 0
        let projectShould = 0
        let projectAct = 0
        let projectNot = 0

        for (let i = index; i < datalist.length; i++) {
          if (datalist[i].contractBusiness === contractBusiness) {
            projectSum += 1

            //总的合计
            projectShould += datalist[i].contractMoney
            projectAct += datalist[i].projectActuallyReceipts
            projectNot += datalist[i].projectNotReceipts
            //项目数量
            datalist[i].projectSum = projectSum
            //应收
            datalist[i].projectShould = parseFloat(projectShould.toFixed(2))
            //实收
            datalist[i].projectAct = parseFloat(projectAct.toFixed(2))
            //未收
            datalist[i].projectNot = parseFloat(projectNot.toFixed(2))
            if (i >= datalist.length - 1) datalist[i].footerShow = true
          } else {
            datalist[i - 1].footerShow = true
            break
          }
        }
        this.totalProjectAct = parseFloat(this.totalProjectAct).toFixed(2)
        this.totalProjectNot = parseFloat(this.totalProjectNot).toFixed(2)
      }
    })
    this.setData({
      tableList: datalist,
      projectNumAll: projectNumAll,         //项目合计个数
      projectMoneyAll: projectMoneyAll,       //项目合计应收
      projectGetMoneyAll: projectGetMoneyAll,     //项目合计实收
      projectNotReceiptsAll: projectNotReceiptsAll,  //项目合计未收
    })
  }
})