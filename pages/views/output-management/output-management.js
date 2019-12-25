// pages/views/projectwork-management/projectwork-management.js
var utils = require('../../../utils/util.js');
var httpRequest = require('../../../utils/httpRequest.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    urlId: 'output-management',
    calendarShow: false,    //日历显示
    setStartflag: false, //设置开始日期标志
    backShow: false,  //返修显示
    backEditShow: false, //返修编辑显示
    dateInfo: '',
    projectTypes: [],  //阶段选择
    projectTypeID: 0,
    pagination: {
      'page': 1,
      'rowsPerPage': 10,
      'sortBy': 'id',
      'startDate': utils.getLastMonthDate(), //开始日期
      'endDate': utils.formatDate(new Date()),// 结束日期
      'search': '',
      'p_stage': 1,
      'descending': true,
      'stageId': 3
    },  //分页参数
    has_next: false,  //是否有上下页
    has_pre: false,
    tableList: [],  //列表数据
    curPro: {}, //当期项目
    rshortcutList: [], //回复短语
    rNameList: [],
    rindex: 0,
    backId: '',
    executes: ''  //回复内容
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getProjectTypesInfo();
    this.getProjectsFromApi();
    this.getShortCutList();
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
    this.onLoad();
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
   *获取快捷短语 
   */
  getShortCutList: function () {
    var that = this;
    wx.request({
      url: app.globalData.WebUrl + "shortcut/13/",
      method: 'GET',
      header: {
        'Authorization': "Bearer " + app.globalData.SignToken
      },
      success: function (res) {
        if (res.statusCode == 200) {
          let nameList = ['回复短语快捷输入'];
          for (let shortcut of res.data) {
            nameList.push(shortcut.shortNote);
          }
          that.setData({
            rshortcutList: res.data,
            rNameList: nameList
          })
        }
      }
    });
  },
  /**
   * 回复短语快捷输入
   */
  rshotrcutChangeEvent: function (e) {
    let executes = e.detail.value == 0 ? '' : this.data.rNameList[e.detail.value];
    this.setData({
      tindex: e.detail.value,
      executes: executes
    })
  },

  /**
   * 项目立项列表
   */
  getProjectsFromApi: function () {
    var that = this;
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
   *编辑事件 
   */
  editClickEvent: function (e) {
    let curPro = {};
    for (let project of this.data.tableList) {
      if (project['id'] == e.currentTarget.id) {
        curPro = project;
        wx.navigateTo({
          url: '../../paging/editwork/editwork?p_no=' + curPro['projectNo'] + '&p_group=' + curPro['groupId'] + '&p_name=' + curPro['projectName'],
        });
        break;
      }
    }
  },
  /**
 *修改状态事件 
 */
  saveClickEvent: function (e) {
    let curPro = {};
    for (let project of this.data.tableList) {
      if (project['id'] == e.currentTarget.id) {
        curPro = project;
        break;
      }
    }
    var that = this;
    //提交
    wx.request({
      method: 'POST',
      url: app.globalData.WebUrl + 'projectWork/update/',
      header: {
        Authorization: "Bearer " + app.globalData.SignToken
      },
      data: {
        projectStage: curPro.workStage == 0 ? 1 : 0,
        projectNo: curPro.projectNo
      },
      success: function (res) {
        if (res.statusCode == 200) {
          utils.TipModel('提示', res.data.message);
          that.getProjectsFromApi();
        }
      }
    });

  },
  /**
   * 返修事件
   */
  backClickEvent: function (e) {
    for (let pro of this.data.tableList) {
      if (pro['id'] == e.currentTarget.id) {
        this.setData({
          curPro: pro,
          backShow: true
        });
        break;
      }
    }

  },
  /**
   * 编辑事件
   */
  editEvent: function (e) {
    var projectInfo = e.currentTarget.dataset.value;
    if(projectInfo.isOutput != 1){
      wx.showToast({
        title: '项目未核算',
        duration: 3000
      })
      return;
    }
    let projectNo = ''
    for (let project of this.data.tableList) {
      if (project['id'] == e.currentTarget.id) {
        projectNo = project['projectNo'];
        break;
      }
    }
    var pi = JSON.stringify(projectInfo);
    wx.navigateTo({
      url: '../../paging/editoutput/editoutput?p_no=' + projectNo 
    })
  },
  /**
   * 取消
   */
  returnBackEvent: function (e) {
    this.setData({
      backShow: false
    })
  },
  /**
   * 取消恢复短语
   */
  returnShortCutEvent: function (e) {
    this.setData({
      backEditShow: false
    })
  },
  /**
   * 回复短语输入
   */
  executesInputEvent: function (e) {
    this.setData({
      executes: e.detail.value
    })
  },
  /**
   * 提交回复短语
   */
  postShortCutEvent: function (e) {
    var that = this;
    if (that.data.executes == '') {
      utils.TipModel('错误', '请填写回复短语', 0);
      return;
    }
    //提交短语
    wx.request({
      method: 'POST',
      url: app.globalData.WebUrl + 'addNote/',
      header: {
        Authorization: "Bearer " + app.globalData.SignToken
      },
      data: {
        back_id: that.data.backId,
        note: that.data.executes
      },
      success: function (res) {
        if (res.statusCode == 200) {
          that.postToQuality();
        }
      }
    });
  },
  /**
   * 提交至质量检查
   */
  postToQuality: function () {
    let that = this;
    wx.request({
      method: 'POST',
      url: app.globalData.WebUrl + 'project/stage/',
      header: {
        Authorization: "Bearer " + app.globalData.SignToken
      },
      data: {
        projectNo: that.data.curPro['projectNo'],
        projectStage: 4
      },
      success: function (res) {
        if (res.statusCode == 200) {
          utils.TipModel('提示', res.data.message);
          that.setData({
            backEditShow: false,
            backShow: false,
            executes: ''
          })
          that.getProjectsFromApi();
        }
      }
    });
  }

})