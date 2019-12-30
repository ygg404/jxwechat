// pages/paging/editallocation/editallocation.js
var httpRequest = require('../../../utils/httpRequest.js');
var utils = require('../../../utils/util.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dateShow:false,
    projectBegunDate:'',  //项目开工日期
    p_no:'', //项目编号
    zshortcutList: [],  //执行标准快捷短语
    zShortShow: false,
    wshortcutList: [],//作业内容快捷短语
    wShortShow: false, 
    tshortcutList :[], //技术要求快捷短语
    tShortShow:false,    
    workGroupsList: [], //作业组列表
    workGroupShow: false,
    chargeList: [],
    headManList:[],  //项目负责人列表
    headManIndex:0,
    projectInfo: '', //项目基本信息
    projectPlan: {}, //项目安排信息     
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.setData({
        p_no: options.p_no
      });

  },
  /**
     * 表单验证的初始化函数
     */
  wxValidateInit: function () {
    this.WxValidate = app.wxValidate(
      {
        projectBegunDate: {
          required: true,
        },
        executeStandard: {
          required: true,
        },
        workNote: {
          required: true,
        },
        workRequire: {
          required: true,
        },
        projectWorkload: {
          required: true,
        },

        projectOutput: {
          required: true,
        }, projectOutputNote: {
          required: false,
        },
        projectWorkDate: {
          required: true,
        },
        projectQualityDate: {
          required: true,
        }
      }
      , {
        projectBegunDate: {
          required: '请填写开工时间',
        },
        executeStandard: {
          required: '请填写执行标准',
        },
        workNote: {
          required: '请填写作业内容',
        },
        workRequire: {
          required: '请填写技术要求',
        },
        projectWorkload: {
          required: '请填写工作量',
        },

        projectOutput: {
          required: '请填写预计产值',
        },
        projectOutputNote: {
          required: '请填写预算明细',
        },
        projectWorkDate: {
          required: '请填写作业工期',
        },
        projectQualityDate: {
          required: '请填写质检工期',
        }
      }
    )
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
    this.wxValidateInit();
    
    this.getProjectInfo();
    this.getProjectPlan();
    this.getWorkGroups();
    this.getShortCutList();
    this.getProjectChargeList();
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
  * 项目启动时间设置
  */
  begunDateEvent: function (e) {
    //关闭日历控件
    if (e.type == 'showEvent') {
      this.setData({
        dateShow: false
      })
      return;
    }
    let projectPlan = this.data.projectPlan == null ? {} : this.data.projectPlan
    projectPlan.projectBegunDateTime = e.detail.dateInfo
    if (e.type == 'setEvent') {
      this.setData({
        dateShow: false,
        projectPlan: projectPlan
      })
    }
  },
  /**
   * 项目开工日期显示
   */
  begunDateShowEvent: function () {
    this.setData({
      dateShow:true
    });
  },
  /**
 * 获取所有作业组
 */
  getWorkGroups: function () {
    var that = this;
    return new Promise((resolve, reject) => {
      httpRequest.requestUrl({
        url: "/project/group/getListByProjectNo/" + that.data.p_no,
        params: {},
        method: "get"
      }).then(data => {
        that.setData({
          workGroupsList: data.list,
        })
        resolve(data)
      })
    })
  },
  /**
 * 通过项目编号 获取项目基本信息
 */
  getProjectInfo: function () {
    var that = this;
    httpRequest.requestUrl({
      url: "/project/projectInfo/info/" + that.data.p_no,
      params: {},
      method: "get"
    }).then(data => {
      that.setData({
        projectInfo: data.projectInfo,
      })
    })
  },
  /**
 * 通过项目编号 获取项目安排信息
 */
  getProjectPlan: function () {
    var that = this;
    httpRequest.requestUrl({
      url: "/project/plan/info/" + that.data.p_no,
      params: {},
      method: "get"
    }).then(data => {
      that.setData({
        projectPlan: data.projectPlan == null ? {} : data.projectPlan,
      })
    })
  },
  /**
   * 获取快捷短语
   */
  getShortCutList: function () {
    var that = this;
    httpRequest.requestUrl({
      url: "/set/wpshortcut/getListByShortTypeId/1",
      params: {},
      method: "get"
    }).then(data => {
      for (let shortcut of data.list) {
        shortcut.checked = false;
      }
      that.setData({
        zshortcutList: data.list,
      })
    })

    httpRequest.requestUrl({
      url: "/set/wpshortcut/getListByShortTypeId/3",
      params: {},
      method: "get"
    }).then(data => {
      for (let shortcut of data.list) {
        shortcut.checked = false;
      }
      that.setData({
        wshortcutList: data.list,
      })
    })

    httpRequest.requestUrl({
      url: "/set/wpshortcut/getListByShortTypeId/4",
      params: {},
      method: "get"
    }).then(data => {
      for (let shortcut of data.list) {
        shortcut.checked = false;
      }
      that.setData({
        tshortcutList: data.list,
      })
    })
  },
  /**
   * 预计产值算工期
   */
  projectOutPutInputEvent: function(e){
    var project_output = e.detail.value;
    var workNum = project_output / 2400 - parseInt(project_output / 2400);
    var project_workDate = 0; //作业工期
    var project_qualityDate = 0; //质检工期
    console.log(workNum)
    if(workNum == 0){
      var project_workDate = Math.round(project_output / 2400)
      }else if (workNum < 0.5) {
        project_workDate = parseInt(project_output / 2400) + 0.5
      } else {
        project_workDate = Math.round(project_output / 2400)
      }
    var qualityNum = project_workDate * 0.25 - parseInt(project_workDate * 0.25)
    if (qualityNum == 0) {
    project_qualityDate = Math.round(project_workDate * 0.25)
    } else if (qualityNum < 0.5) {
      project_qualityDate = parseInt(project_workDate * 0.25) + 0.5
      } else {
        project_qualityDate = Math.round(project_workDate * 0.25)
    }
    console.log(project_workDate);
    console.log(project_qualityDate);
    let projectPlan = this.data.projectPlan;
    projectPlan['projectOutput'] = e.detail.value;
    projectPlan['projectWorkDate'] = project_workDate;
    projectPlan['projectQualityDate'] = project_qualityDate;
    this.setData({
      projectPlan: projectPlan
    })

  },
  /**
   * 工作量输入
   */
  workLoadInputEvent:function(e){
    let projectDetail = this.data.projectPlan;
    projectDetail['projectWorkload'] = e.detail.value;
    this.setData({
      projectDetail: projectDetail
    })
  },
  /**
   * 产值预算明细
   */
  detialInputEvent:function(e){
    let projectDetail = this.data.projectPlan;
    projectDetail['projectOutPutNote'] = e.detail.value;
    this.setData({
      projectDetail: projectDetail
    })
  },
  /**
   * 执行短语输入
   */
  executeShortShowEvent:function(e){
      this.setData({
        zShortShow :true
      })
  },
  /**
   * 执行标准短语取消
   */
  returnZshortEvent:function(e){
    this.setData({
      zShortShow: false
    });
  },
  /**
   * 执行标准短语输入确定
   */
  setZshortEvent:function(e){
    let pDetail = this.data.projectPlan;
    let projectExecuteStandard = '';
    for(let execute of this.data.zshortcutList){
      if(execute.checked){
        projectExecuteStandard += execute.shortcutNote + ';';
      }
    }
    pDetail['executeStandard'] = projectExecuteStandard;
    this.setData({
      projectPlan: pDetail,
      zShortShow:false
    });
  },
  /**
   * 执行标准短语输入改变
   */
  zShortCheckEvent:function(e){
    let zList = this.data.zshortcutList;
    for (let zshort of zList){
      if (e.detail.value.indexOf(zshort.id.toString()) != -1){
        zshort.checked = true;
      }else{
        zshort.checked = false;
      }
    }
    this.setData({
      zshortcutList : zList
    })
  },
  /**
  * 执行标准 改变
  */
  executeStandardEvent: function (e) {
    let pDetail = this.data.projectPlan;
    pDetail.executeStandard = e.detail.value;
    this.setData({
      projectPlan: pDetail
    })
  },
  /**
 * 作业内容标准短语快捷输入多选
 */
  workShortShowEvent: function (e) {
    this.setData({
      wShortShow:true
    })
  },
  /**
   * 作业内容多选改变 
   */
  wShortCheckEvent :function(e){
    let wList = this.data.wshortcutList;
    for (let wshort of wList) {
      if (e.detail.value.indexOf(wshort.id.toString()) != -1) {
        wshort.checked = true;
      } else {
        wshort.checked = false;
      }
    }
    this.setData({
      wshortcutList: wList
    })
  },
  /**
   * 作业内容快捷取消
   */
  returnWshortEvent: function(e){
    this.setData({
      wShortShow : false
    })
  },
  /**
   * 作业内容确定
   */
  setWshortEvent:function(e){
    let pDetail = this.data.projectPlan;
    let projectWorkNote = '';
    for (let execute of this.data.wshortcutList) {
      if (execute.checked) {
        projectWorkNote += execute.shortcutNote + ';';
      }
    }
    pDetail['workNote'] = projectWorkNote;
    this.setData({
      projectPlan: pDetail,
      wShortShow: false
    });
  },
  /**
   * 作业短语 改变
   */
  workNoteEvent:function(e){
    let pDetail = this.data.projectPlan;
    pDetail.workNote = e.detail.value;
    this.setData({
      projectPlan: pDetail
    })
  },
  /**
 * 技术要求标准短语
 */
  requireShortChangeEvent: function (e) {
    this.setData({
      tShortShow : true
    })
  },
  /**
   * 技术短语快捷输入改变
   */
  tShortCheckEvent:function(e){
    let tList = this.data.tshortcutList;
    for (let tshort of tList) {
      if (e.detail.value.indexOf(tshort.id.toString()) != -1) {
        tshort.checked = true;
      } else {
        tshort.checked = false;
      }
    }
    this.setData({
      tshortcutList: tList
    })
  },
  /**
   * 技术短语快捷输入取消
   */
  returnTshortEvent:function(e){
    this.setData({
      
      tShortShow : false
    })
  },
  /**
   *  技术短语快捷输入确定
   */
  setTshortEvent:function(e){
    let pDetail = this.data.projectPlan;
    let projectWorkRequire = '';
    for (let execute of this.data.tshortcutList) {
      if (execute.checked) {
        projectWorkRequire += execute.shortcutNote + ';';
      }
    }
    pDetail['workRequire'] = projectWorkRequire;
    this.setData({
      projectPlan: pDetail,
      tShortShow: false
    });
  },
  /**
 * 技术要求 改变
 */
  workRequireEvent: function (e) {
    let pDetail = this.data.projectPlan;
    pDetail.workRequire = e.detail.value;
    this.setData({
      projectPlan: pDetail
    })
  },
  /**
   * 选择作业组按钮事件
   */
  chooseWorkEvent:function(e){
    let projectPlan = this.data.projectPlan;
    if (projectPlan.projectOutput == null){
      utils.TipModel('错误',"请先设置并保存项目安排信息！", 0);
      return;
    }
    let headMenlist = this.data.headManList;
    let index = 0;
    let that = this;
    this.getWorkGroups().then(success =>{
      let workGroupsList = that.data.workGroupsList;
      for (let group of workGroupsList) {
        if (group.checked) {
          index = headMenlist.indexOf(group['headMan']);
        }
      }
      that.setData({
        workGroupShow: true,
        headManIndex: index,
        workGroupsList: workGroupsList
      })
    })

  },
  /**
   *返回 
   */
  returnWorkEvent:function(e){
    wx.navigateBack({
      delta: 1
    });
  },
  /**
  * 保存项目
  */
  formSubmit: function (e) {
    //提交错误描述
    if (!this.WxValidate.checkForm(e)) {
      const error = this.WxValidate.errorList[0];
      wx.showToast({
        title: `${error.msg} `,
        image: '/images/warn.png',
        duration: 2000
      })
      return false;
    }
    var that = this;
    let pDetail = this.data.projectPlan;
    //提交
    httpRequest.requestUrl({
      url: "/project/plan/save",
      params: {
        'id': pDetail.id || undefined,
        'projectNo': that.data.p_no,
        'projectWorkload': pDetail.projectWorkload,
        'projectWorkDate': pDetail.projectWorkDate,
        'projectQualityDate': pDetail.projectQualityDate,
        'projectOutput': pDetail.projectOutput,
        'executeStandard': pDetail.executeStandard,
        'workRequire': pDetail.workRequire,
        'workNote': pDetail.workNote,
        'projectWriter': that.data.projectInfo.createUserName,
        'projectBegunDateTime': pDetail.projectBegunDateTime
      },
      method: "post"
    }).then(data => {
      utils.TipModel('提示', '提交成功！');
      wx.navigateBack({
        delta: 1
      });
    })
  },
  /**
   * 获取项目负责人列表
   */
  getProjectChargeList() {
    let that = this
    return new Promise((resolve, reject) => {
      httpRequest.requestUrl({
        url: "/project/group/getChargeList",
        params: {},
        method: "get"
      }).then(data => {
        let headManList = []
        for(let headman of data.list){
          headManList.push(headman.username)
        }
        that.setData({
          chargeList : data.list,
          headManList: headManList
        })
      })
    })
  },
  /**
   * 分组input输入变化
   */
  rateInputEvent:function(e){
    console.log(e.detail.value);
    let groupId = e.currentTarget.id.split('_')[1];
    let name = e.currentTarget.id.split('_')[0];
    let groupList = this.data.workGroupsList;
    let pDetail = this.data.projectPlan;
    //占比输入
    if (name =='outputRate'){
      for (let group of groupList){
        if (group['groupId'] == groupId){
          let rate = parseFloat(e.detail.value);
          let projectOutPut = (e.detail.value / 100 * pDetail.projectOutput).toFixed(2);
          group['outputRate'] = e.detail.value;
          group['projectOutput'] = projectOutPut;
          group['shortDateTime'] = (Math.ceil(projectOutPut / 2400 * 0.7 / 0.5) * 0.5);
          group['lastDateTime'] = (Math.ceil(projectOutPut / 2400 * 1.3 / 0.5) * 0.5);
        }
      }
    }
    //产值输入
    if (name == 'projectOutput'){
      for (let group of groupList) {
        if (group['groupId'] == groupId) {
          group['outputRate'] = (e.detail.value / pDetail.projectOutput * 100).toFixed(2);
          group['projectOutput'] = e.detail.value;
          group['shortDateTime'] = (Math.ceil(e.detail.value / 2400 * 0.7 / 0.5) * 0.5);
          group['lastDateTime'] = (Math.ceil(e.detail.value / 2400 * 1.3 / 0.5) * 0.5);
        }
      }
    }
    //最短工期输入
    if (name == 'shortDateTime') {
      for (let group of groupList) {
        if (group['groupId'] == groupId) {
          group['shortDateTime'] = e.detail.value;
        }
      }
    }
    //最迟工期输入
    if (name == 'lastDateTime') {
      for (let group of groupList) {
        if (group['groupId'] == groupId) {
          group['lastDateTime'] = e.detail.value;
        }
      }
    }

    this.setData({
      workGroupsList: groupList
    })
  },
  /**
   * 分组返回
   */
  returnGroupEvent:function(e){
    this.setData({
      workGroupShow:false
    })
  },
  /**
   * 确认分组
   */
  setGroupEvent:function(e){
    let pDetail = this.data.projectPlan;
    var totalrate = 0; //全占比
    var totalOutput = 0; //全产值
    console.log(this.data.workGroupsList)
    for(let group of this.data.workGroupsList){
      if(group['checked']){
        if (group['projectOutput'] != null && group['outputRate'] != null ){
        totalOutput += parseFloat(group['projectOutput']);
        totalrate += parseFloat(group['outputRate']);
        }
      }
    }
    console.log(totalOutput)
    if (totalrate > 100.01 || totalrate<99.99){
      utils.TipModel('错误','产值占比不满足100%', 0);
      return;
    }
    if (totalOutput > (pDetail.projectOutPut + 1) || totalOutput < (pDetail.projectOutPut - 1)){
      utils.TipModel('错误', '总产值不等于预计总产值', 0);
      return;
    }
    // 获取项目负责人 ID
    let headId = ''
    for(let headman of this.data.chargeList){
      if (headman.username == this.data.headManList[this.data.headManIndex]){
        headId = headman.userId;
      }
    }
    let that = this;
    httpRequest.requestUrl({
      url: "/project/group/saveList",
      params: {
        projectNo : that.data.p_no,
        pgroupList: that.data.workGroupsList,
        headId: headId
      },
      method: "post"
    }).then(data => {
      let plan = that.data.projectPlan;
      plan.projectCharge = that.data.headManList[that.data.headManIndex]
      that.setData({
        workGroupShow: false,
        projectPlan: plan
      })
      that.getWorkGroups()
    })
    
  },
  /**
   * 项目负责人改变
   */
  headManChangeEvent:function(e){
    // let pDetail = this.data.projectDetail;
    // pDetail.projectCharge = 
    this.setData({
      headManIndex : e.detail.value
    })
  },
  /**
   * 作业组勾选
   */
  groupCheckEvent: function(e){
    var headMenlist = this.data.headManList;
    let workGroupsList = this.data.workGroupsList;
    let index = 0;
    for (let group of workGroupsList){
      if (group['groupId'] == e.currentTarget.id){
        group.checked = !group.checked;
      }
      if (group.checked) {
        index = headMenlist.indexOf(group['headMan']);
      }
    }
    this.setData({
      headManIndex: index,
      workGroupsList : workGroupsList
    })
  },

  
})