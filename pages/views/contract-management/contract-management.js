var utils = require('../../../utils/util.js');
var httpRequest = require('../../../utils/httpRequest.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    urlId: 'contract-management',
    calendarShow: false,    //日历显示
    contractCalendarShow: false, //合同日历
    setStartflag: false, //设置开始日期标志
    addContractShow: false, //合同管理表单
    selectTypeShow: false,    //项目类型多选0
    btnName: '',
    dateInfo: '',
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
    tableList: [],  //列表数据
    contractNo: '', //合同编号
    contractAddTime: '', //日期
    projectTypes: [],  //类型选择
    projectTypesList: [],
    projectTypeID: 0,
    business: [], //业务负责人列表
    businessId: 0,
    businessName: [],
    contractDetail: {}, //合同详情
    typeId: 0, //类型ID
    projectType: '', //项目类型
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
    //合同编号
    this.getContractFromApi();
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
   * 合同管理列表
   */
  getContractFromApi: function () {
    var that = this;
    httpRequest.requestUrl({
      url: "project/contract/list",
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
   * 选择文件
   */
  chooseFile: function (e) {

  },
  /**
   * 合同签订时间
   */
  contractAddTimeEvent: function (e) {
    console.log(e);
    this.setData({
      contractCalendarShow: true
    })
  },
  /**
 * 合同日历事件
 */
  contractAddCalendarEvent: function (e) {
    console.log(e);
    //关闭日历控件
    if (e.type == 'showEvent') {
      this.setData({
        contractCalendarShow: false
      })
      return;
    }
    if (e.type == 'setEvent') {
      this.setData({
        contractCalendarShow: false,
        contractAddTime: e.detail.dateInfo
      })
    }
  },

  /**
   *合同下载
   */
  downloadEvent: function (e) {

  },

  /**
   * 删除合同事件
   */
  delEvent: function (e) {
    var that = this;
    let contractNo = '';
    for (let contract of this.data.tableList) {
      if (contract['id'] == e.currentTarget.id) {
        contractNo = contract['contractNo'];
        break;
      }
    }
    var dataListSelections = [];
    var shouddelids = Number(e.currentTarget.id) ? [Number(e.currentTarget.id)] : dataListSelections.map(item => {
      return item.ids
    });
    wx.showModal({
      title: '提示',
      content: '确定要删除编号为' + contractNo + '的合同吗？',
      success: function (sm) {
        if (sm.confirm) {
          httpRequest.requestUrl({
            url: "project/contract/delete",
            params: shouddelids,
            method: "post"
          }).then(data => {
            that.getContractFromApi();
          })
        }
      }
    });
  },

  //添加合同按钮点击事件
  addContractEvent: function (e) {
    var dc = JSON.stringify(null);
    wx.redirectTo({
      url: '../../paging/editcontract/editcontract?c_no=' + null + '&detailcontract=' + dc + '&eventname=' + 'add'
    })
  },

  //编辑合同
  editEvent: function (e) {
    var contractNo = Number(e.currentTarget.id);
    var detailcontract = '';
    for (let contract of this.data.tableList) {
      if (contract['id'] == e.currentTarget.id) {
        detailcontract = contract;
        break;
      }
    }
    var dc = JSON.stringify(detailcontract);
    wx.redirectTo({
      url: '../../paging/editcontract/editcontract?c_no=' + contractNo + '&detailcontract=' + dc + '&eventname=' + 'edit'
    })
  },
  navigateToProjectManagement: function (e, flag) {
 
    //项目列表信息
    var projectUnderContractList = [];
    var contractno = '';
    var projectid = '';
    var contractvalue = e.currentTarget.dataset.value;
    var cvalue = JSON.stringify(contractvalue);
    for (let item of this.data.tableList) {
      if (e.currentTarget.id == item.id) {
        projectUnderContractList = item.projectList;
        contractno = item.contractNo;
        projectid = item.id;
      }
    }
    var pucL = JSON.stringify(projectUnderContractList);
    var cn = JSON.stringify(contractno);
    var pid = '';
    if (flag === "add") {
      pid = JSON.stringify('');
    } else {
      pid = JSON.stringify(projectid);
    }
    var params = {
      page: this.data.pagination.page,
      limit: this.data.pagination.rowsPerPage,
      key: this.data.pagination.search,
      sidx: 'id',
      order: this.data.pagination.sortBy,
      startDate: this.data.pagination.startDate,
      endDate: this.data.pagination.endDate
    };
    var ps = JSON.stringify(params);
    wx.redirectTo({
      url: '../project-management/project-management?projectList=' + pucL + '&showContractNo=' + cn + '&showProjectId=' + pid + '&contractDetail=' + cvalue + '&listparams=' + ps
    })
  },
  //查看合同下的项目列表
  checkProjectEvent: function (e) {
    this.navigateToProjectManagement(e, "check");
  },

  //添加项目信息
  addProjectEvent: function (e) {
    console.log("添加项目点击事件")
    this.navigateToProjectManagement(e, "add");
  }
})