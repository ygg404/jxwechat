  var httpRequest = require('../../../utils/httpRequest.js');
  var utils = require('../../../utils/util.js');
  var app = getApp();

  Page({
    data: {
      c_no: '', //接受页面传过来的需要编辑合同编号
      contractDetail: {}, //合同详情 接受页面传过来的合同信息
      eventname:'',//编辑(edit) or 添加(add)
      pageTitleName:'',//标题

      contractCalendarShow:false,//合同日期控件标识符
      selectProjectTypeShow:false,//项目类型控件标识符
      contractTime:'',//合同日期

      projectTypesList:[],//项目类型列表
      projectTypeName: [],  //类型选择字符串数组

      businessList:[],//业务负责人列表
      businessName:[],//业务负责人字符串数组
      //选项绑定的值
      businessId:0, //业务负责人
      contracttypeId:0,//合同类型
      projectType:0,//项目类型
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      this.getBusinessInfo(options).then(success => {
        var detailcontract = JSON.parse(options.detailcontract)
        this.setData({
          c_no: options.c_no,
          contractDetail: detailcontract,
          eventname: options.eventname
        });
        if (this.data.eventname === 'add') {
          this.getProjectIDInfo(options).then(success => {
            this.setData({
              pageTitleName: '添加'
            })
          })

        } else {
          this.setData({
            pageTitleName: '修改',
            contracttypeId: this.data.contractDetail.contractType,
            contractTime: this.data.contractDetail.contractAddTime,
            businessId: this.data.businessName.indexOf(this.data.contractDetail.contractBusiness)

          })
        }
      })
     
      
    },
    /**
        * 表单验证的初始化函数
        */
    wxValidateInit: function () {
      this.WxValidate = app.wxValidate(
        {
          contractName: {
            required: '请填写合同名称',
          },
          contractMoney: {
            required: '请填写合同金额',
          },
          contractAuthorize: {
            required: '请填写委托单位',
          },
          contractNote: {
            required: '请填写委托要求',
          },
          contractUserName: {
            required: '请填写联系人',
          },
          contractUserPhone: {
            required: '请填写联系人电话',
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
      this.getProjectTypesInfo();
    },

    //取消按钮
    returnDetail:function(e){
      wx.redirectTo({
        url: '../../views/contract-management/contract-management'
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
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },
    
    //点击确定按钮提交表单信息
    formSubmit:function(e){
      //提交错误描述
      if (!this.WxValidate.checkForm(e)) {
        const error = this.WxValidate.errorList[0]
        // `${error.param} : ${error.msg} `
        wx.showToast({
          title: `${error.msg} `,
          image: '/images/warn.png',
          duration: 2000
        })
        return false
      }
      var that = this;
      var _url = '';
      if (that.data.pageTitleName == '添加') {
        _url = "project/contract/save";
      } else { 
        _url = "project/contract/update";
      }
      httpRequest.requestUrl({
        url: _url,
        params: {
          id: that.data.contractDetail['id'],
          contractAddTime: that.data.contractTime,
          contractAuthorize: this.data.contractDetail.contractAuthorize,
          contractBusiness: that.data.businessName[that.data.businessId],
          contractMoney: this.data.contractDetail.contractMoney,
          contractName: this.data.contractDetail.contractName,
          contractNo: that.data.contractDetail.contractNo,
          contractNote: this.data.contractDetail.contractNote,
          userName: this.data.contractDetail.userName,
          userPhone: this.data.contractDetail.userPhone,
          projectType: e.detail.value.projectType,
          //合同类型
          contractType: that.data.contracttypeId
        },
        method: "post"
      }).then(data => {
        wx.showToast({
          title: '修改合同信息成功',
          icon: 'success',
          duration: 2000
        });
        //跳转到合同管理
        wx.redirectTo({
          url: '../../views/contract-management/contract-management'
        })
      })
    },

    /**
    * 合同类型选择 (单选框点击事件)
    */
    radioChange: function (e) {
      this.setData({
        contracttypeId: e.detail.value
      })
    },
    /*
    *显示时间控件的点击事件
    */
    contractTimeShowEvent:function(){
      this.setData({
        contractCalendarShow: true
      })
    },
    /*
    合同签订时间选择 (日期控件点击事件)
    */
    contractCalendarEvent:function(e){
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
          contractTime: e.detail.dateInfo
        })
      }
    },

    //项目类型编辑控件点击事件 多选
    projecttypeShowEvent: function (e) {
      let projectTypesList = this.data.projectTypesList;
      //判断
      if (this.data.pageTitleName == '添加') {
        for (let ptype of projectTypesList) ptype.checked = false;
      }
      else {
        if (this.data.contractDetail.projectType != '' && this.data.contractDetail.projectType != null) {
          let ptypeList = this.data.contractDetail.projectType.split(',');
          for (let ptype of projectTypesList) {
            if (ptypeList.indexOf(ptype.name) != -1) {
              ptype.checked = true;
            }
            else {
              ptype.checked = false;
            }
          }
        }
      }
      this.setData({
        projectTypesList: projectTypesList,
        selectProjectTypeShow: true
      })
    },

    //项目类型编辑控件取消按钮点击事件
    returnTypeEvent: function (e) {
      this.setData({
        selectProjectTypeShow: false
      });
    },
    typeSelectEvent:function(e){
      let tList = this.data.projectTypesList;
      for (let tshort of tList) {
        if (e.detail.value.indexOf(tshort.id.toString()) != -1) {
          tshort.checked = true;
        } else {
          tshort.checked = false;
        }
      }
      this.setData({
        projectTypesList: tList
      })
    },

    /**
    * 项目类型编辑控件多选输入确认
    */
    setTypeEvent: function () {
      let projectType = '';
      for (let pt of this.data.projectTypesList) {
        if (pt.checked) {
          projectType += pt.name + ',';
        }
      }
      if (projectType == null || projectType == '') {
        utils.TipModel('错误', '请选择项目类型', 0);
        return;
      }
      projectType = projectType.substring(0, projectType.length - 1);
      let contractDetail = this.data.contractDetail;
      contractDetail.projectType = projectType;
      this.setData({
        selectProjectTypeShow: false,
        contractDetail: contractDetail
      });
      
    },

    /**
  * 获取业务负责人列表 
  */
    getBusinessInfo: function (e) {
      var that = this;
      return new Promise((resolve, reject) => {
      httpRequest.requestUrl({
        url: "project/contract/getBusinessList",
        params: {},
        method: "get"
      }).then(data => {
        let businessName = [];
        for (let bInfo of data.list) {
          businessName.push(bInfo['username']);
        }
        that.setData({
          businessName: businessName,
          business: data.list
        })
        resolve(e)
      }) 
      })
    },
    //业务负责人修改事件
    businessChangeEvent:function(e){
      this.setData({
        businessId: Number(e.detail.value)
      })  
    },
    /**
  * 获取项目类型 
  */
    getProjectTypesInfo: function (e) {
      var that = this;
      return new Promise((resolve, reject) => {
      httpRequest.requestUrl({
        url: "set/projecttype/selectprojecttype",
        params: {},
        method: "get"
      }).then(data => {
        let ptypeInfo = [];
        for (var ptype of data.list) {
          ptypeInfo.push(ptype.name);
        }
        that.setData({
          projectTypeName: ptypeInfo,
          projectTypesList: data.list
        })
        resolve(e)
      })
      })
    },

//请求后台返回合同ID
    getProjectIDInfo:function(e){
      var that = this;
      return new Promise((resolve, reject) => {
      httpRequest.requestUrl({
        url: "project/contract/getMaxContractNo",
        params: {},
        method: "get"
      }).then(data => {
        let cDetail = {};
        cDetail['contractNo'] = data.contractNo;
        that.setData({
          contractDetail: cDetail
        })
          resolve(e)
        })
      })
    },

//文本框失焦函数
    contractNamebindblur(e) {
      this.data.contractDetail.contractName  = e.detail.value;
    },
    contractMoneybindblur(e) {
      this.data.contractDetail.contractMoney = e.detail.value;
    },
    contractAuthorizebindblur(e){
      this.data.contractDetail.contractAuthorize = e.detail.value;
    },
    contractNotebindblur(e) {
      this.data.contractDetail.contractNote = e.detail.value;
    },
    contractUserNamebindblur(e) {
      this.data.contractDetail.userName = e.detail.value;
    },
    contractUserPhonebindblur(e) {
      this.data.contractDetail.userPhone = e.detail.value;
    }
  })