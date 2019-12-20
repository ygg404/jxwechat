var utils = require('../../../utils/util.js');
var httpRequest = require('../../../utils/httpRequest.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    urlId:'recycle-management',
    calendarShow: false,    //日历显示
    setStartflag: false, //设置开始日期标志
    dateInfo: '',
    projectTypes: [],  //阶段选择
    projectTypeID: 0,
    pagination: {
      'page': 1,
      'rowsPerPage': 10,
      'sortBy': 'id',
      'startDate': '', //开始日期
      'endDate': '',// 结束日期
      'search': '',
      'p_stage': 1,
      'descending': true
    },  //分页参数
    has_next: false,  //是否有上下页
    has_pre: false,
    tableList: []  //列表数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getContractFromApi();
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

  
  getContractFromApi: function () {
    var that = this;
    httpRequest.requestUrl({
      url: "project/recycle/list",
      params: {
        page: that.data.pagination.page,
        limit: that.data.pagination.rowsPerPage,
        key: that.data.pagination.search,
        sidx: 'id',
        order: that.data.pagination.sortBy,
        startDate: that.data.pagination.startDate,
        endDate: that.data.pagination.endDate
      },
      method: "get"
    }).then(data => {
      let hasPre = data.page.currPage > 1 && data.page.currPage <= data.page.totalPage
      let hasNext = data.page.currPage < data.page.totalPage
      that.setData({
        tableList: data.page.list,
        has_next: hasNext,  //是否有上下页
        has_pre: hasPre,
      })
    })
  },



  /**
   * 搜索关键字事件
   */
  searchInputEvent: function (e) {
    var pagination = this.data.pagination;
    pagination.search = e.detail.value;
    this.setData({
      pagination: pagination
    });
    this.getContractFromApi();
  },

  /**
   * 设置开始时间
   */
  setStartDateEvent: function () {
    var startDate = this.data.pagination.startDate;
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
    var endDate = this.data.pagination.endDate;
    this.setData({
      calendarShow: true,
      setStartflag: false,
      dateInfo: endDate
    });
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
      var pagination = this.data.pagination;
      pagination.startDate = e.detail.dateInfo;
      this.setData({
        pagination: pagination,
        calendarShow: false
      })
    }

    if (e.type == 'setEvent' && !(this.data.setStartflag)) {
      var pagination = this.data.pagination;
      pagination.endDate = e.detail.dateInfo;
      this.setData({
        pagination: pagination,
        calendarShow: false
      })
    }
    this.getContractFromApi();
  },

  /**
   * 点击选中弹出详情
   */
  detailClickEvent: function (e) {
    console.log(e.currentTarget.id);
    let tableList = this.data.tableList;
    for (let table of tableList) {
      if (table['id'] == e.currentTarget.id) {
        table['selected'] = !table['selected'];
      }
      else {
        table['selected'] = false;
      }
    }
    this.setData({
      tableList: tableList
    })
  },

  /**
   * 上一页
   */
  prePage: function (e) {
    let pagination = this.data.pagination;
    pagination.page -= 1;
    this.setData({
      pagination: pagination
    });
    this.getContractFromApi();
    wx.pageScrollTo({
      scrollTop: 0
    })
  },

  /**
   * 下一页
   */
  nextPage: function (e) {
    let pagination = this.data.pagination;
    pagination.page += 1;
    this.setData({
      pagination: pagination
    });
    this.getContractFromApi();
    wx.pageScrollTo({
      scrollTop: 0
    })
  },

  /**
   * 删除
   */
  deleteEvent:function(e){
    var that = this;
    var delContractNo = e.currentTarget.id
    wx.showModal({
      title: '提示',
      content: '此操作将永久删除编号为[' + delContractNo + ']的项目信息, 是否继续?',
      success: function (sm) {
        if (sm.confirm) {
          httpRequest.requestUrl({
            url: "project/recycle/delete",
            params: { projectNo: delContractNo},
            method: "post"
          }).then(data => {
            that.getContractFromApi();
          })
        }
      }
    });
  },
  /**
   * 恢复
   */
  restoreEvent:function(e){
    var that = this;
    var restoreId = Number(e.currentTarget.id);
    var restoreContractNo = e.currentTarget.dataset.value;
    wx.showModal({
      title: '提示',
      content: '是否将恢复编号为[' + restoreId +']的项目信息?',
      success: function (sm) {
        if (sm.confirm) {
          httpRequest.requestUrl({
            url: "/project/recycle/update",
            params: {
              id: restoreId, 
              projectNo: restoreContractNo 
              },
            method: "post"
          }).then(data => {
            that.getContractFromApi();
          })
        }
      }
    });
  }
})