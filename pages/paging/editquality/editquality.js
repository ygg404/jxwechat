  // pages/views/projectwork-management/projectwork-management.js
  var utils = require('../../../utils/util.js');
  var httpRequest = require('../../../utils/httpRequest.js');
  var app = getApp();

  Page({

    /**
     * 页面的初始数据
     */
    data: {
      ptworkSelected: false,
      backSelected: false,
      addBackShow: false,
      detailProjectInfo:{},//项目详情数据
      p_no:'',//项目ID
      qualityId: 0,//质量检查描述ID
      qualityNote: '',//质量检查描述信息
      qualityScore: '',//质量检查描述评分

      backList: [],  //返修记录
      cshortcutList: [], //质量检查
      cNameList: [],
      cindex: 0,
      qshortcutList: [], //质量综述
      qShortShow: false,
      bshortcutList: [], //返修短语
      bNameList: [],
      bindex: 0,
      backNote: '',  //提交返修短语
      userAccount: wx.getStorageSync('userAccount')
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      var p_no = options.p_no;
      this.setData({
        p_no:p_no
      })
      this.getrepairNoteShortCutList(options).then(success => {
      this.getBackListInfo(p_no).then(success => {
      this.getPorjectInfo(p_no).then(success => {
        this.getqualityInfo(p_no);
      })
      })
      })
      this.getqualityShortCutList(options);
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
       * 表单验证的初始化函数
       */
    wxValidateInit: function () {
      this.WxValidate = app.wxValidate(
        {
          qualityNote: {
            required: true,
          },
          qualityScore: {
            required: true,
          }
        }
        , {
          qualityNote: {
            required: '请填写质量综述',
          },
          qualityScore: {
            required: '请填写质量评分',
          }
        }
      )
    },

  //获得项目信息
    getPorjectInfo: function (p_no){
    var that = this;
    return new Promise((resolve, reject) => {
      httpRequest.requestUrl({
        url: "project/projectInfo/info/" + p_no,
        method: "get"
      }).then(data => {
        this.setData({
          detailProjectInfo: data.projectInfo
        })
        resolve(p_no)
      })
    })
  },
    //项目质检信息
    getqualityInfo: function (p_no) {
      var that = this;
      return new Promise((resolve, reject) => {
        httpRequest.requestUrl({
          url: "project/quality/getInfo",
          params: { projectNo: p_no},
          method: "get"
        }).then(data => {
        this.setData({
          qualityId: data.checkQuality.id,
          qualityNote: data.checkQuality.qualityNote,
          qualityScore: data.checkQuality.qualityScore 
        })
          resolve(p_no)
        })
      })
    },

    // 获取质量检查信息快捷短语
    getqualityShortCutList: function (e) {
      var that = this;
      return new Promise((resolve, reject) => {
        httpRequest.requestUrl({
          url: "set/wpshortcut/getListByShortTypeId/9",
          method: "get"
        }).then(data => {
          this.setData({
            qshortcutList: data.list
          })
          resolve(e)
        })
      })
    },
    // 获取返修意见信息快捷短语
    getrepairNoteShortCutList: function (e) {
      var that = this;
      return new Promise((resolve, reject) => {
        httpRequest.requestUrl({
          url: "set/wpshortcut/getListByShortTypeId/12",
          method: "get"
        }).then(data => {

          let nameList = ['返修短语快捷输入'];
          for (let shortcut of data.list) {
            nameList.push(shortcut.shortcutNote);
          }
          that.setData({
            bshortcutList: data.list,
            bNameList: nameList
          })
          // this.setData({
          //   bshortcutList: data.list
          // })
          resolve(e)
        })
      })
    },

    /**
     *质量综述 
    */
    qshortChangeEvent: function (e) {
      this.setData({
        qShortShow: true
      })
    },
    /**
    * 质量综述快捷输入多选改变
    */
    qShortCheckEvent: function (e) {
      let qList = this.data.qshortcutList;
      for (let qshort of qList) {
        if (e.detail.value.indexOf(qshort.id.toString()) != -1) {
          qshort.checked = true;
        } else {
          qshort.checked = false;
        }
      }
      this.setData({
        qshortcutList: qList
      })
    },
    /**
       * 质量综述快捷输入取消
       */
    returnQshortEvent: function (e) {
      this.setData({
        qShortShow: false
      })
    },
    /**
     *  质量综述快捷输入确定
     */
    setQshortEvent: function (e) {
      let qDetail = this.data.projectDetail;
      let qualityNote = '';
      for (let execute of this.data.qshortcutList) {
        if (execute.checked) {
          qualityNote += execute.shortcutNote + ';';
        }
      }
      this.setData({
        qualityNote: qualityNote,
        qShortShow: false
      });
    },


    //获取返修记录
    getBackListInfo: function (p_no) {
      var that = this;
      return new Promise((resolve, reject) => {
        httpRequest.requestUrl({
          url: "project/backwork/list/" + p_no,
          method: "get"
        }).then(data => {
          this.setData({
            backList:data.list
          })
          resolve(p_no)
        })
      })
    },

    /**
     * 质量评分
     */
    qualityScoreEvent: function (e) {
      let score = e.detail.value;
      if (score > 100) {
        utils.TipModel("错误", "评分不能超过100", 1);
        score = 100;
      }
      this.setData({
        qualityScore: score
      })
    },
    /**
     *查看项目基本信息事件
    */
    viewPtWorkEvent: function (e) {
      let selected = this.data.ptworkSelected;
      this.setData({
        ptworkSelected: !selected
      })
    },
    /**
     * 查看返修记录
     */
    viewBackEvent: function (e) {
      let selected = this.data.backSelected;
      this.setData({
        backSelected: !selected
      })
    },
    /**
     * 返回
     */
    returnEvent: function (e) {
      wx.navigateBack({
        detla: 1
      });
    },

    //保存项目
    formSubmit: function (e) {
      var that = this;
      return new Promise((resolve, reject) => {
        httpRequest.requestUrl({
          url: "project/quality/save",
          params:{
            projectNo: this.data.p_no,
            qualityNote: this.data.qualityNote,
            qualityScore: this.data.qualityScore
          },
          method: "post"
        }).then(data => {
          wx.showModal({
            title: '提示',
            content: '提交操作成功',
            success(res) {
              if (res.confirm) {
                wx.navigateBack({
                  detla: 1
                });
              } else if (res.cancel) {
                wx.navigateBack({
                  detla: 1
                });
              }
            }
          })
          resolve(e)
        })
      })
    },

    /**
     * 提交质量核算
     */
    postToQuality: function () {

    },
    //质量评分
    qualityScoreLoadEvent: function (e) {
      wx.navigateTo({
        url: '../addQualityScore/addQualityScore?p_no=' + this.data.p_no,
      })
    },
    /**
     * 添加退回返修
     */
    repairNoteEvent: function (e) {
      this.setData({
        addBackShow: true
      });
    },
    /**
     * 返修短语更改
     */
    bshortChangeEvent: function (e) {
      this.setData({
        bindex: e.detail.value
      });
      let backNote = ''
      if (e.detail.value != 0) {
        backNote = this.data.bNameList[this.data.bindex];
      }
      this.setData({
        backNote: backNote
      });
    },
    /**
     * 返修短语填写
     */
    backNoteEvent: function (e) {
      this.setData({
        backNote: e.detail.value
      });
    },
    /**
     * 返修回退
     */
    backReturnEvent: function (e) {
      this.setData({
        addBackShow: false
      });
    },
    //提出返修事件提交
    postBackEvent: function (e) {
      var that = this;
      return new Promise((resolve, reject) => {
        httpRequest.requestUrl({
          url: "project/backwork/save",
            params: {
            backNote: this.data.backNote,
            projectNo:this.data.p_no
          },
          method: "post"
        }).then(data => {
          wx.showModal({
            title: '提示',
            content: '提交提出返修操作成功',
            success(res) {
              if (res.confirm) {
                wx.navigateBack({
                  detla: 1
                });
              } else if (res.cancel) {
                wx.navigateBack({
                  detla: 1
                });
              }
            }
          })
          resolve(e)
        })
      })
    },
 
    /**
     *提交至项目作业
    */
    postToWork: function (e) {
  
    },

    /**
     * 提交产值核算后更新时间
     */
    putFinishTime: function (e) {

    },

    /**
     * 提交产值核算后更新质量检查表中的提交用户
     */
    addQualityUser: function (e) {

    },

  })