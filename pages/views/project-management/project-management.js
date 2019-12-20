          var utils = require('../../../utils/util.js');
          var httpRequest = require('../../../utils/httpRequest.js');
          var app = getApp();

          Page({

            data: {
              projectList:[],//页面展示数据
              titleContractNo:'',
              showeditShow:false,//编辑视图的标识符
              titleName: '',//编辑视图的标题
              projectCalendarShow:false, //项目启动时间控件标识符
              projectDetail:{}, //项目信息详情
              contractDetail:{},//合同详情 如果请求不到后台项目详情的数据 用这个去填充
              listparams:{},//合同数据后台请求参数 用于刷新 
              addAndeditprojectno:'',//项目编号
              projectTime:'',//启动时间

              produceId:0, //生产负责人ID
              produce: [],//生产负责人列表
              produceName: [],//生产负责人字符串数组
              
            },

            /**
             * 生命周期函数--监听页面加载
             */
            onLoad: function (options) {
              var projectList = JSON.parse(options.projectList)
              var showContractNo = JSON.parse(options.showContractNo)
              var showProjectId = JSON.parse(options.showProjectId)
              var contractDetail = JSON.parse(options.contractDetail)
              var listparams =JSON.parse(options.listparams)
              this.setData({
                projectList: projectList,
                titleContractNo: showContractNo,
                contractDetail: contractDetail,
                listparams: listparams
              })
              if (showProjectId === ""  ){
                this.getProduceInfo(options).then(success => {
                  this.getProjectOfContractInfo(showProjectId).then(success => {
                    this.getAddProjectNo(options).then(success => {
                  this.setData({
                    showeditShow: true
                  })
                })
              })
              })
              }
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


            //提交项目编辑表单
            projectFormSubmit: function (e) {
              //提交错误描述
              // if (!this.WxValidate.checkForm(e)) {
              //   const error = this.WxValidate.errorList[0]
              //   // `${error.param} : ${error.msg} `
              //   wx.showToast({
              //     title: `${error.msg} `,
              //     image: '/images/warn.png',
              //     duration: 2000
              //   })
              //   return false
              // }
              var that = this;
              var _url = '';
              var passid = '';
             
              if (that.data.titleName == '添加') {
                _url = "project/project/save";
                passid = null;
              } else {
                _url = "project/project/update";
                passid =this.data.projectDetail.id;
              }
              httpRequest.requestUrl({
                url: _url,
                params: {
                  // ID 生产负责人 项目编号 项目名称 项目启动时间
                  id: passid,
                  projectProduce: that.data.produceName[that.data.produceId],
                  projectNo: that.data.addAndeditprojectno,
                  projectName: e.detail.value.projectName,
                  projectCreateDateTime: this.data.projectTime,
                  contractNo: this.data.projectDetail.contractNo,
                  projectMoney: this.data.projectDetail.projectMoney,
                  projectBusiness: this.data.projectDetail.projectBusiness,
                  projectAuthorize: this.data.projectDetail.projectAuthorize,
                  projectNote: this.data.projectDetail.projectNote,
                  pStage: this.data.projectDetail.pStage,
                  examineNote: this.data.projectDetail.examineNote,
                  projectType: this.data.projectDetail.projectType,
                  projectStage: this.data.projectDetail.projectStage,
                  projectProduceAccount: this.data.projectDetail.projectProduceAccount,    
                  createuserid: this.data.projectDetail.createuserid
                 
                },
                method: "post"
              }).then(data => {
                wx.showToast({
                  title: '提交成功',
                  icon: 'success',
                  duration: 2000
                });
                //向后台请求数据 重新设置页面列表数据
                this.setProjectListAgain(e).then(success => {
                this.setData({
                  showeditShow:false
                })
              })
              })
            },
               //向后台请求数据 重新设置页面列表数据
            setProjectListAgain:function(e){
              var that = this;
              return new Promise((resolve, reject) => {
                httpRequest.requestUrl({
                  url: "project/contract/list",
                  params: this.data.listparams,
                  method: "get"
                }).then(data => {
                  //包含了项目列表的合同列表
                 var contractList  = data.page.list
                  for (let item of contractList) {
                    if (this.data.titleContractNo  === item.contractNo) {
                      this.setData({
                        projectList: item.projectList
                      })
                    }
                  }
                  resolve(e)
                })
              })
            },

            /**
          * 点击某个项目选中弹出详情
          */
            detailProjectClickEvent: function (e) {
              console.log(e.currentTarget.id);
              let tableList = this.data.projectList
              for (let table of tableList) {
                if (table['id'] == e.currentTarget.id) {
                  table['selected'] = !table['selected'];
                }
                else {
                  table['selected'] = false;
                }
              }
              this.setData({
                projectList: tableList
              })
            },
            
            //返回合同页面
            returnContract:function(e){
              wx.redirectTo({
                url: '../contract-management/contract-management'
              })
            },
            //请求后台获得项目的信息(添加项目是填充编辑页面)
            getProjectOfContractInfo: function (showProjectId) {
              var that = this;
              var pid = showProjectId || 0
              var tempData = { 
              id:'',
              projectNo:'',
                contractNo: '',
                projectName: '',
                projectMoney: '',
                projectAuthorize: '',
                projectNote: '',
                projectBusiness: '',
                examineNote: '',
                projectType: '',
                projectStage: '',
                projectProduce: '',
                pStage: '',
                projectProduceAccount: '',
                projectStartDateTime: '',
                projectCreateDateTime: '',
                createuserid: ''
              };
              return new Promise((resolve, reject) => {
              httpRequest.requestUrl({
                url: "project/project/info/" + pid,
                params: {},
                method: "get"
              }).then(data => {
                if (data.project != null && data.code === 0) {
                  tempData.id = data.project.id;            
                  tempData.projectNo = data.project.projectNo;
                  tempData.contractNo = data.project.contractNo;
                  tempData.projectName = data.project.projectName;
                  tempData.projectMoney = data.project.projectMoney;;
                  tempData.projectAuthorize = data.project.projectAuthorize;
                  tempData.projectNote = data.project.projectNote;
                  tempData.projectBusiness = data.project.projectBusiness;
                  tempData.examineNote = data.project.examineNote;
                  tempData.projectType = data.project.projectType;
                  tempData.projectStage = data.project.projectStage;
                  tempData.projectProduce = data.project.projectProduce;
                  tempData.pStage = data.project.pStage;
                  tempData.projectProduceAccount = data.project.projectProduceAccount;
                  tempData.projectStartDateTime = data.project.projectStartDateTime;
                  tempData.projectCreateDateTime = data.project.projectCreateDateTime;
                  tempData.createuserid = data.project.createuserid;
                  that.setData({
                    projectDetail: tempData,
                    titleName:"修改"
                  })
                 
                  let produceId = this.data.produceName.indexOf(tempData.projectProduce);
                  that.setData({
                    addAndeditprojectno: this.data.projectDetail.projectNo,
                    projectTime: this.data.projectDetail.projectCreateDateTime,
                    produceId: produceId
                  })
                }
                else{
                      tempData.contractNo = this.data.contractDetail.contractNo;
                      tempData.projectName = this.data.contractDetail.contractName;
                      tempData.projectAuthorize = this.data.contractDetail.contractAuthorize;
                      tempData.projectNote = this.data.contractDetail.contractNote;
                      tempData.projectBusiness = this.data.contractDetail.contractBusiness;
                      tempData.projectType = this.data.contractDetail.projectType;
                that.setData({
                  projectDetail:tempData,
                  titleName: "添加"
                })
                that.setData({
                  projectTime: this.data.contractDetail.contractStartDateTime,
                  produceId: this.data.produce[0].id
                })
                }
                resolve(showProjectId)
              })
              })
            },

      delProjectInfo:function(e){
        var projectNo = e.currentTarget.dataset.value;
        var that = this;
        var delid = Number(e.currentTarget.id);
        var sure = false;
        wx.showModal({
          title: '提示',
          content: '确定要删除编号为' + projectNo + '的项目吗？',
          success: function (sm) {
            if (sm.confirm) {
              return new Promise((resolve, reject) => {
                httpRequest.requestUrl({
                  url: "project/project/delete",
                  params: delid,
                  method: "post"
                }).then(data => {
                  //向后台请求数据 重新设置页面列表数据
                  that.setProjectListAgain(e).then(success => {
                    that.setData({
                      showeditShow: false
                    })
                  })
                })
              })
            } 
          }
        })
       
      },
            //删除项目数据
            delEvent:function(e){  
              this.delProjectInfo(e);
            },

            /**
               * 获取生产负责人列表 
               */
            getProduceInfo: function (e) {
              var that = this;
              return new Promise((resolve, reject) => {
                httpRequest.requestUrl({
                  url: "project/project/getProduceList",
                  params: {},
                  method: "get"
                }).then(data => {
                  let produceName = [];
                  for (let pInfo of data.list) {
                    produceName.push(pInfo['username']);
                  }
                  that.setData({
                    produceName: produceName,
                    produce: data.list
                  })
                  resolve(e)
                })
              })
            },
            //请求后台返回需要添加的合同编号
            getAddProjectNo: function (e) {
              var that = this;
              return new Promise((resolve, reject) => {
                httpRequest.requestUrl({
                  url: "project/contract/getMaxContractNo",
                  params: {},
                  method: "get"
                }).then(data => {
                  that.setData({
                    addAndeditprojectno: data.contractNo
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
              //生产负责人修改事件
            projectproduceChangeEvent:function(e){
              this.setData({
                produceId: Number(e.detail.value)
              })  
            },
          //编辑按钮点击事件
            editEvent:function(e){
              this.getProduceInfo(e).then(success => {
              console.log("输出选中的项目ID" + e.currentTarget.id)
                this.getProjectOfContractInfo(Number(e.currentTarget.id)).then(success => {
              this.setData({
                titleName:'编辑',
                showeditShow:true
              })
              })
            })
            },

          //编辑视图取消按钮点击事件
            returnProjectList:function(e){
              this.setData({
                showeditShow: false
              })
              if (this.data.titleName === "添加"){
                wx.redirectTo({
                  url: '../contract-management/contract-management'
                })  
              }else{
                this.setData({
                  showeditShow: false
                })
              }       
            },

            //控件事件
            /**
          * 项目日历事件
          */
            projectCalendarEvent: function (e) {
              console.log(e);
              //关闭日历控件
              if (e.type == 'showEvent') {
                this.setData({
                  projectCalendarShow: false
                })
                return;
              }
              if (e.type == 'setEvent') {
                this.setData({
                  projectCalendarShow: false,
                  projectTime: e.detail.dateInfo
                })
              }
            },
            projectTimeEvent:function(e){
              this.setData({
                projectCalendarShow: true 
              })
            }
          })