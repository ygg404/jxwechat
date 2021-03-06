// pages/views/allocation-management/allocation-management.js
var utils = require('../../../utils/util.js');
var httpRequest = require('../../../utils/httpRequest.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    urlId: 'allocation-management',
    calendarShow: false,    //日历显示
    setStartflag: false, //设置开始日期标志
    projectTypes: [],  //类型选择
    projectTypeID: 0,
    dateInfo: '',
    pagination: {
      page: 1,
      rowsPerPage: 10,
      sidx: 'id',
      startDate: utils.getLastMonthDate(), //开始日期
      endDate: utils.formatDate(new Date()),// 结束日期
      search: '',
      p_stage: 1,
      stageId:2,
      descending: true
    },  //分页参数
    has_next: false,  //是否有上下页
    has_pre: false,
    tableList: []  //列表数据
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
    this.getProjectTypesInfo(null);
    this.getProjectsFromApi(null);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

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
* 获取项目类型
*/
  getProjectTypesInfo: function (e) {
    var that = this;
    return new Promise((resolve, reject) => {
      httpRequest.requestUrl({
        url: "set/projecttype/getProjectTypelist",
        params: {},
        method: "get"
      }).then(data => {
        var stagesInfo = ['所有类型'];
        for (var stage of data.list) {
          stagesInfo.push(stage.name);
        }
        that.setData({
          projectTypes: stagesInfo
        })
        resolve(e)
      })
    })
  },

  /**
   * 项目管理列表
   */
  getProjectsFromApi: function (e) {
    var that = this;
    return new Promise((resolve, reject) => {
    httpRequest.requestUrl({
      url: "/project/manage/page",
      params: {
        page: that.data.pagination.page,
        limit: that.data.pagination.rowsPerPage,
        key: that.data.pagination.search, 
        sidx: that.data.pagination.sidx,
        order: 'desc',
        startDate: that.data.pagination.startDate,
        endDate: that.data.pagination.endDate,
        dateItemId: 0
      },
      method: "get"
    }).then(data => {
      let hasPre = data.page.currPage > 1 && data.page.currPage <= data.page.totalPage
      let hasNext = data.page.currPage < data.page.totalPage
      that.setData({
        tableList : data.page.list,
        has_next: hasNext,  //是否有上下页
        has_pre: hasPre,
      })
    })
      resolve(e)
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
    this.getProjectsFromApi();
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
   * 类型改变
   */
  ProTypeChangeEvent: function (e) {
    var pagination = this.data.pagination;
    if (e.detail.value == 0) {
      pagination.search = '';
    } else {
      pagination.search = this.data.projectTypes[e.detail.value];
    }
    this.setData({
      projectTypeID: e.detail.value,
      pagination: pagination
    })
    this.getProjectsFromApi();
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

    this.getProjectsFromApi();
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
    this.getProjectsFromApi();
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
    this.getProjectsFromApi();
    wx.pageScrollTo({
      scrollTop: 0
    })
  },
  /**
   * 编辑
   */
  editEvent:function(e){
    let projectNo = ''
    for(let project of this.data.tableList){
      if(project['id'] == e.currentTarget.id){
        projectNo = project['projectNo'];
        break;
      }
    }
    wx.navigateTo({
      url: '../../paging/editallocation/editallocation?p_no=' + projectNo
    })
  }
})